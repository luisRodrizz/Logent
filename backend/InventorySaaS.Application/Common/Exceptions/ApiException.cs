namespace InventorySaaS.Application.Common.Exceptions;

public class ApiException : Exception
{
    public ApiException(
        int statusCode,
        string message,
        string? detail = null,
        IEnumerable<string>? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Detail = detail;
        Errors = errors?.ToArray();
    }

    public int StatusCode { get; }

    public string? Detail { get; }

    public IReadOnlyCollection<string>? Errors { get; }
}
