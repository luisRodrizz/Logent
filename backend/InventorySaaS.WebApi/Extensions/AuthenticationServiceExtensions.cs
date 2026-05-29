using System.Text;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace InventorySaaS.WebApi.Extensions;

public static class AuthenticationServiceExtensions
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"]
                            ?? throw new InvalidOperationException("Missing Jwt:Key configuration.")))
                };

                options.Events = new JwtBearerEvents
                {
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();

                        if (context.Response.HasStarted)
                        {
                            return;
                        }

                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";

                        var response = ApiErrorResponseFactory.Create(
                            context.HttpContext,
                            StatusCodes.Status401Unauthorized,
                            "Authentication is required.",
                            "You must provide a valid access token.");

                        await context.Response.WriteAsJsonAsync(response);
                    },
                    OnForbidden = async context =>
                    {
                        if (context.Response.HasStarted)
                        {
                            return;
                        }

                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";

                        var response = ApiErrorResponseFactory.Create(
                            context.HttpContext,
                            StatusCodes.Status403Forbidden,
                            "You do not have permission to access this resource.",
                            "Admin role is required.");

                        await context.Response.WriteAsJsonAsync(response);
                    }
                };
            });

        services.AddAuthorization();

        return services;
    }
}
