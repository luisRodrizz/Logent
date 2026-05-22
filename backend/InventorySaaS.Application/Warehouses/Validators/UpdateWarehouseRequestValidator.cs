using FluentValidation;
using InventorySaaS.Application.Warehouses.DTOs;

namespace InventorySaaS.Application.Warehouses.Validators;

public class UpdateWarehouseRequestValidator : AbstractValidator<UpdateWarehouseRequest>
{
    public UpdateWarehouseRequestValidator()
    {
        RuleFor(warehouse => warehouse.Name)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(warehouse => warehouse.Location)
            .MaximumLength(200);

        RuleFor(warehouse => warehouse.Description)
            .MaximumLength(300);
    }
}
