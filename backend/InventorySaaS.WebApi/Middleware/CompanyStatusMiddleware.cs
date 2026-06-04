using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using InventorySaaS.WebApi.Common;
using Microsoft.EntityFrameworkCore;

namespace InventorySaaS.WebApi.Middleware;

public class CompanyStatusMiddleware(RequestDelegate next)
{
    private const string CompanyIdClaimType = "companyId";

    private static readonly HashSet<string> ExemptPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/auth/login",
        "/api/auth/register-company",
        "/api/auth/confirm-email",
        "/api/auth/me",
        "/api/auth/resend-confirmation-email",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/profile"
    };

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        if (!ShouldValidateCompany(context))
        {
            await next(context);
            return;
        }

        var companyIdValue = context.User.FindFirst(CompanyIdClaimType)?.Value;

        if (!Guid.TryParse(companyIdValue, out var companyId))
        {
            await WriteForbiddenAsync(
                context,
                "Company context is required.",
                "The authenticated user is not associated with a company.");
            return;
        }

        var companyIsActive = await dbContext.Companies
            .AsNoTracking()
            .AnyAsync(company => company.Id == companyId && company.IsActive, context.RequestAborted);

        if (!companyIsActive)
        {
            await WriteForbiddenAsync(
                context,
                "La empresa asociada a tu cuenta se encuentra suspendida.",
                "Contacta al administrador de LOGENT.");
            return;
        }

        await next(context);
    }

    private static bool ShouldValidateCompany(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return false;
        }

        if (context.User.IsInRole(IdentitySeeder.SuperAdminRole))
        {
            return false;
        }

        var path = context.Request.Path.Value ?? string.Empty;

        return !ExemptPaths.Contains(path)
            && !context.Request.Path.StartsWithSegments("/api/profile")
            && !context.Request.Path.StartsWithSegments("/api/platform")
            && !context.Request.Path.StartsWithSegments("/swagger");
    }

    private static async Task WriteForbiddenAsync(HttpContext context, string message, string detail)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "application/json";

        var response = ApiErrorResponseFactory.Create(
            context,
            StatusCodes.Status403Forbidden,
            message,
            detail);

        await context.Response.WriteAsJsonAsync(response);
    }
}
