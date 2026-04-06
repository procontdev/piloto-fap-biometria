using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supervisor")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] AuditFilterRequest filter)
    {
        var result = await _auditService.GetLogsAsync(filter);
        return Ok(result);
    }
}
