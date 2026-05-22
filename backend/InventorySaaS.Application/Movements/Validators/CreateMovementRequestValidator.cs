using FluentValidation;
using InventorySaaS.Application.Movements.DTOs;
using InventorySaaS.Domain.Enums;

namespace InventorySaaS.Application.Movements.Validators;

public class CreateMovementRequestValidator : AbstractValidator<CreateMovementRequest>
{
    public CreateMovementRequestValidator()
    {
        RuleFor(movement => movement.Type)
            .IsInEnum()
            .Must(type => type is MovementType.Entry or MovementType.Exit or MovementType.Transfer)
            .WithMessage("Type must be Entry, Exit, or Transfer.");

        RuleFor(movement => movement.Observation)
            .MaximumLength(500);

        RuleFor(movement => movement.Details)
            .NotEmpty();

        RuleForEach(movement => movement.Details)
            .SetValidator(new MovementDetailRequestValidator());

        When(movement => movement.Type == MovementType.Entry, () =>
        {
            RuleFor(movement => movement.WarehouseDestinationId)
                .NotEmpty();

            RuleFor(movement => movement.WarehouseOriginId)
                .Null();
        });

        When(movement => movement.Type == MovementType.Exit, () =>
        {
            RuleFor(movement => movement.WarehouseOriginId)
                .NotEmpty();

            RuleFor(movement => movement.WarehouseDestinationId)
                .Null();
        });

        When(movement => movement.Type == MovementType.Transfer, () =>
        {
            RuleFor(movement => movement.WarehouseOriginId)
                .NotEmpty();

            RuleFor(movement => movement.WarehouseDestinationId)
                .NotEmpty();

            RuleFor(movement => movement)
                .Must(movement => movement.WarehouseOriginId != movement.WarehouseDestinationId)
                .WithMessage("Warehouse origin and destination must be different.");
        });
    }
}
