using FluentValidation;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Validators;

public class CreateTenantUserInvitationRequestValidator : AbstractValidator<CreateTenantUserInvitationRequest>
{
    public CreateTenantUserInvitationRequestValidator()
    {
        RuleFor(request => request.FirstName)
            .NotEmpty()
            .MaximumLength(80);

        RuleFor(request => request.LastName)
            .NotEmpty()
            .MaximumLength(80);

        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(request => request.Role)
            .NotEmpty()
            .MaximumLength(40);
    }
}
