using System.Net;
using System.Security.Cryptography;
using System.Text;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Application.Notifications.DTOs;
using InventorySaaS.Application.Notifications.Interfaces;
using InventorySaaS.Application.Users.DTOs;
using InventorySaaS.Application.Users.Interfaces;
using InventorySaaS.Domain.Entities;
using InventorySaaS.Domain.Enums;
using InventorySaaS.Infrastructure.Authentication;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Users;

public class TenantUserInvitationService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ICurrentUserContext currentUserContext,
    IEmailSender emailSender,
    IPlanLimitService planLimitService,
    ITenantNotificationWriter tenantNotificationWriter,
    IOptions<AppUrlSettings> appUrlSettings) : ITenantUserInvitationService
{
    private const int InvitationLifetimeHours = 72;
    private readonly AppUrlSettings urls = appUrlSettings.Value;

    private static readonly IReadOnlyDictionary<string, string> AllowedRoles =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [IdentitySeeder.AdminRole] = IdentitySeeder.AdminRole,
            [IdentitySeeder.WarehouseRole] = IdentitySeeder.WarehouseRole,
            [IdentitySeeder.ReadOnlyRole] = IdentitySeeder.ReadOnlyRole
        };

    public async Task<IReadOnlyCollection<TenantUserInvitationResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        await ExpirePendingInvitationsAsync(companyId, cancellationToken);

        var invitations = await context.TenantUserInvitations
            .AsNoTracking()
            .Where(invitation => invitation.CompanyId == companyId)
            .OrderByDescending(invitation => invitation.CreatedAt)
            .ToListAsync(cancellationToken);

        return invitations.Select(MapToResponse).ToArray();
    }

    public async Task<TenantUserInvitationResponse> CreateAsync(
        CreateTenantUserInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var currentUserId = currentUserContext.RequireUserId();
        var email = NormalizeEmail(request.Email);
        var role = await NormalizeAndValidateRoleAsync(request.Role);

        await EnsureEmailIsAvailableAsync(email);
        await ExpirePendingInvitationAsync(companyId, email, cancellationToken);
        await EnsureNoPendingInvitationAsync(companyId, email, cancellationToken);

        var company = await GetActiveCompanyAsync(companyId, cancellationToken);
        var token = CreateToken();
        var now = DateTime.UtcNow;
        var invitation = new TenantUserInvitation
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Email = email,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Role = role,
            TokenHash = HashToken(token),
            Status = TenantUserInvitationStatus.Pending,
            ExpiresAt = now.AddHours(InvitationLifetimeHours),
            CreatedAt = now,
            CreatedByUserId = currentUserId
        };

        context.TenantUserInvitations.Add(invitation);
        await context.SaveChangesAsync(cancellationToken);
        await SendInvitationEmailAsync(invitation, company, token, cancellationToken);

        return MapToResponse(invitation);
    }

    public async Task<TenantUserInvitationResponse> ResendAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var invitation = await FindTenantInvitationAsync(id, companyId, cancellationToken);

        EnsurePending(invitation);
        await EnsureEmailIsAvailableAsync(invitation.Email);

        var company = await GetActiveCompanyAsync(companyId, cancellationToken);
        var token = CreateToken();
        invitation.TokenHash = HashToken(token);
        invitation.ExpiresAt = DateTime.UtcNow.AddHours(InvitationLifetimeHours);

        await context.SaveChangesAsync(cancellationToken);
        await SendInvitationEmailAsync(invitation, company, token, cancellationToken);

        return MapToResponse(invitation);
    }

    public async Task<TenantUserInvitationResponse> CancelAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var companyId = currentUserContext.RequireCompanyId();
        var invitation = await FindTenantInvitationAsync(id, companyId, cancellationToken);

        EnsurePending(invitation);

        invitation.Status = TenantUserInvitationStatus.Cancelled;
        invitation.CancelledAt = DateTime.UtcNow;
        invitation.CancelledByUserId = currentUserContext.RequireUserId();

        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(invitation);
    }

    public async Task<ValidateTenantUserInvitationResponse> ValidateAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var invitation = await FindValidInvitationByTokenAsync(token, cancellationToken);
        var company = await GetActiveCompanyAsync(invitation.CompanyId, cancellationToken);

        return new ValidateTenantUserInvitationResponse
        {
            CompanyName = company.CommercialName ?? company.Name,
            Email = invitation.Email,
            FirstName = invitation.FirstName,
            LastName = invitation.LastName,
            Role = invitation.Role,
            ExpiresAt = invitation.ExpiresAt
        };
    }

    public async Task<MessageResponse> AcceptAsync(
        AcceptTenantUserInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        var invitation = await FindValidInvitationByTokenAsync(request.Token, cancellationToken);
        await GetActiveCompanyAsync(invitation.CompanyId, cancellationToken);
        await EnsureEmailIsAvailableAsync(invitation.Email);
        await planLimitService.EnsureCanCreateUserAsync(invitation.CompanyId, cancellationToken);

        var role = await NormalizeAndValidateRoleAsync(invitation.Role);
        var user = new ApplicationUser
        {
            UserName = invitation.Email,
            Email = invitation.Email,
            EmailConfirmed = true,
            CompanyId = invitation.CompanyId,
            FirstName = invitation.FirstName,
            LastName = invitation.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var createResult = await userManager.CreateAsync(user, request.Password);
            EnsureIdentitySucceeded(createResult, "Could not create invited user.");

            var roleResult = await userManager.AddToRoleAsync(user, role);
            EnsureIdentitySucceeded(roleResult, "Could not assign invited user role.");

            invitation.Status = TenantUserInvitationStatus.Accepted;
            invitation.AcceptedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        await tenantNotificationWriter.WriteAsync(
            new CreateTenantNotificationRequest
            {
                CompanyId = invitation.CompanyId,
                Title = "Invitación aceptada",
                Message = $"{invitation.FirstName} {invitation.LastName} aceptó la invitación y ya forma parte de la empresa.",
                Type = TenantNotificationType.InvitationAccepted,
                Severity = TenantNotificationSeverity.Success,
                ActionUrl = "/admin/users"
            },
            cancellationToken);

        return new MessageResponse
        {
            Message = "Invitación aceptada correctamente. Ya puedes iniciar sesión en LOGENT."
        };
    }

    private async Task<TenantUserInvitation> FindValidInvitationByTokenAsync(
        string token,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw InvalidInvitation();
        }

        var tokenHash = HashToken(token);
        var invitation = await context.TenantUserInvitations
            .FirstOrDefaultAsync(item => item.TokenHash == tokenHash, cancellationToken);

        if (invitation is null || invitation.Status is not TenantUserInvitationStatus.Pending)
        {
            throw InvalidInvitation();
        }

        if (invitation.ExpiresAt <= DateTime.UtcNow)
        {
            invitation.Status = TenantUserInvitationStatus.Expired;
            await context.SaveChangesAsync(cancellationToken);
            throw ExpiredInvitation();
        }

        return invitation;
    }

    private async Task<TenantUserInvitation> FindTenantInvitationAsync(
        Guid id,
        Guid companyId,
        CancellationToken cancellationToken)
    {
        return await context.TenantUserInvitations
            .FirstOrDefaultAsync(
                invitation => invitation.Id == id && invitation.CompanyId == companyId,
                cancellationToken)
            ?? throw new ApiException(
                404,
                "Invitation not found.",
                "No invitation was found with the provided id.");
    }

    private async Task<Company> GetActiveCompanyAsync(Guid companyId, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == companyId, cancellationToken)
            ?? throw new ApiException(404, "Company not found.", "The invitation company no longer exists.");

        if (!company.IsActive)
        {
            throw new ApiException(
                403,
                "Company access is suspended.",
                "Contact the company administrator before accepting this invitation.");
        }

        return company;
    }

    private async Task EnsureEmailIsAvailableAsync(string email)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            throw new ApiException(
                400,
                "A user with this email already exists.",
                "Use a different email address for this invitation.");
        }
    }

    private async Task EnsureNoPendingInvitationAsync(
        Guid companyId,
        string email,
        CancellationToken cancellationToken)
    {
        var exists = await context.TenantUserInvitations
            .AsNoTracking()
            .AnyAsync(
                invitation =>
                    invitation.CompanyId == companyId
                    && invitation.Email == email
                    && invitation.Status == TenantUserInvitationStatus.Pending,
                cancellationToken);

        if (exists)
        {
            throw new ApiException(
                400,
                "A pending invitation already exists for this email.",
                "Resend or cancel the existing invitation before creating another one.");
        }
    }

    private async Task ExpirePendingInvitationAsync(
        Guid companyId,
        string email,
        CancellationToken cancellationToken)
    {
        var invitations = await context.TenantUserInvitations
            .Where(
                invitation =>
                    invitation.CompanyId == companyId
                    && invitation.Email == email
                    && invitation.Status == TenantUserInvitationStatus.Pending
                    && invitation.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        if (invitations.Count == 0)
        {
            return;
        }

        invitations.ForEach(invitation => invitation.Status = TenantUserInvitationStatus.Expired);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task ExpirePendingInvitationsAsync(Guid companyId, CancellationToken cancellationToken)
    {
        var invitations = await context.TenantUserInvitations
            .Where(
                invitation =>
                    invitation.CompanyId == companyId
                    && invitation.Status == TenantUserInvitationStatus.Pending
                    && invitation.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        if (invitations.Count == 0)
        {
            return;
        }

        invitations.ForEach(invitation => invitation.Status = TenantUserInvitationStatus.Expired);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> NormalizeAndValidateRoleAsync(string role)
    {
        var normalizedRole = role.Trim();

        if (!AllowedRoles.TryGetValue(normalizedRole, out var canonicalRole)
            || !await roleManager.RoleExistsAsync(canonicalRole))
        {
            throw new ApiException(
                400,
                "Invalid role.",
                $"Role must be one of: {string.Join(", ", AllowedRoles.Values)}.");
        }

        return canonicalRole;
    }

    private async Task SendInvitationEmailAsync(
        TenantUserInvitation invitation,
        Company company,
        string token,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(urls.FrontendBaseUrl))
        {
            throw new InvalidOperationException("Application URL settings are not configured. Configure AppUrls:FrontendBaseUrl.");
        }

        var invitationUrl =
            $"{urls.FrontendBaseUrl.TrimEnd('/')}/accept-invitation?token={Uri.EscapeDataString(token)}";
        var rawCompanyName = company.CommercialName ?? company.Name;
        var companyName = WebUtility.HtmlEncode(rawCompanyName);
        var recipientName = WebUtility.HtmlEncode($"{invitation.FirstName} {invitation.LastName}".Trim());
        var safeRole = WebUtility.HtmlEncode(invitation.Role);
        var safeUrl = WebUtility.HtmlEncode(invitationUrl);
        var body = $"""
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                <h2 style="margin-bottom: 16px;">Te invitaron a LOGENT</h2>
                <p>Hola, {recipientName}.</p>
                <p><strong>{companyName}</strong> te invitó a formar parte de su operación en LOGENT con el rol <strong>{safeRole}</strong>.</p>
                <p>La invitación estará disponible durante {InvitationLifetimeHours} horas.</p>
                <p style="margin: 24px 0;">
                    <a href="{safeUrl}" style="display: inline-block; border-radius: 6px; background: #1017d8; color: #ffffff; padding: 12px 18px; text-decoration: none;">
                        Aceptar invitación
                    </a>
                </p>
                <p>Si el botón no funciona, abre este enlace:</p>
                <p><a href="{safeUrl}">{safeUrl}</a></p>
                <p>Si no esperabas esta invitación, puedes ignorar este mensaje.</p>
            </div>
            """;

        await emailSender.SendEmailAsync(invitation.Email, $"Invitación a {rawCompanyName} en LOGENT", body, cancellationToken);
    }

    private static string CreateToken()
    {
        return WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static void EnsurePending(TenantUserInvitation invitation)
    {
        if (invitation.Status is not TenantUserInvitationStatus.Pending || invitation.ExpiresAt <= DateTime.UtcNow)
        {
            throw new ApiException(
                400,
                "Invitation is not pending.",
                "Only pending, non-expired invitations can be changed.");
        }
    }

    private static TenantUserInvitationResponse MapToResponse(TenantUserInvitation invitation)
    {
        return new TenantUserInvitationResponse
        {
            Id = invitation.Id,
            Email = invitation.Email,
            FirstName = invitation.FirstName,
            LastName = invitation.LastName,
            Role = invitation.Role,
            Status = invitation.Status,
            ExpiresAt = invitation.ExpiresAt,
            AcceptedAt = invitation.AcceptedAt,
            CreatedAt = invitation.CreatedAt,
            CancelledAt = invitation.CancelledAt
        };
    }

    private static ApiException InvalidInvitation()
    {
        return new ApiException(
            400,
            "Invalid invitation.",
            "The invitation link is invalid, cancelled, accepted, or no longer available.");
    }

    private static ApiException ExpiredInvitation()
    {
        return new ApiException(
            400,
            "Invitation expired.",
            "Ask the company administrator to create a new invitation.");
    }

    private static void EnsureIdentitySucceeded(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = result.Errors.Select(error => error.Description).ToArray();

        throw new ApiException(400, message, string.Join("; ", errors), errors);
    }
}
