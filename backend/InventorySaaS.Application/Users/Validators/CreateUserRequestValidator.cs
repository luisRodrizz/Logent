using FluentValidation;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(user => user.FullName)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(user => user.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(user => user.Password)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);

        RuleFor(user => user.Role)
            .NotEmpty()
            .MaximumLength(40);
    }
}
