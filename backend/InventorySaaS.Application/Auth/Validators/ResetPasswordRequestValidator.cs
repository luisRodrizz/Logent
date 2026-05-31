using FluentValidation;
using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Validators;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(request => request.Token)
            .NotEmpty();

        RuleFor(request => request.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);

        RuleFor(request => request.ConfirmPassword)
            .NotEmpty()
            .Equal(request => request.NewPassword)
            .WithMessage("Passwords do not match.");
    }
}
