using FluentValidation;
using InventorySaaS.Application.Products.DTOs;
using InventorySaaS.Application.Products.Interfaces;
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
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var products = await productService.GetAllAsync(cancellationToken);

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await productService.GetByIdAsync(id, cancellationToken);

        return product is null ? NotFound() : Ok(product);
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
            return BadRequest(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        try
        {
            var product = await productService.CreateAsync(request, cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(exception.Message);
        }
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
            return BadRequest(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        try
        {
            var updated = await productService.UpdateAsync(id, request, cancellationToken);

            return updated ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await productService.DeleteAsync(id, cancellationToken);

        return deleted ? NoContent() : NotFound();
    }
}
