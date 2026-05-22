using FluentValidation;
using InventorySaaS.Application.Suppliers.DTOs;

namespace InventorySaaS.Application.Suppliers.Validators;

public class UpdateSupplierRequestValidator : AbstractValidator<UpdateSupplierRequest>
{
    public UpdateSupplierRequestValidator()
    {
        RuleFor(supplier => supplier.BusinessName)
            .NotEmpty()
            .MaximumLength(160);

        RuleFor(supplier => supplier.Ruc)
            .MaximumLength(20);

        RuleFor(supplier => supplier.Phone)
            .MaximumLength(30);

        RuleFor(supplier => supplier.Email)
            .MaximumLength(160)
            .EmailAddress()
            .When(supplier => !string.IsNullOrWhiteSpace(supplier.Email));

        RuleFor(supplier => supplier.Address)
            .MaximumLength(250);
    }
}
