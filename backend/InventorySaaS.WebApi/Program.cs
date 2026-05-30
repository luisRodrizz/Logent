using FluentValidation;
using InventorySaaS.Application.Categories.Validators;
using InventorySaaS.Infrastructure;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.Infrastructure.Persistence;
using InventorySaaS.WebApi.Common;
using InventorySaaS.WebApi.Extensions;
using InventorySaaS.WebApi.Middleware;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.WebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Text.Json.Serialization;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((_, loggerConfiguration) =>
    {
        loggerConfiguration.WriteTo.Console();
    });

    builder.Services
        .AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
    builder.Services.Configure<ApiBehaviorOptions>(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Values
                .SelectMany(entry => entry.Errors)
                .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                    ? "The request payload is invalid."
                    : error.ErrorMessage);

            return ApiErrorResponseFactory.Validation(context.HttpContext, errors);
        };
    });
    builder.Services.AddValidatorsFromAssemblyContaining<CreateCategoryRequestValidator>();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ICurrentUserContext, CurrentUserContext>();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddJwtAuthentication(builder.Configuration);
    builder.Services.AddCorsPolicy();
    builder.Services.AddSwaggerDocumentation();

    var app = builder.Build();

    app.UseMiddleware<ExceptionHandlingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors(CorsServiceExtensions.FrontendCorsPolicy);
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    using (var scope = app.Services.CreateScope())
    {
        await IdentitySeeder.SeedAsync(scope.ServiceProvider);

        if (app.Environment.IsDevelopment())
        {
            await DemoDataSeeder.SeedAsync(scope.ServiceProvider);
        }
    }

    app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
