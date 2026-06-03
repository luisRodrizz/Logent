using FluentValidation;
using InventorySaaS.Application.TenantCompanySettings.DTOs;

namespace InventorySaaS.Application.TenantCompanySettings.Validators;

public class UpdateTenantCompanySettingsRequestValidator : AbstractValidator<UpdateTenantCompanySettingsRequest>
{
    public UpdateTenantCompanySettingsRequestValidator()
    {
        RuleFor(company => company.CommercialName)
            .MaximumLength(150);

        RuleFor(company => company.Address)
            .MaximumLength(250);

        RuleFor(company => company.Phone)
            .MaximumLength(30);

        RuleFor(company => company.ContactEmail)
            .MaximumLength(150)
            .EmailAddress()
            .When(company => !string.IsNullOrWhiteSpace(company.ContactEmail));

        RuleFor(company => company.Website)
            .MaximumLength(200)
            .Must(BeValidHttpUrl)
            .When(company => !string.IsNullOrWhiteSpace(company.Website))
            .WithMessage("Website must be a valid URL.");

        RuleFor(company => company.LogoUrl)
            .MaximumLength(500)
            .Must(BeValidHttpUrl)
            .When(company => !string.IsNullOrWhiteSpace(company.LogoUrl))
            .WithMessage("LogoUrl must be a valid URL.");
    }

    private static bool BeValidHttpUrl(string? value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
