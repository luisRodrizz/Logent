using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Products.DTOs;
using InventorySaaS.Application.Products.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProductsController(
    IProductService productService,
    IValidator<CreateProductRequest> createValidator,
    IValidator<UpdateProductRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<PagedResponse<ProductResponse>>> GetAll(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var products = await productService.GetAllAsync(request, cancellationToken);

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await productService.GetByIdAsync(id, cancellationToken);

        return product is null
            ? this.ApiNotFound("Product not found.", "No product was found with the provided id.")
            : Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductResponse>> Create(
        CreateProductRequest request,
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

        var product = await productService.CreateAsync(request, userId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateProductRequest request,
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

        var updated = await productService.UpdateAsync(id, request, userId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Product not found.", "No product was found with the provided id.");
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

        var deleted = await productService.DeleteAsync(id, userId, cancellationToken);

        return deleted
            ? NoContent()
            : this.ApiNotFound("Product not found.", "No product was found with the provided id.");
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }
}
