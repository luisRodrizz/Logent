using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Categories.DTOs;
using InventorySaaS.Application.Categories.Interfaces;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CategoriesController(
    ICategoryService categoryService,
    IValidator<CreateCategoryRequest> createValidator,
    IValidator<UpdateCategoryRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<PagedResponse<CategoryResponse>>> GetAll(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var categories = await categoryService.GetAllAsync(request, cancellationToken);

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<CategoryResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var category = await categoryService.GetByIdAsync(id, cancellationToken);

        return category is null
            ? this.ApiNotFound("Category not found.", "No category was found with the provided id.")
            : Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CategoryResponse>> Create(
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await createValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return this.ApiUnauthorized();
        }

        var category = await categoryService.CreateAsync(request, userId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return this.ApiUnauthorized();
        }

        var updated = await categoryService.UpdateAsync(id, request, userId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Category not found.", "No category was found with the provided id.");
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return this.ApiUnauthorized();
        }

        var deleted = await categoryService.DeleteAsync(id, userId, cancellationToken);

        return deleted
            ? NoContent()
            : this.ApiNotFound("Category not found.", "No category was found with the provided id.");
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }
}
