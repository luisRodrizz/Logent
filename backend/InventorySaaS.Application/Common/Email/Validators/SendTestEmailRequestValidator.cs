using FluentValidation;
using InventorySaaS.Application.Common.Email.DTOs;

namespace InventorySaaS.Application.Common.Email.Validators;

public class SendTestEmailRequestValidator : AbstractValidator<SendTestEmailRequest>
{
    public SendTestEmailRequestValidator()
    {
        RuleFor(request => request.To)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(request => request.Subject)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(request => request.Message)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
