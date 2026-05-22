using FluentValidation;
using InventorySaaS.Application.Suppliers.DTOs;
using InventorySaaS.Application.Suppliers.Interfaces;
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
    public async Task<ActionResult<IReadOnlyList<SupplierResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var suppliers = await supplierService.GetAllAsync(cancellationToken);

        return Ok(suppliers);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<SupplierResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var supplier = await supplierService.GetByIdAsync(id, cancellationToken);

        return supplier is null ? NotFound() : Ok(supplier);
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
            return BadRequest(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        try
        {
            var supplier = await supplierService.CreateAsync(request, cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
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
        UpdateSupplierRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await updateValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        try
        {
            var updated = await supplierService.UpdateAsync(id, request, cancellationToken);

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
        var deleted = await supplierService.DeleteAsync(id, cancellationToken);

        return deleted ? NoContent() : NotFound();
    }
}
