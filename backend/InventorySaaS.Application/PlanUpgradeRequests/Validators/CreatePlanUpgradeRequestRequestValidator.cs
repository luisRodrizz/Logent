using FluentValidation;
using InventorySaaS.Application.PlanUpgradeRequests.DTOs;

namespace InventorySaaS.Application.PlanUpgradeRequests.Validators;

public class CreatePlanUpgradeRequestRequestValidator : AbstractValidator<CreatePlanUpgradeRequestRequest>
{
    public CreatePlanUpgradeRequestRequestValidator()
    {
        RuleFor(request => request.RequestedPlan)
            .IsInEnum()
            .WithMessage("Requested plan must be one of: Free, Starter, Pro, Enterprise.");

        RuleFor(request => request.Message)
            .MaximumLength(500);
    }
}
