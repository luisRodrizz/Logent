using InventorySaaS.Application.Common.Interfaces;

namespace InventorySaaS.WebApi.Middleware;

public class SubscriptionAccessMiddleware(RequestDelegate next)
{
    private static readonly string[] CriticalResourcePaths =
    [
        "/api/categories",
        "/api/suppliers",
        "/api/warehouses",
        "/api/products",
        "/api/movements",
        "/api/users"
    ];

    private static readonly HashSet<string> WriteMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Post,
        HttpMethods.Put,
        HttpMethods.Patch,
        HttpMethods.Delete
    };

    public async Task InvokeAsync(
        HttpContext context,
        ICurrentUserContext currentUserContext,
        ISubscriptionAccessService subscriptionAccessService)
    {
        if (!ShouldEnforce(context, currentUserContext))
        {
            await next(context);
            return;
        }

        await subscriptionAccessService.EnsureCanPerformCriticalWriteAsync(
            currentUserContext.RequireCompanyId(),
            context.RequestAborted);

        await next(context);
    }

    private static bool ShouldEnforce(HttpContext context, ICurrentUserContext currentUserContext)
    {
        if (!currentUserContext.IsAuthenticated || currentUserContext.IsSuperAdmin)
        {
            return false;
        }

        if (!WriteMethods.Contains(context.Request.Method))
        {
            return false;
        }

        if (context.Request.Path.Equals("/api/users/invitations/accept", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return CriticalResourcePaths.Any(path => context.Request.Path.StartsWithSegments(path));
    }
}
