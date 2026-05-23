using System.Net;
using InventorySaaS.Application.Common.DTOs;

namespace InventorySaaS.WebApi.Middleware;

public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IWebHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = GetStatusCode(exception);
        var message = GetMessage(exception, statusCode);

        if (statusCode == (int)HttpStatusCode.InternalServerError)
        {
            logger.LogError(
                exception,
                "Unhandled exception for request {Method} {Path}. TraceId: {TraceId}",
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Handled exception for request {Method} {Path}. TraceId: {TraceId}",
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier);
        }

        var response = new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Detail = environment.IsDevelopment() ? exception.Message : null,
            TraceId = context.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(response);
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedAccessException => (int)HttpStatusCode.Forbidden,
            _ => (int)HttpStatusCode.InternalServerError
        };
    }

    private static string GetMessage(Exception exception, int statusCode)
    {
        return exception switch
        {
            InvalidOperationException => exception.Message,
            KeyNotFoundException => exception.Message,
            UnauthorizedAccessException => exception.Message,
            _ when statusCode == (int)HttpStatusCode.InternalServerError => "An unexpected error occurred.",
            _ => exception.Message
        };
    }
}
