using System.Security.Claims;
using InventorySaaS.Application.Auth.DTOs;
using InventorySaaS.Application.Common.Interfaces;
using InventorySaaS.Infrastructure.Identity;
using InventorySaaS.WebApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace InventorySaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtTokenService jwtTokenService) : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.Ordinal)
    {
        IdentitySeeder.AdminRole,
        IdentitySeeder.WarehouseRole,
        IdentitySeeder.ReadOnlyRole
    };

    [Authorize(Roles = IdentitySeeder.AdminRole)]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var role = request.Role.Trim();

        if (!AllowedRoles.Contains(role))
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "Invalid role.",
                $"Role must be one of: {string.Join(", ", AllowedRoles)}.");
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status400BadRequest,
                "A user with this email already exists.",
                "A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                createResult.Errors.Select(error => error.Description));
        }

        var roleResult = await userManager.AddToRoleAsync(user, role);

        if (!roleResult.Succeeded)
        {
            return ApiErrorResponseFactory.Validation(
                HttpContext,
                roleResult.Errors.Select(error => error.Description));
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is null)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Invalid email or password.",
                "The provided credentials are not valid.");
        }

        if (!user.IsActive)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "User account is inactive.",
                "Contact an administrator to reactivate this account.");
        }

        var signInResult = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);

        if (!signInResult.Succeeded)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Invalid email or password.",
                "The provided credentials are not valid.");
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                "You must provide a valid access token.");
        }

        var user = await userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                "You must provide a valid access token.");
        }

        if (!user.IsActive)
        {
            return ApiErrorResponseFactory.Result(
                HttpContext,
                StatusCodes.Status401Unauthorized,
                "User account is inactive.",
                "Contact an administrator to reactivate this account.");
        }

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new CurrentUserResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = roles
        });
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var email = user.Email ?? string.Empty;

        return new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user.Id, email, roles),
            Email = email,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Roles = roles,
            ExpiresAt = jwtTokenService.GetExpirationTime()
        };
    }
}
