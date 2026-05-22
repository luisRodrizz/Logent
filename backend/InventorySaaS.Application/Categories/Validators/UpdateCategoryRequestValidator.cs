using FluentValidation;
using InventorySaaS.Application.Categories.DTOs;

namespace InventorySaaS.Application.Categories.Validators;

public class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryRequestValidator()
    {
        RuleFor(category => category.Name)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(category => category.Description)
            .MaximumLength(300);
    }
}
