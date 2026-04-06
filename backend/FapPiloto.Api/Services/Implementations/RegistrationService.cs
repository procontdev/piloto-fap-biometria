using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Entities;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class RegistrationService : IRegistrationService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly IPdfService _pdf;

    public RegistrationService(AppDbContext db, IAuditService audit, IHttpClientFactory httpClientFactory, IConfiguration config, IPdfService pdf)
    {
        _db = db;
        _audit = audit;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _pdf = pdf;
    }

    public async Task<RegistrationResponse> CreateAsync(CreateRegistrationRequest request, int? userId = null)
    {
        var entity = new ApplicantRegistration
        {
            Dni = request.Dni,
            FirstNames = request.FirstNames,
            PaternalSurname = request.PaternalSurname,
            MaternalSurname = request.MaternalSurname,
            BirthDate = request.BirthDate,
            Gender = request.Gender,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            Department = request.Department,
            Province = request.Province,
            District = request.District,

            // Nuevos Campos Kiosko
            CurrentAddress = request.CurrentAddress,
            CurrentDepartment = request.CurrentDepartment,
            CurrentProvince = request.CurrentProvince,
            CurrentDistrict = request.CurrentDistrict,

            HairColor = request.HairColor,
            EyeColor = request.EyeColor,
            Complexion = request.Complexion,
            BloodType = request.BloodType,
            ShoeSize = request.ShoeSize,

            EducationLevel = request.EducationLevel,
            MilitaryServiceInterest = request.MilitaryServiceInterest,
            Weight = request.Weight,
            Height = request.Height,
            
            // Evidencias
            PhotoPath = request.PhotoPath,
            ProfilePhotoPath = request.ProfilePhotoPath,
            SignaturePath = request.SignaturePath,
            
            LeftIndexFingerprintStatus = request.LeftIndexFingerprintStatus ?? "Pendiente",
            RightIndexFingerprintStatus = request.RightIndexFingerprintStatus ?? "Pendiente",
            FingerprintStatus = (request.LeftIndexFingerprintStatus == "Capturada" && request.RightIndexFingerprintStatus == "Capturada") 
                                ? "Capturada" 
                                : request.FingerprintStatus ?? "Pendiente",

            RegistrationMode = request.RegistrationMode,
            Observations = request.Observations,
            RegistrationStatus = (request.RegistrationMode == "Autoservicio" && (request.Weight == null || request.Weight <= 0 || request.Height == null || request.Height <= 0)) 
                                    ? "Pendiente de Medición" 
                                    : "Completado",
            SyncStatus = "Pendiente",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
        };

        _db.Registrations.Add(entity);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("ApplicantRegistration", entity.Id, "Create", userId,
            $"Registro creado para DNI {entity.Dni}", newValues: request);

        return await GetByIdAsync(entity.Id) ?? throw new InvalidOperationException("Failed to retrieve created registration");
    }

    public async Task<RegistrationResponse?> GetByIdAsync(int id)
    {
        var entity = await _db.Registrations
            .Include(r => r.CreatedByUser)
            .Include(r => r.UpdatedByUser)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (entity == null) return null;

        return MapToResponse(entity);
    }

    public async Task<PagedResponse<RegistrationListItemResponse>> GetAllAsync(RegistrationFilterRequest filter)
    {
        var query = _db.Registrations.AsQueryable();

        // Search by DNI or name
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(r =>
                r.Dni.Contains(term) ||
                r.FirstNames.ToLower().Contains(term) ||
                r.PaternalSurname.ToLower().Contains(term) ||
                r.MaternalSurname.ToLower().Contains(term));
        }

        if (!string.IsNullOrEmpty(filter.RegistrationStatus))
            query = query.Where(r => r.RegistrationStatus == filter.RegistrationStatus);

        if (!string.IsNullOrEmpty(filter.SyncStatus))
            query = query.Where(r => r.SyncStatus == filter.SyncStatus);

        if (!string.IsNullOrEmpty(filter.Department))
            query = query.Where(r => r.Department == filter.Department);

        if (filter.MilitaryServiceInterest.HasValue)
            query = query.Where(r => r.MilitaryServiceInterest == filter.MilitaryServiceInterest.Value);

        if (!string.IsNullOrEmpty(filter.RegistrationMode))
            query = query.Where(r => r.RegistrationMode == filter.RegistrationMode);

        // Sorting
        query = filter.SortBy?.ToLower() switch
        {
            "dni" => filter.SortDirection == "asc" ? query.OrderBy(r => r.Dni) : query.OrderByDescending(r => r.Dni),
            "fullname" => filter.SortDirection == "asc"
                ? query.OrderBy(r => r.PaternalSurname).ThenBy(r => r.MaternalSurname).ThenBy(r => r.FirstNames)
                : query.OrderByDescending(r => r.PaternalSurname).ThenByDescending(r => r.MaternalSurname).ThenByDescending(r => r.FirstNames),
            "department" => filter.SortDirection == "asc" ? query.OrderBy(r => r.Department) : query.OrderByDescending(r => r.Department),
            _ => filter.SortDirection == "asc" ? query.OrderBy(r => r.CreatedAt) : query.OrderByDescending(r => r.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(r => new RegistrationListItemResponse
            {
                Id = r.Id,
                Dni = r.Dni,
                FullName = $"{r.PaternalSurname} {r.MaternalSurname}, {r.FirstNames}",
                Department = r.Department,
                RegistrationStatus = r.RegistrationStatus,
                SyncStatus = r.SyncStatus,
                MilitaryServiceInterest = r.MilitaryServiceInterest,
                RegistrationMode = r.RegistrationMode,
                HasPhoto = !string.IsNullOrEmpty(r.PhotoPath),
                FingerprintStatus = r.FingerprintStatus,
                Email = r.Email,
                Phone = r.Phone,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new PagedResponse<RegistrationListItemResponse>(items, totalCount, filter.Page, filter.PageSize, totalPages);
    }

    public async Task<RegistrationResponse?> UpdateAsync(int id, UpdateRegistrationRequest request, int userId)
    {
        Console.WriteLine($"[DEBUG] RegistrationService.UpdateAsync starting for ID: {id}");
        try
        {
            var entity = await _db.Registrations
                .Include(r => r.CreatedByUser)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (entity == null)
            {
                Console.WriteLine($"[DEBUG] RegistrationService.UpdateAsync - Registration not found for ID: {id}");
                return null;
            }

            // Snapshot old values for audit
            var oldValues = new
            {
                entity.FirstNames, entity.PaternalSurname, entity.MaternalSurname,
                entity.Phone, entity.Email, entity.Address, entity.Department,
                entity.Province, entity.District, entity.EducationLevel,
                entity.Weight, entity.Height, entity.PhotoPath, entity.FingerprintStatus,
                entity.RegistrationStatus, entity.MilitaryServiceInterest, entity.Observations,
                entity.CurrentAddress, entity.CurrentDepartment, entity.ProfilePhotoPath,
                entity.SignaturePath, entity.LeftIndexFingerprintStatus, entity.RightIndexFingerprintStatus,
                entity.HairColor, entity.EyeColor, entity.Complexion, entity.BloodType, entity.ShoeSize
            };

            if (request.FirstNames != null) entity.FirstNames = request.FirstNames;
            if (request.PaternalSurname != null) entity.PaternalSurname = request.PaternalSurname;
            if (request.MaternalSurname != null) entity.MaternalSurname = request.MaternalSurname;
            if (request.Phone != null) entity.Phone = request.Phone;
            if (request.Email != null) entity.Email = request.Email;
            
            entity.Address = request.Address;
            entity.Department = request.Department;
            entity.Province = request.Province;
            entity.District = request.District;

            if (request.CurrentAddress != null) entity.CurrentAddress = request.CurrentAddress;
            if (request.CurrentDepartment != null) entity.CurrentDepartment = request.CurrentDepartment;
            if (request.CurrentProvince != null) entity.CurrentProvince = request.CurrentProvince;
            if (request.CurrentDistrict != null) entity.CurrentDistrict = request.CurrentDistrict;

            if (request.HairColor != null) entity.HairColor = request.HairColor;
            if (request.EyeColor != null) entity.EyeColor = request.EyeColor;
            if (request.Complexion != null) entity.Complexion = request.Complexion;
            if (request.BloodType != null) entity.BloodType = request.BloodType;
            if (request.ShoeSize.HasValue) entity.ShoeSize = request.ShoeSize.Value;

            entity.EducationLevel = request.EducationLevel;
            entity.MilitaryServiceInterest = request.MilitaryServiceInterest;
            entity.Observations = request.Observations;
            
            if (request.Weight.HasValue) entity.Weight = request.Weight.Value;
            if (request.Height.HasValue) entity.Height = request.Height.Value;
            
            if (request.PhotoPath != null) entity.PhotoPath = request.PhotoPath;
            if (request.ProfilePhotoPath != null) entity.ProfilePhotoPath = request.ProfilePhotoPath;
            if (request.SignaturePath != null) entity.SignaturePath = request.SignaturePath;
            
            if (request.FingerprintStatus != null) entity.FingerprintStatus = request.FingerprintStatus;
            if (request.LeftIndexFingerprintStatus != null) entity.LeftIndexFingerprintStatus = request.LeftIndexFingerprintStatus;
            if (request.RightIndexFingerprintStatus != null) entity.RightIndexFingerprintStatus = request.RightIndexFingerprintStatus;

            // Auto-status logic
            if (!string.IsNullOrEmpty(request.RegistrationStatus))
            {
                entity.RegistrationStatus = request.RegistrationStatus;
            }
            else if (entity.RegistrationStatus == "Pendiente de Medición")
            {
                if (entity.Weight > 0 && entity.Height > 0)
                {
                    entity.RegistrationStatus = "Completado";
                }
            }

            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = userId;

            await _db.SaveChangesAsync();

            await _audit.LogAsync("ApplicantRegistration", entity.Id, "Update", userId,
                $"Registro {entity.Dni} actualizado", oldValues: oldValues, newValues: request);

            return await GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] UpdateAsync failed for ID {id}: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            throw;
        }
    }

    public async Task<int> DeleteAllAsync(int userId)
    {
        var total = await _db.Registrations.CountAsync();
        if (total == 0)
            return 0;

        await _db.Registrations.ExecuteDeleteAsync();

        await _audit.LogAsync(
            "ApplicantRegistration",
            0,
            "DeleteAll",
            userId,
            $"Eliminación física masiva de registros. Total eliminado: {total}");

        return total;
    }

    public async Task<bool> ExistsByDniAsync(string dni)
    {
        return await _db.Registrations.AnyAsync(r => r.Dni == dni);
    }

    public async Task<bool> SendNotificationAsync(int id, string method)
    {
        var entity = await _db.Registrations.FindAsync(id);
        if (entity == null) return false;

        var webhookUrl = _config["Integrations:n8nWebhookUrl"];
        if (string.IsNullOrEmpty(webhookUrl)) return false;

        // Generar PDF
        var pdfBytes = await _pdf.GenerateConstanciaAsync(id);
        var pdfBase64 = Convert.ToBase64String(pdfBytes);

        var payload = new
        {
            registrationId = entity.Id,
            dni = entity.Dni,
            fullName = $"{entity.PaternalSurname} {entity.MaternalSurname}, {entity.FirstNames}",
            email = entity.Email,
            phone = entity.Phone,
            method = method,
            pdfBase64 = pdfBase64,
            timestamp = DateTime.UtcNow
        };

        using var client = _httpClientFactory.CreateClient();
        var response = await client.PostAsJsonAsync(webhookUrl, payload);
        
        if (response.IsSuccessStatusCode)
        {
            await _audit.LogAsync("ApplicantRegistration", id, $"Notify_{method}", null, $"Notificación de constancia enviada por {method}");
            return true;
        }

        return false;
    }

    private static RegistrationResponse MapToResponse(ApplicantRegistration entity)
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

            CurrentAddress = entity.CurrentAddress,
            CurrentDepartment = entity.CurrentDepartment,
            CurrentProvince = entity.CurrentProvince,
            CurrentDistrict = entity.CurrentDistrict,

            HairColor = entity.HairColor,
            EyeColor = entity.EyeColor,
            Complexion = entity.Complexion,
            BloodType = entity.BloodType,
            ShoeSize = entity.ShoeSize,

            EducationLevel = entity.EducationLevel,
            MilitaryServiceInterest = entity.MilitaryServiceInterest,
            Weight = entity.Weight,
            Height = entity.Height,
            
            PhotoPath = entity.PhotoPath,
            ProfilePhotoPath = entity.ProfilePhotoPath,
            SignaturePath = entity.SignaturePath,
            
            FingerprintStatus = entity.FingerprintStatus,
            LeftIndexFingerprintStatus = entity.LeftIndexFingerprintStatus,
            RightIndexFingerprintStatus = entity.RightIndexFingerprintStatus,

            RegistrationMode = entity.RegistrationMode,
            Observations = entity.Observations,
            RegistrationStatus = entity.RegistrationStatus,
            SyncStatus = entity.SyncStatus,
            SyncMessage = entity.SyncMessage,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedByName = entity.CreatedByUser?.FullName ?? "Autoservicio",
            UpdatedByName = entity.UpdatedByUser?.FullName
        };
    }
}
