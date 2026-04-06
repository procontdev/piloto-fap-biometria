using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PdfController : ControllerBase
{
    private readonly IPdfService _pdfService;

    public PdfController(IPdfService pdfService)
    {
        _pdfService = pdfService;
    }

    [HttpGet("constancia/{registrationId:int}")]
    public async Task<IActionResult> GetConstancia(int registrationId)
    {
        try
        {
            var pdfBytes = await _pdfService.GenerateConstanciaAsync(registrationId);
            return File(pdfBytes, "application/pdf", $"constancia_{registrationId}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ApiErrorResponse("Registro no encontrado"));
        }
    }
}
