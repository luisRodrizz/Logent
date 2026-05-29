using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Suppliers.DTOs;
using InventorySaaS.Application.Suppliers.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SuppliersController(
    ISupplierService supplierService,
    IValidator<CreateSupplierRequest> createValidator,
    IValidator<UpdateSupplierRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<PagedResponse<SupplierResponse>>> GetAll(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var suppliers = await supplierService.GetAllAsync(request, cancellationToken);

        return Ok(suppliers);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<SupplierResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var supplier = await supplierService.GetByIdAsync(id, cancellationToken);

        return supplier is null
            ? this.ApiNotFound("Supplier not found.", "No supplier was found with the provided id.")
            : Ok(supplier);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SupplierResponse>> Create(
        CreateSupplierRequest request,
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

        var supplier = await supplierService.CreateAsync(request, userId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateSupplierRequest request,
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

        var updated = await supplierService.UpdateAsync(id, request, userId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Supplier not found.", "No supplier was found with the provided id.");
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

        var deleted = await supplierService.DeleteAsync(id, userId, cancellationToken);

        return deleted
            ? NoContent()
            : this.ApiNotFound("Supplier not found.", "No supplier was found with the provided id.");
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }
}
