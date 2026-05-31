using FluentValidation;
using InventorySaaS.Application.Platform.Companies.DTOs;

namespace InventorySaaS.Application.Platform.Companies.Validators;

public class UpdateCompanyStatusRequestValidator : AbstractValidator<UpdateCompanyStatusRequest>
{
    public UpdateCompanyStatusRequestValidator()
    {
        RuleFor(company => company.Reason)
            .MaximumLength(500);
    }
}
