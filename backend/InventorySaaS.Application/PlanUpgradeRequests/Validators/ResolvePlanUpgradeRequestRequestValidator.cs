using FluentValidation;
using InventorySaaS.Application.PlanUpgradeRequests.DTOs;

namespace InventorySaaS.Application.PlanUpgradeRequests.Validators;

public class ResolvePlanUpgradeRequestRequestValidator : AbstractValidator<ResolvePlanUpgradeRequestRequest>
{
    public ResolvePlanUpgradeRequestRequestValidator()
    {
        RuleFor(request => request.ResolutionNote)
            .MaximumLength(500);
    }
}
