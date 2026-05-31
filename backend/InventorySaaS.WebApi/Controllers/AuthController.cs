using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Auth.Interfaces;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ApplicationDbContext context,
    IJwtTokenService jwtTokenService,
    ICompanyRegistrationService companyRegistrationService,
    IEmailConfirmationService emailConfirmationService,
    IPasswordRecoveryService passwordRecoveryService,
    IValidator<RegisterCompanyRequest> registerCompanyValidator,
    IValidator<ResendConfirmationEmailRequest> resendConfirmationEmailValidator,
    IValidator<ForgotPasswordRequest> forgotPasswordValidator,
    IValidator<ResetPasswordRequest> resetPasswordValidator) : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.Ordinal)
    {
        IdentitySeeder.AdminRole,
        IdentitySeeder.WarehouseRole,
        IdentitySeeder.ReadOnlyRole
    };

    [AllowAnonymous]
    [HttpPost("register-company")]
    public async Task<ActionResult<MessageResponse>> RegisterCompany(
        RegisterCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await registerCompanyValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        return Ok(await companyRegistrationService.RegisterAsync(request, cancellationToken));
    }

    [AllowAnonymous]
    [HttpGet("confirm-email")]
    public async Task<ActionResult<MessageResponse>> ConfirmEmail(
        [FromQuery] string? userId,
        [FromQuery] string? token,
        CancellationToken cancellationToken)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(userId))
        {
            errors.Add("User id is required.");
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            errors.Add("Email confirmation token is required.");
        }

        if (errors.Count > 0)
        {
            return ApiErrorResponseFactory.Validation(HttpContext, errors);
        }

        return Ok(await emailConfirmationService.ConfirmEmailAsync(userId!, token!, cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("resend-confirmation-email")]
    public async Task<ActionResult<MessageResponse>> ResendConfirmationEmail(
        ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await resendConfirmationEmailValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        return Ok(await emailConfirmationService.ResendConfirmationEmailAsync(request.Email, cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<MessageResponse>> ForgotPassword(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await forgotPasswordValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        return Ok(await passwordRecoveryService.ForgotPasswordAsync(request, cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<ActionResult<MessageResponse>> ResetPassword(
        ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await resetPasswordValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                validationResult.Errors.Select(error => error.ErrorMessage));
        }

        return Ok(await passwordRecoveryService.ResetPasswordAsync(request, cancellationToken));
    }

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var role = request.Role.Trim();

        if (!AllowedRoles.Contains(role))
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "Invalid role.",
                $"Role must be one of: {string.Join(", ", AllowedRoles)}.");
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "A user with this email already exists.",
                "A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            CompanyId = await GetCurrentUserCompanyIdAsync(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                createResult.Errors.Select(error => error.Description));
        }

        var roleResult = await userManager.AddToRoleAsync(user, role);

        if (!roleResult.Succeeded)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                roleResult.Errors.Select(error => error.Description));
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is null)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Invalid email or password.",
                "The provided credentials are not valid.");
        }

        if (!user.IsActive)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "User account is inactive.",
                "Contact an administrator to reactivate this account.");
        }

        var signInResult = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);

        if (!signInResult.Succeeded)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Invalid email or password.",
                "The provided credentials are not valid.");
        }

        if (!user.EmailConfirmed)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Debes confirmar tu correo electrónico antes de iniciar sesión.",
                "Revisa tu bandeja de entrada o solicita un nuevo enlace de confirmación.");
        }

        if (user.CompanyId.HasValue)
        {
            var companyIsActive = await context.Companies
                .AnyAsync(
                    company => company.Id == user.CompanyId.Value && company.IsActive,
                    cancellationToken);

            if (!companyIsActive)
            {
                return ApiErrorResponseFactory.Result(
                    HttpContext,
                    StatusCodes.Status403Forbidden,
                    "La empresa asociada a tu cuenta se encuentra suspendida.",
                    "Contacta al administrador de LOGENT.");
            }
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                "You must provide a valid access token.");
        }

        var user = await userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                "You must provide a valid access token.");
        }

        if (!user.IsActive)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "User account is inactive.",
                "Contact an administrator to reactivate this account.");
        }

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new CurrentUserResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = roles
        });
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var email = user.Email ?? string.Empty;

        return new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user.Id, email, roles, user.CompanyId),
            Email = email,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = roles,
            ExpiresAt = jwtTokenService.GetExpirationTime()
        };
    }

    private async Task<Guid?> GetCurrentUserCompanyIdAsync()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(currentUserId))
        {
            return DemoTenantDefaults.CompanyId;
        }

        var currentUser = await userManager.FindByIdAsync(currentUserId);

        return currentUser?.CompanyId ?? DemoTenantDefaults.CompanyId;
    }
}
