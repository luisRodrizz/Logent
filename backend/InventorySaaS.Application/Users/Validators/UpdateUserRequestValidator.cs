using FluentValidation;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Validators;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(user => user.FullName)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(user => user.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);
    }
}
