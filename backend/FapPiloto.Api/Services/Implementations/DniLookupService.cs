using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class DniLookupService : IDniLookupService
{
    private readonly AppDbContext _db;

    public DniLookupService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DniLookupResponse?> LookupAsync(string dni)
    {
        var record = await _db.DniMockRecords.FirstOrDefaultAsync(d => d.Dni == dni);
        if (record == null) return null;

        return new DniLookupResponse(
            record.Dni,
            record.FirstNames,
            record.PaternalSurname,
            record.MaternalSurname,
            record.BirthDate,
            record.Gender,
            "Av. Institucional " + new Random().Next(100, 999),
            "LIMA",
            "LIMA",
            "LIMA"
        );
    }
}
