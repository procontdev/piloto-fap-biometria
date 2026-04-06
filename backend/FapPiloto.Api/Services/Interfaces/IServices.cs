using FapPiloto.Api.DTOs;

namespace FapPiloto.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}

public interface IDniLookupService
{
    Task<DniLookupResponse?> LookupAsync(string dni);
}

public interface IRegistrationService
{
    Task<RegistrationResponse> CreateAsync(CreateRegistrationRequest request, int? userId = null);
    Task<RegistrationResponse?> GetByIdAsync(int id);
    Task<PagedResponse<RegistrationListItemResponse>> GetAllAsync(RegistrationFilterRequest filter);
    Task<RegistrationResponse?> UpdateAsync(int id, UpdateRegistrationRequest request, int userId);
    Task<int> DeleteAllAsync(int userId);
    Task<bool> ExistsByDniAsync(string dni);
    Task<bool> SendNotificationAsync(int id, string method);
}

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync();
}

public interface IAuditService
{
    Task LogAsync(string entityName, int entityId, string action, int? userId, string? description = null, object? oldValues = null, object? newValues = null);
    Task<PagedResponse<AuditLogResponse>> GetLogsAsync(AuditFilterRequest filter);
}

public interface ISyncService
{
    Task<RegistrationResponse?> UpdateSyncStatusAsync(int registrationId, UpdateSyncStatusRequest request, int userId);
    Task SimulateBatchSyncAsync(int userId);
}

public interface IPdfService
{
    Task<byte[]> GenerateConstanciaAsync(int registrationId);
}

public interface IExportService
{
    Task<byte[]> ExportToCsvAsync(RegistrationFilterRequest filter);
}
