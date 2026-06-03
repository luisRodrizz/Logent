using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using InventorySaaS.Application.Common.Exceptions;
using InventorySaaS.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StorageImageUploadResult = InventorySaaS.Application.Common.DTOs.ImageUploadResult;

namespace InventorySaaS.Infrastructure.Cloudinary;

public class CloudinaryImageService(
    IOptions<CloudinarySettings> options,
    ILogger<CloudinaryImageService> logger) : IImageStorageService
{
    private const string CompanyLogoPublicId = "company-logo";

    private readonly CloudinarySettings settings = options.Value;

    public async Task<StorageImageUploadResult> UploadCompanyLogoAsync(
        Guid companyId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var publicId = GetCompanyLogoPublicId(companyId);
        var cloudinary = CreateCloudinary();

        logger.LogInformation(
            "Cloudinary SDK upload prepared. CloudName: {CloudName}. ApiKeyConfigured: {ApiKeyConfigured}. ApiSecretConfigured: {ApiSecretConfigured}. PublicId: {PublicId}. ContentType: {ContentType}",
            settings.CloudName,
            !string.IsNullOrWhiteSpace(settings.ApiKey),
            !string.IsNullOrWhiteSpace(settings.ApiSecret),
            publicId,
            contentType);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            PublicId = publicId,
            Overwrite = true,
            UseFilename = false,
            UniqueFilename = false
        };

        var uploadResult = await cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (uploadResult.Error is not null)
        {
            logger.LogWarning(
                "Cloudinary SDK upload failed. PublicId: {PublicId}. Error: {CloudinaryError}",
                publicId,
                uploadResult.Error.Message);

            throw new ApiException(
                502,
                "Could not upload company logo.",
                uploadResult.Error.Message);
        }

        if (uploadResult.SecureUrl is null || string.IsNullOrWhiteSpace(uploadResult.SecureUrl.ToString()))
        {
            throw new ApiException(
                502,
                "Could not upload company logo.",
                "Cloudinary did not return a secure image URL.");
        }

        logger.LogInformation(
            "Cloudinary SDK upload succeeded. PublicId: {PublicId}. ResultPublicId: {ResultPublicId}",
            publicId,
            uploadResult.PublicId);

        return new StorageImageUploadResult
        {
            PublicId = uploadResult.PublicId ?? publicId,
            Url = uploadResult.SecureUrl.ToString()
        };
    }

    public async Task DeleteCompanyLogoAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        if (!settings.IsConfigured)
        {
            return;
        }

        var publicId = GetCompanyLogoPublicId(companyId);
        var cloudinary = CreateCloudinary();
        var deleteParams = new DeletionParams(publicId)
        {
            ResourceType = ResourceType.Image
        };

        var deleteResult = await cloudinary.DestroyAsync(deleteParams);

        logger.LogInformation(
            "Cloudinary SDK delete completed. PublicId: {PublicId}. Result: {Result}",
            publicId,
            deleteResult.Result);
    }

    private CloudinaryDotNet.Cloudinary CreateCloudinary()
    {
        var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);

        return new CloudinaryDotNet.Cloudinary(account);
    }

    private void EnsureConfigured()
    {
        if (settings.IsConfigured)
        {
            return;
        }

        throw new ApiException(
            500,
            "Cloudinary configuration is missing.",
            "Configure Cloudinary:CloudName, Cloudinary:ApiKey and Cloudinary:ApiSecret.");
    }

    private static string GetCompanyLogoPublicId(Guid companyId)
    {
        return $"logent/companies/{companyId}/logo/{CompanyLogoPublicId}";
    }
}
