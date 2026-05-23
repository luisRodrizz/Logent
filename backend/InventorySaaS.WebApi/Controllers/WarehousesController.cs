using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Warehouses.DTOs;
using InventorySaaS.Application.Warehouses.Interfaces;
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
    public async Task<ActionResult<IReadOnlyList<WarehouseResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var warehouses = await warehouseService.GetAllAsync(cancellationToken);

        return Ok(warehouses);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<WarehouseResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var warehouse = await warehouseService.GetByIdAsync(id, cancellationToken);

        return warehouse is null ? NotFound() : Ok(warehouse);
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
            return BadRequest(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        try
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return Unauthorized();
            }

            var warehouse = await warehouseService.CreateAsync(request, userId, cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
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
        UpdateWarehouseRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        try
        {
            var userId = GetCurrentUserId();

            if (userId is null)
            {
                return Unauthorized();
            }

            var updated = await warehouseService.UpdateAsync(id, request, userId, cancellationToken);

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
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var deleted = await warehouseService.DeleteAsync(id, userId, cancellationToken);

        return deleted ? NoContent() : NotFound();
    }

    private string? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }
}
