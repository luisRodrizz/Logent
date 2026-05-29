using System.Security.Claims;
using FluentValidation;
using InventorySaaS.Application.Common.DTOs;
using InventorySaaS.Application.Movements.DTOs;
using InventorySaaS.Application.Movements.Interfaces;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MovementsController(
    IMovementService movementService,
    IValidator<CreateMovementRequest> createValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<PagedResponse<MovementResponse>>> GetAll(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var movements = await movementService.GetAllAsync(request, cancellationToken);

        return Ok(movements);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Almacenero,Consulta")]
    public async Task<ActionResult<MovementResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var movement = await movementService.GetByIdAsync(id, cancellationToken);

        return movement is null
            ? this.ApiNotFound("Movement not found.", "No movement was found with the provided id.")
            : Ok(movement);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Almacenero")]
    public async Task<ActionResult<MovementResponse>> Create(
        CreateMovementRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return this.ApiUnauthorized();
        }

        var validationResult = await createValidator.ValidateAsync(request, cancellationToken);

        if (!validationResult.IsValid)
        {
            return this.ApiValidation(validationResult.Errors.Select(error => error.ErrorMessage));
        }

        var movement = await movementService.CreateAsync(request, userId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = movement.Id }, movement);
    }
}
