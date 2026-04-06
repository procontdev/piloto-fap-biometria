using System.Text;
using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class ExportService : IExportService
{
    private readonly AppDbContext _db;

    public ExportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<byte[]> ExportToCsvAsync(RegistrationFilterRequest filter)
    {
        var query = _db.Registrations.AsQueryable();

        // Aplicamos los mismos filtros que GetAllAsync
        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(r => r.Dni.Contains(term) || r.FirstNames.ToLower().Contains(term) || r.PaternalSurname.ToLower().Contains(term));
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

        query = query.OrderByDescending(x => x.CreatedAt);

        var data = await query.ToListAsync();

        var sb = new StringBuilder();
        // Cargar UTF-8 BOM para que Excel lea los acentos correctamente
        sb.AppendLine("DNI,Nombres,Apellidos,Fec_Nacimiento,Sexo,Telefono,Direccion,Peso(kg),Talla(m),Modalidad_Registro,Estado,Huella,Tiene_Foto,Fec_Registro");

        foreach (var r in data)
        {
            var apellidos = $"{r.PaternalSurname} {r.MaternalSurname}".Replace(",", " ");
            var nombres = r.FirstNames.Replace(",", " ");
            var direccion = r.Address.Replace(",", " ");
            var hasPhoto = string.IsNullOrEmpty(r.PhotoPath) ? "No" : "Sí";
            
            sb.AppendLine($"{r.Dni},{nombres},{apellidos},{r.BirthDate:yyyy-MM-dd},{r.Gender},{r.Phone},{direccion},{r.Weight},{r.Height},{r.RegistrationMode},{r.RegistrationStatus},{r.FingerprintStatus},{hasPhoto},{r.CreatedAt:yyyy-MM-dd HH:mm}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString()); // UTF8 GetBytes
    }
}
