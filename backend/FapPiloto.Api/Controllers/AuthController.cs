using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new ApiErrorResponse("Usuario y contraseña son obligatorios"));

        try
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
                return Unauthorized(new ApiErrorResponse("Credenciales inválidas"));

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled authentication error for user {Username}", request.Username);
            return StatusCode(500, new ApiErrorResponse("Error interno de autenticación"));
        }
    }
}
