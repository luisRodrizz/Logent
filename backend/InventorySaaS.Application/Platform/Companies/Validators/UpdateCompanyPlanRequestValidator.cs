using FluentValidation;
using InventorySaaS.Application.Platform.Companies.DTOs;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Platform.Companies.Validators;

public class UpdateCompanyPlanRequestValidator : AbstractValidator<UpdateCompanyPlanRequest>
{
    public UpdateCompanyPlanRequestValidator()
    {
        RuleFor(company => company.Plan)
            .NotEmpty()
            .Must(plan => Enum.TryParse<PlanType>(plan, ignoreCase: true, out _))
            .WithMessage("Plan must be one of: Free, Starter, Pro, Enterprise.");
    }
}
