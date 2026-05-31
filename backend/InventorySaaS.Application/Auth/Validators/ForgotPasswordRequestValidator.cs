using FluentValidation;
using InventorySaaS.Application.Auth.DTOs;

namespace InventorySaaS.Application.Auth.Validators;

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);
    }
}
