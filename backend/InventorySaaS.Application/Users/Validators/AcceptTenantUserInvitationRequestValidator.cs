using FluentValidation;
using InventorySaaS.Application.Users.DTOs;

namespace InventorySaaS.Application.Users.Validators;

public class AcceptTenantUserInvitationRequestValidator : AbstractValidator<AcceptTenantUserInvitationRequest>
{
    public AcceptTenantUserInvitationRequestValidator()
    {
        RuleFor(request => request.Token)
            .NotEmpty();

        RuleFor(request => request.Password)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(100);

        RuleFor(request => request.ConfirmPassword)
            .NotEmpty()
            .Equal(request => request.Password)
            .WithMessage("Password confirmation does not match.");
    }
}
