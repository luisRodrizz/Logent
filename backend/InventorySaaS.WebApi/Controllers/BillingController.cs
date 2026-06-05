using InventorySaaS.Application.Billing.DTOs;
using InventorySaaS.Application.Billing.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Route("api/billing")]
public class BillingController(IBillingService billingService) : ControllerBase
{
    private const string TenantRoles = IdentitySeeder.AdminRole
        + ","
        + IdentitySeeder.WarehouseRole
        + ","
        + IdentitySeeder.ReadOnlyRole;

    [Authorize(Roles = TenantRoles)]
    [HttpGet("config")]
    public ActionResult<BillingConfigResponse> GetConfig()
    {
        return Ok(billingService.GetConfig());
    }

    [Authorize(Roles = TenantRoles)]
    [HttpGet("status")]
    public async Task<ActionResult<BillingStatusResponse>> GetStatus(CancellationToken cancellationToken)
    {
        return Ok(await billingService.GetStatusAsync(cancellationToken));
    }

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpPost("checkout-session")]
    public async Task<ActionResult<CreateCheckoutSessionResponse>> CreateCheckoutSession(
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await billingService.CreateCheckoutSessionAsync(request.RequestedPlan, cancellationToken));
    }

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpPost("portal-session")]
    public async Task<ActionResult<CreateBillingPortalSessionResponse>> CreatePortalSession(
        CancellationToken cancellationToken)
    {
        return Ok(await billingService.CreatePortalSessionAsync(cancellationToken));
    }

    [AllowAnonymous]
    [DisableRateLimiting]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["Stripe-Signature"].ToString();

        await billingService.HandleWebhookAsync(payload, signature, cancellationToken);

        return Ok();
    }
}
