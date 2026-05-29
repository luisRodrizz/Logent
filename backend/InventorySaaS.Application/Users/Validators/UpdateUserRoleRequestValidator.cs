using FluentValidation;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Validators;

public class UpdateUserRoleRequestValidator : AbstractValidator<UpdateUserRoleRequest>
{
    public UpdateUserRoleRequestValidator()
    {
        RuleFor(user => user.Role)
            .NotEmpty()
            .MaximumLength(40);
    }
}
