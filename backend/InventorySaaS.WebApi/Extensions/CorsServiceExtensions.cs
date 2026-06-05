namespace InventorySaaS.WebApi.Extensions;

public static class CorsServiceExtensions
{
    public const string FrontendCorsPolicy = "FrontendCorsPolicy";

    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(FrontendCorsPolicy, policy =>
            {
                var configuredOrigins = configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>()
                    ?.Where(origin => !string.IsNullOrWhiteSpace(origin))
                    .ToArray()
                    ?? [];

                var allowedOrigins = environment.IsDevelopment()
                    ? configuredOrigins
                        .Concat(["http://localhost:3000", "http://localhost:5173"])
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToArray()
                    : configuredOrigins;

                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins);
                }

                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
}
