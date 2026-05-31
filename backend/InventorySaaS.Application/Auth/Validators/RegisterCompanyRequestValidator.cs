using FluentValidation;
using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Validators;

public class RegisterCompanyRequestValidator : AbstractValidator<RegisterCompanyRequest>
{
    public RegisterCompanyRequestValidator()
    {
        RuleFor(request => request.CompanyName)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(request => request.Ruc)
            .MaximumLength(20);

        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(160);

        RuleFor(request => request.Phone)
            .MaximumLength(30);

        RuleFor(request => request.Address)
            .MaximumLength(250);

        RuleFor(request => request.AdminFullName)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(request => request.AdminEmail)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(request => request.AdminPassword)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);

        RuleFor(request => request.ConfirmPassword)
            .NotEmpty()
            .Equal(request => request.AdminPassword)
            .WithMessage("Password confirmation does not match.");
    }
}
