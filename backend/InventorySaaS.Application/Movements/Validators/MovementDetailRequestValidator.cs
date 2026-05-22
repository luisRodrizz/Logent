using FluentValidation;
using InventorySaaS.Application.Movements.DTOs;

namespace InventorySaaS.Application.Movements.Validators;

public class MovementDetailRequestValidator : AbstractValidator<MovementDetailRequest>
{
    public MovementDetailRequestValidator()
    {
        RuleFor(detail => detail.ProductId)
            .NotEmpty();

        RuleFor(detail => detail.Quantity)
            .GreaterThan(0);

        RuleFor(detail => detail.UnitCost)
            .GreaterThanOrEqualTo(0);
    }
}
