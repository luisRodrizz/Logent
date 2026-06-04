using FluentValidation;
using InventorySaaS.Application.Profile.DTOs;

namespace InventorySaaS.Application.Profile.Validators;

public class ChangeMyPasswordRequestValidator : AbstractValidator<ChangeMyPasswordRequest>
{
    public ChangeMyPasswordRequestValidator()
    {
        RuleFor(request => request.CurrentPassword)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(request => request.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);

        RuleFor(request => request.ConfirmPassword)
            .NotEmpty()
            .Equal(request => request.NewPassword)
            .WithMessage("Password confirmation does not match.");
    }
}
