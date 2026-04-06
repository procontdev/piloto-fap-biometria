using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegistrationsController : ControllerBase
{
    private readonly IRegistrationService _registrationService;
    private readonly IDniLookupService _dniService;

    public RegistrationsController(IRegistrationService registrationService, IDniLookupService dniService)
    {
        _registrationService = registrationService;
        _dniService = dniService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateRegistrationRequest request)
    {
        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out var uid))
                userId = uid;
        }

        // Validations
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Dni) || request.Dni.Length != 8 || !request.Dni.All(char.IsDigit))
            errors["Dni"] = new[] { "DNI debe tener exactamente 8 dígitos numéricos" };
        else if (await _registrationService.ExistsByDniAsync(request.Dni))
            errors["Dni"] = new[] { "Ya existe un registro con este DNI" };

        if (string.IsNullOrWhiteSpace(request.FirstNames))
            errors["FirstNames"] = new[] { "Los nombres son obligatorios" };

        if (string.IsNullOrWhiteSpace(request.PaternalSurname))
            errors["PaternalSurname"] = new[] { "El apellido paterno es obligatorio" };

        if (string.IsNullOrWhiteSpace(request.MaternalSurname))
            errors["MaternalSurname"] = new[] { "El apellido materno es obligatorio" };

        if (request.Gender != "M" && request.Gender != "F")
            errors["Gender"] = new[] { "Sexo debe ser 'M' o 'F'" };

        // Age validation (around 17 years old, flexible ±1 year)
        var age = DateTime.Today.Year - request.BirthDate.Year;
        if (request.BirthDate > DateOnly.FromDateTime(DateTime.Today))
            errors["BirthDate"] = new[] { "La fecha de nacimiento no puede ser futura" };
        else if (age < 16 || age > 19)
            errors["BirthDate"] = new[] { "La edad debe estar entre 16 y 19 años" };

        if (!string.IsNullOrEmpty(request.Email) && !request.Email.Contains('@'))
            errors["Email"] = new[] { "El correo electrónico no tiene un formato válido" };

        if (!string.IsNullOrEmpty(request.Phone) && (request.Phone.Length < 7 || !request.Phone.All(c => char.IsDigit(c) || c == '+' || c == ' ')))
            errors["Phone"] = new[] { "El teléfono no tiene un formato válido" };

        if (string.IsNullOrWhiteSpace(request.Address))
            errors["Address"] = new[] { "La dirección es obligatoria" };

        if (string.IsNullOrWhiteSpace(request.Department))
            errors["Department"] = new[] { "El departamento es obligatorio" };

        if (string.IsNullOrWhiteSpace(request.Province))
            errors["Province"] = new[] { "La provincia es obligatoria" };

        if (string.IsNullOrWhiteSpace(request.District))
            errors["District"] = new[] { "El distrito es obligatorio" };

        if (string.IsNullOrWhiteSpace(request.EducationLevel))
            errors["EducationLevel"] = new[] { "El grado de instrucción es obligatorio" };

        if (errors.Count > 0)
            return BadRequest(new ApiErrorResponse("Errores de validación", errors));

        var result = await _registrationService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] RegistrationFilterRequest filter)
    {
        var result = await _registrationService.GetAllAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _registrationService.GetByIdAsync(id);
        if (result == null)
            return NotFound(new ApiErrorResponse("Registro no encontrado"));
        return Ok(result);
    }

    [HttpDelete]
    [Authorize(Roles = "Supervisor")]
    public async Task<IActionResult> DeleteAll()
    {
        var userId = GetUserId();
        var deletedCount = await _registrationService.DeleteAllAsync(userId);

        return Ok(new
        {
            message = deletedCount == 0
                ? "No hay registros para eliminar"
                : $"Se eliminaron {deletedCount} registros permanentemente",
            deletedCount
        });
    }

    [HttpPost("update/{id:int}")]
    [Authorize] // Segurida restablecida; la validación manual interna garantiza compatibilidad manual en Windows
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRegistrationRequest request)
    {
        var roleClaims = User.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "role").Select(c => c.Value).ToList();
        var rolesStr = string.Join(", ", roleClaims);
        var username = User.Identity?.Name ?? "Unknown";
        
        Console.WriteLine($"!!! [DIAGNOSTIC] Update Request ID {id} | User: {username} | Detected Roles: [{rolesStr}] | IsAuthed: {User.Identity?.IsAuthenticated} !!!");

        // Flexible manual check
        bool isAuthorized = roleClaims.Any(r => 
            string.Equals(r, "Supervisor", StringComparison.OrdinalIgnoreCase) || 
            string.Equals(r, "Operador", StringComparison.OrdinalIgnoreCase));

        if (!isAuthorized)
        {
            Console.WriteLine($"!!! [AUTH FAILURE] User {username} does NOT have permissions. Required: Supervisor or Operador. Has: [{rolesStr}] !!!");
            return StatusCode(403, new ApiErrorResponse("No tiene permisos suficientes para realizar esta acción."));
        }

        try
        {
            var userId = GetUserId();
            var result = await _registrationService.UpdateAsync(id, request, userId);
            
            if (result == null)
            {
                Console.WriteLine($"[DEBUG] Registration not found in controller: {id}");
                return NotFound(new ApiErrorResponse("Registro no encontrado"));
            }

            Console.WriteLine($"[DEBUG] Registration updated successfully for: {id}");
            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DEBUG] EXCEPTION in Update: {ex.Message}");
            return BadRequest(new ApiErrorResponse($"Error técnico: {ex.Message}"));
        }
    }

    [HttpPost("{id:int}/notify")]
    public async Task<IActionResult> Notify(int id, [FromQuery] string method)
    {
        var result = await _registrationService.SendNotificationAsync(id, method);
        if (result)
            return Ok(new { message = $"Notificación enviada correctamente por {method}" });
        
        return BadRequest(new ApiErrorResponse("No se pudo enviar la notificación. Verifique la configuración del servicio externo."));
    }

    [HttpGet("check-dni/{dni}")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckDni(string dni)
    {
        var exists = await _registrationService.ExistsByDniAsync(dni);
        return Ok(new { exists });
    }

    [HttpGet("dni/{dni}")]
    [AllowAnonymous]
    public async Task<IActionResult> LookupDni(string dni)
    {
        if (string.IsNullOrEmpty(dni) || dni.Length != 8 || !dni.All(char.IsDigit))
            return BadRequest(new ApiErrorResponse("DNI debe tener 8 dígitos numéricos"));

        var result = await _dniService.LookupAsync(dni);
        if (result == null)
            return NotFound(new ApiErrorResponse("DNI no encontrado en el sistema"));

        return Ok(result);
    }

    [HttpPost("upload-photo")]
    [AllowAnonymous]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new ApiErrorResponse("No se proporcionó ningún archivo"));

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new ApiErrorResponse("Formato de imagen no permitido"));

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "photos");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var photoUrl = $"{Request.Scheme}://{Request.Host}/uploads/photos/{uniqueFileName}";
        return Ok(new { url = photoUrl });
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }
}
