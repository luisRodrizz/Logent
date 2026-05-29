using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Warehouses.DTOs;
using InventorySaaS.Application.Warehouses.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class WarehousesController(
    IWarehouseService warehouseService,
    IValidator<CreateWarehouseRequest> createValidator,
    IValidator<UpdateWarehouseRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<PagedResponse<WarehouseResponse>>> GetAll(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var warehouses = await warehouseService.GetAllAsync(request, cancellationToken);

        return Ok(warehouses);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<WarehouseResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var warehouse = await warehouseService.GetByIdAsync(id, cancellationToken);

        return warehouse is null
            ? this.ApiNotFound("Warehouse not found.", "No warehouse was found with the provided id.")
            : Ok(warehouse);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WarehouseResponse>> Create(
        CreateWarehouseRequest request,
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

        var warehouse = await warehouseService.CreateAsync(request, userId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateWarehouseRequest request,
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

        var updated = await warehouseService.UpdateAsync(id, request, userId, cancellationToken);

        return updated
            ? NoContent()
            : this.ApiNotFound("Warehouse not found.", "No warehouse was found with the provided id.");
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

        var deleted = await warehouseService.DeleteAsync(id, userId, cancellationToken);

        return deleted
            ? NoContent()
            : this.ApiNotFound("Warehouse not found.", "No warehouse was found with the provided id.");
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }
}
