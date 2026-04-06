using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new ApiErrorResponse("Usuario y contraseña son obligatorios"));

        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(new ApiErrorResponse("Credenciales inválidas"));

        return Ok(result);
    }
}
