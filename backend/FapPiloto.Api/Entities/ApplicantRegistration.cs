namespace FapPiloto.Api.Entities;

public class ApplicantRegistration
{
    public int Id { get; set; }

    // Identificación
    public string Dni { get; set; } = string.Empty;
    public string FirstNames { get; set; } = string.Empty;
    public string PaternalSurname { get; set; } = string.Empty;
    public string MaternalSurname { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string Gender { get; set; } = string.Empty; // "M" | "F"

    // Contacto
    public string? Phone { get; set; }
    public string? Email { get; set; }

    // Ubicación RENIEC (Datos oficiales)
    public string Address { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;

    // Ubicación Actual (Declarada)
    public string? CurrentAddress { get; set; }
    public string? CurrentDepartment { get; set; }
    public string? CurrentProvince { get; set; }
    public string? CurrentDistrict { get; set; }

    // Datos físicos / Filiación
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public string? HairColor { get; set; }
    public string? EyeColor { get; set; }
    public string? Complexion { get; set; } // Tez
    public string? BloodType { get; set; }
    public decimal? ShoeSize { get; set; }

    // Biometría y Evidencias
    public string? PhotoPath { get; set; } // Foto Frontal (Legacy / Main)
    public string? ProfilePhotoPath { get; set; }
    public string? SignaturePath { get; set; }
    
    public string FingerprintStatus { get; set; } = "Pendiente"; // Legacy status
    public string LeftIndexFingerprintStatus { get; set; } = "Pendiente";
    public string RightIndexFingerprintStatus { get; set; } = "Pendiente";

    // Datos adicionales
    public string EducationLevel { get; set; } = string.Empty;
    public bool MilitaryServiceInterest { get; set; }

    // Flujo
    public string RegistrationMode { get; set; } = "Operador"; // Operador | Autoservicio

    public string? Observations { get; set; }

    // Estados
    public string RegistrationStatus { get; set; } = "Completado"; // Borrador | Completado | Anulado
    public string SyncStatus { get; set; } = "Pendiente"; // Pendiente | Sincronizado | Observado | Error
    public string? SyncMessage { get; set; } // Detalle del estado de sincronización

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }

    // Navigation
    public User? CreatedByUser { get; set; }
    public User? UpdatedByUser { get; set; }
}
