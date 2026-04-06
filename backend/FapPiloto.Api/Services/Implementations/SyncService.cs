using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class SyncService : ISyncService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;
    private static readonly Random _random = new();

    public SyncService(AppDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    /// <summary>
    /// Updates the sync status of a single registration (manual override by Supervisor).
    /// </summary>
    public async Task<RegistrationResponse?> UpdateSyncStatusAsync(int registrationId, UpdateSyncStatusRequest request, int userId)
    {
        var entity = await _db.Registrations
            .Include(r => r.CreatedByUser)
            .Include(r => r.UpdatedByUser)
            .FirstOrDefaultAsync(r => r.Id == registrationId);

        if (entity == null) return null;

        var validStatuses = new[] { "Pendiente", "Sincronizado", "Observado", "Error" };
        if (!validStatuses.Contains(request.SyncStatus))
            throw new ArgumentException($"Estado de sincronización inválido: {request.SyncStatus}");

        var oldStatus = entity.SyncStatus;
        entity.SyncStatus = request.SyncStatus;
        entity.SyncMessage = request.SyncMessage;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = userId;

        await _db.SaveChangesAsync();

        await _audit.LogAsync("ApplicantRegistration", entity.Id, "SyncChange", userId,
            $"Estado de sincronización cambiado de '{oldStatus}' a '{request.SyncStatus}'",
            oldValues: new { SyncStatus = oldStatus },
            newValues: new { request.SyncStatus, request.SyncMessage });

        return MapToResponse(entity);
    }

    /// <summary>
    /// Simulates a batch sync with the institutional system (SICERM).
    /// Randomly assigns sync results to pending registrations.
    /// </summary>
    public async Task SimulateBatchSyncAsync(int userId)
    {
        var pending = await _db.Registrations
            .Where(r => r.SyncStatus == "Pendiente")
            .ToListAsync();

        foreach (var reg in pending)
        {
            var result = _random.Next(100);
            var oldStatus = reg.SyncStatus;

            if (result < 70)
            {
                reg.SyncStatus = "Sincronizado";
                reg.SyncMessage = "Registro sincronizado exitosamente con SICERM";
            }
            else if (result < 90)
            {
                reg.SyncStatus = "Observado";
                reg.SyncMessage = "Datos requieren verificación adicional por SICERM";
            }
            else
            {
                reg.SyncStatus = "Error";
                reg.SyncMessage = "Error de comunicación con el servidor SICERM (simulado)";
            }

            reg.UpdatedAt = DateTime.UtcNow;
            reg.UpdatedBy = userId;

            await _audit.LogAsync("ApplicantRegistration", reg.Id, "SyncChange", userId,
                $"Sincronización simulada: '{oldStatus}' → '{reg.SyncStatus}'",
                oldValues: new { SyncStatus = oldStatus },
                newValues: new { reg.SyncStatus, reg.SyncMessage });
        }

        await _db.SaveChangesAsync();
    }

    private static RegistrationResponse MapToResponse(Entities.ApplicantRegistration entity)
    {
        return new RegistrationResponse
        {
            Id = entity.Id,
            Dni = entity.Dni,
            FirstNames = entity.FirstNames,
            PaternalSurname = entity.PaternalSurname,
            MaternalSurname = entity.MaternalSurname,
            BirthDate = entity.BirthDate,
            Gender = entity.Gender,
            Phone = entity.Phone,
            Email = entity.Email,
            Address = entity.Address,
            Department = entity.Department,
            Province = entity.Province,
            District = entity.District,
            EducationLevel = entity.EducationLevel,
            MilitaryServiceInterest = entity.MilitaryServiceInterest,
            Observations = entity.Observations,
            RegistrationStatus = entity.RegistrationStatus,
            SyncStatus = entity.SyncStatus,
            SyncMessage = entity.SyncMessage,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedByName = entity.CreatedByUser?.FullName ?? "—",
            UpdatedByName = entity.UpdatedByUser?.FullName
        };
    }
}
