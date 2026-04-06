using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supervisor")]
public class SyncController : ControllerBase
{
    private readonly ISyncService _syncService;

    public SyncController(ISyncService syncService)
    {
        _syncService = syncService;
    }

    [HttpPut("{registrationId:int}")]
    public async Task<IActionResult> UpdateSyncStatus(int registrationId, [FromBody] UpdateSyncStatusRequest request)
    {
        var userId = GetUserId();
        try
        {
            var result = await _syncService.UpdateSyncStatusAsync(registrationId, request, userId);
            if (result == null)
                return NotFound(new ApiErrorResponse("Registro no encontrado"));
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiErrorResponse(ex.Message));
        }
    }

    [HttpPost("simulate-batch")]
    public async Task<IActionResult> SimulateBatchSync()
    {
        var userId = GetUserId();
        await _syncService.SimulateBatchSyncAsync(userId);
        return Ok(new { message = "Sincronización simulada completada" });
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }
}
