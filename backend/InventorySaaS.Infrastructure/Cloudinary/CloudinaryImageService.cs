using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace InventorySaaS.Infrastructure.Cloudinary;

public class CloudinaryImageService(HttpClient httpClient, IOptions<CloudinarySettings> options) : IImageStorageService
{
    private const string CompanyLogoPublicId = "company-logo";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly CloudinarySettings settings = options.Value;

    public async Task<ImageUploadResult> UploadCompanyLogoAsync(
        Guid companyId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var folder = GetCompanyLogoFolder(companyId);
        var timestamp = GetTimestamp();
        var signatureParameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["folder"] = folder,
            ["overwrite"] = "true",
            ["public_id"] = CompanyLogoPublicId,
            ["timestamp"] = timestamp
        };

        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(fileStream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        content.Add(fileContent, "file", fileName);
        AddParameters(content, signatureParameters);
        content.Add(new StringContent(settings.ApiKey), "api_key");
        content.Add(new StringContent(CreateSignature(signatureParameters)), "signature");

        using var response = await httpClient.PostAsync(GetUploadUrl(), content, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new ApiException(
                502,
                "Could not upload company logo.",
                "Cloudinary did not accept the image upload request.");
        }

        var result = JsonSerializer.Deserialize<CloudinaryUploadResponse>(body, JsonOptions);

        if (string.IsNullOrWhiteSpace(result?.SecureUrl))
        {
            throw new ApiException(
                502,
                "Could not upload company logo.",
                "Cloudinary did not return a secure image URL.");
        }

        return new ImageUploadResult
        {
            PublicId = result.PublicId ?? GetCompanyLogoPublicId(companyId),
            Url = result.SecureUrl
        };
    }

    public async Task DeleteCompanyLogoAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        if (!settings.IsConfigured)
        {
            return;
        }

        var timestamp = GetTimestamp();
        var signatureParameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["invalidate"] = "true",
            ["public_id"] = GetCompanyLogoPublicId(companyId),
            ["timestamp"] = timestamp
        };

        using var content = new MultipartFormDataContent();
        AddParameters(content, signatureParameters);
        content.Add(new StringContent(settings.ApiKey), "api_key");
        content.Add(new StringContent(CreateSignature(signatureParameters)), "signature");

        using var response = await httpClient.PostAsync(GetDestroyUrl(), content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return;
        }
    }

    private static void AddParameters(MultipartFormDataContent content, IReadOnlyDictionary<string, string> parameters)
    {
        foreach (var parameter in parameters)
        {
            content.Add(new StringContent(parameter.Value), parameter.Key);
        }
    }

    private string CreateSignature(IReadOnlyDictionary<string, string> parameters)
    {
        var payload = string.Join("&", parameters.Select(parameter => $"{parameter.Key}={parameter.Value}"))
            + settings.ApiSecret;
        var hash = SHA1.HashData(Encoding.UTF8.GetBytes(payload));

        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private void EnsureConfigured()
    {
        if (settings.IsConfigured)
        {
            return;
        }

        throw new ApiException(
            500,
            "Cloudinary is not configured.",
            "Configure Cloudinary:CloudName, Cloudinary:ApiKey and Cloudinary:ApiSecret.");
    }

    private static string GetCompanyLogoFolder(Guid companyId)
    {
        return $"logent/companies/{companyId}/logo";
    }

    private static string GetCompanyLogoPublicId(Guid companyId)
    {
        return $"{GetCompanyLogoFolder(companyId)}/{CompanyLogoPublicId}";
    }

    private string GetUploadUrl()
    {
        return $"https://api.cloudinary.com/v1_1/{settings.CloudName}/image/upload";
    }

    private string GetDestroyUrl()
    {
        return $"https://api.cloudinary.com/v1_1/{settings.CloudName}/image/destroy";
    }

    private static string GetTimestamp()
    {
        return DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
    }

    private sealed class CloudinaryUploadResponse
    {
        [JsonPropertyName("public_id")]
        public string? PublicId { get; set; }

        [JsonPropertyName("secure_url")]
        public string? SecureUrl { get; set; }
    }
}
