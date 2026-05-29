using InventorySaaS.Application.Common.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Common;

public static class ApiErrorResponseFactory
{
    public static ApiErrorResponse Create(
        HttpContext httpContext,
        int statusCode,
        string message,
        string? detail = null,
        IEnumerable<string>? errors = null)
    {
        return new ApiErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Detail = detail,
            Errors = errors?.ToArray(),
            TraceId = httpContext.TraceIdentifier,
            Timestamp = DateTime.UtcNow
        };
    }

    public static ObjectResult Result(
        HttpContext httpContext,
        int statusCode,
        string message,
        string? detail = null,
        IEnumerable<string>? errors = null)
    {
        return new ObjectResult(Create(httpContext, statusCode, message, detail, errors))
        {
            StatusCode = statusCode
        };
    }

    public static BadRequestObjectResult Validation(HttpContext httpContext, IEnumerable<string> errors)
    {
        return new BadRequestObjectResult(Create(
            httpContext,
            StatusCodes.Status400BadRequest,
            "Validation failed.",
            errors: errors));
    }
}
