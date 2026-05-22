using FluentValidation;
using InventorySaaS.Application.Products.DTOs;

namespace InventorySaaS.Application.Products.Validators;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(product => product.Code)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(product => product.Name)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(product => product.Description)
            .MaximumLength(500);

        RuleFor(product => product.CategoryId)
            .NotEmpty();

        RuleFor(product => product.PurchasePrice)
            .GreaterThanOrEqualTo(0);

        RuleFor(product => product.SalePrice)
            .GreaterThanOrEqualTo(0);

        RuleFor(product => product.MinimumStock)
            .GreaterThanOrEqualTo(0);
    }
}
