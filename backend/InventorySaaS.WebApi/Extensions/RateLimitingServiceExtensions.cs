using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace InventorySaaS.WebApi.Extensions;

public static class RateLimitingServiceExtensions
{
    public static IServiceCollection AddSecurityRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                if (!TryGetSensitiveEndpoint(context, out var endpointKey, out var limiterOptions))
                {
                    return RateLimitPartition.GetNoLimiter("default");
                }

                var clientKey = GetClientKey(context);

                return RateLimitPartition.GetFixedWindowLimiter(
                    $"{clientKey}:{endpointKey}",
                    _ => limiterOptions);
            });

            options.OnRejected = async (context, cancellationToken) =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("SecurityRateLimiting");

                logger.LogWarning(
                    "Rate limit applied for {Method} {Path} from {ClientIp}.",
                    context.HttpContext.Request.Method,
                    context.HttpContext.Request.Path,
                    context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

                if (context.HttpContext.Response.HasStarted)
                {
                    return;
                }

                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";

                var response = ApiErrorResponseFactory.Create(
                    context.HttpContext,
                    StatusCodes.Status429TooManyRequests,
                    "Too many attempts.",
                    "Wait a few minutes before trying again.");

                await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken);
            };
        });

        return services;
    }

    private static bool TryGetSensitiveEndpoint(
        HttpContext context,
        out string endpointKey,
        out FixedWindowRateLimiterOptions limiterOptions)
    {
        endpointKey = string.Empty;
        limiterOptions = new FixedWindowRateLimiterOptions();

        if (!HttpMethods.IsPost(context.Request.Method))
        {
            return false;
        }

        var path = context.Request.Path.Value?.TrimEnd('/').ToLowerInvariant();

        (int permitLimit, TimeSpan window)? rule = path switch
        {
            "/api/auth/login" => (10, TimeSpan.FromMinutes(5)),
            "/api/auth/register-company" => (5, TimeSpan.FromMinutes(10)),
            "/api/auth/forgot-password" => (5, TimeSpan.FromMinutes(10)),
            "/api/auth/reset-password" => (10, TimeSpan.FromMinutes(10)),
            "/api/auth/resend-confirmation-email" => (5, TimeSpan.FromMinutes(10)),
            "/api/users/invitations/accept" => (10, TimeSpan.FromMinutes(10)),
            _ => null
        };

        if (rule is null)
        {
            return false;
        }

        endpointKey = path ?? "unknown";
        limiterOptions = new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = rule.Value.permitLimit,
            QueueLimit = 0,
            Window = rule.Value.window
        };

        return true;
    }

    private static string GetClientKey(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
