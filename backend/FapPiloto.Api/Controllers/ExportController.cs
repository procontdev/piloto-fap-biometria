using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supervisor,Operador")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet("csv")]
    public async Task<IActionResult> DownloadCsv([FromQuery] RegistrationFilterRequest filter)
    {
        var csvBytes = await _exportService.ExportToCsvAsync(filter);
        var bom = new byte[] { 0xEF, 0xBB, 0xBF }; // Excel UTF-8 BOM
        var result = new byte[bom.Length + csvBytes.Length];
        
        Buffer.BlockCopy(bom, 0, result, 0, bom.Length);
        Buffer.BlockCopy(csvBytes, 0, result, bom.Length, csvBytes.Length);

        return File(result, "text/csv", $"registros_{DateTime.Now:yyyyMMdd_HHmm}.csv");
    }
}
