using FluentValidation;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Validators;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(user => user.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);
    }
}
