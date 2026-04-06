using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DniController : ControllerBase
{
    private readonly IDniLookupService _dniService;

    public DniController(IDniLookupService dniService)
    {
        _dniService = dniService;
    }

    [HttpGet("{dni}")]
    [AllowAnonymous]
    public async Task<IActionResult> Lookup(string dni)
    {
        if (string.IsNullOrEmpty(dni) || dni.Length != 8 || !dni.All(char.IsDigit))
            return BadRequest(new ApiErrorResponse("DNI debe tener 8 dígitos numéricos"));

        var result = await _dniService.LookupAsync(dni);
        if (result == null)
            return NotFound(new ApiErrorResponse("DNI no encontrado en el sistema"));

        return Ok(result);
    }
}
