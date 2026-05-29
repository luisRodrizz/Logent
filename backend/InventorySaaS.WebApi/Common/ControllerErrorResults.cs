using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Common;

public static class ControllerErrorResults
{
    public static BadRequestObjectResult ApiValidation(
        this ControllerBase controller,
        IEnumerable<string> errors)
    {
        return ApiErrorResponseFactory.Validation(controller.HttpContext, errors);
    }

    public static ObjectResult ApiUnauthorized(this ControllerBase controller)
    {
        return ApiErrorResponseFactory.Result(
            controller.HttpContext,
            StatusCodes.Status401Unauthorized,
            "Authentication is required.",
            "You must provide a valid access token.");
    }

    public static ObjectResult ApiNotFound(
        this ControllerBase controller,
        string message = "Resource not found.",
        string detail = "No resource was found with the provided id.")
    {
        return ApiErrorResponseFactory.Result(
            controller.HttpContext,
            StatusCodes.Status404NotFound,
            message,
            detail);
    }
}
