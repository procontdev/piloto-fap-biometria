using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardResponse> GetDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var registrations = _db.Registrations.AsQueryable();

        var totalRegistrations = await registrations.CountAsync();
        var todayRegistrations = await registrations.CountAsync(r => r.CreatedAt.Date == today);
        var militaryInterestCount = await registrations.CountAsync(r => r.MilitaryServiceInterest);

        var byStatus = await registrations
            .GroupBy(r => r.RegistrationStatus)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var bySyncStatus = await registrations
            .GroupBy(r => r.SyncStatus)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var byDepartment = await registrations
            .GroupBy(r => r.Department)
            .Select(g => new { g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var byGender = await registrations
            .GroupBy(r => r.Gender)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var byMode = await registrations
            .GroupBy(r => r.RegistrationMode)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);

        var withPhotoCount = await registrations.CountAsync(r => r.PhotoPath != null && r.PhotoPath != "");
        var withFingerprintCount = await registrations.CountAsync(r => r.FingerprintStatus == "Capturada");

        var recentRegistrations = await registrations
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
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
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new DashboardResponse
        {
            TotalRegistrations = totalRegistrations,
            TodayRegistrations = todayRegistrations,
            MilitaryInterestCount = militaryInterestCount,
            ByStatus = byStatus,
            BySyncStatus = bySyncStatus,
            ByDepartment = byDepartment,
            ByGender = byGender,
            ByMode = byMode,
            WithPhotoCount = withPhotoCount,
            WithFingerprintCount = withFingerprintCount,
            RecentRegistrations = recentRegistrations
        };
    }
}
