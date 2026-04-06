namespace FapPiloto.Api.DTOs;

// === AUTH ===
public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string Username, string FullName, string Role, DateTime ExpiresAt);

// === DNI ===
public record DniLookupResponse(
    string Dni,
    string FirstNames,
    string PaternalSurname,
    string MaternalSurname,
    DateOnly BirthDate,
    string Gender,
    string Address,
    string Department,
    string Province,
    string District
);

// === REGISTRATION ===
public record CreateRegistrationRequest
{
    public string Dni { get; init; } = string.Empty;
    public string FirstNames { get; init; } = string.Empty;
    public string PaternalSurname { get; init; } = string.Empty;
    public string MaternalSurname { get; init; } = string.Empty;
    public DateOnly BirthDate { get; init; }
    public string Gender { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string Address { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public string Province { get; init; } = string.Empty;
    public string District { get; init; } = string.Empty;
    
    // Ubicación Actual
    public string? CurrentAddress { get; init; }
    public string? CurrentDepartment { get; init; }
    public string? CurrentProvince { get; init; }
    public string? CurrentDistrict { get; init; }

    // Datos físicos
    public string? HairColor { get; init; }
    public string? EyeColor { get; init; }
    public string? Complexion { get; init; }
    public string? BloodType { get; init; }
    public decimal? ShoeSize { get; init; }

    public string EducationLevel { get; init; } = string.Empty;
    public bool MilitaryServiceInterest { get; init; }
    public decimal? Weight { get; init; }
    public decimal? Height { get; init; }
    
    // Evidencias
    public string? PhotoPath { get; init; }
    public string? ProfilePhotoPath { get; init; }
    public string? SignaturePath { get; init; }
    public string FingerprintStatus { get; init; } = "Pendiente";
    public string? LeftIndexFingerprintStatus { get; init; }
    public string? RightIndexFingerprintStatus { get; init; }

    public string RegistrationMode { get; init; } = "Operador";
    public string? Observations { get; init; }
}

public record UpdateRegistrationRequest
{
    public string? FirstNames { get; init; }
    public string? PaternalSurname { get; init; }
    public string? MaternalSurname { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string Address { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public string Province { get; init; } = string.Empty;
    public string District { get; init; } = string.Empty;
    public string? CurrentAddress { get; init; }
    public string? CurrentDepartment { get; init; }
    public string? CurrentProvince { get; init; }
    public string? CurrentDistrict { get; init; }
    
    public string? HairColor { get; init; }
    public string? EyeColor { get; init; }
    public string? Complexion { get; init; }
    public string? BloodType { get; init; }
    public decimal? ShoeSize { get; init; }

    public string EducationLevel { get; init; } = string.Empty;
    public bool MilitaryServiceInterest { get; init; }
    public decimal? Weight { get; init; }
    public decimal? Height { get; init; }
    
    public string? PhotoPath { get; init; }
    public string? ProfilePhotoPath { get; init; }
    public string? SignaturePath { get; init; }
    public string? FingerprintStatus { get; init; }
    public string? LeftIndexFingerprintStatus { get; init; }
    public string? RightIndexFingerprintStatus { get; init; }

    public string? RegistrationStatus { get; init; }
    public string? Observations { get; init; }
}

public record RegistrationResponse
{
    public int Id { get; init; }
    public string Dni { get; init; } = string.Empty;
    public string FirstNames { get; init; } = string.Empty;
    public string PaternalSurname { get; init; } = string.Empty;
    public string MaternalSurname { get; init; } = string.Empty;
    public DateOnly BirthDate { get; init; }
    public string Gender { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string Address { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public string Province { get; init; } = string.Empty;
    public string District { get; init; } = string.Empty;
    
    public string? CurrentAddress { get; init; }
    public string? CurrentDepartment { get; init; }
    public string? CurrentProvince { get; init; }
    public string? CurrentDistrict { get; init; }

    public string? HairColor { get; init; }
    public string? EyeColor { get; init; }
    public string? Complexion { get; init; }
    public string? BloodType { get; init; }
    public decimal? ShoeSize { get; init; }

    public string EducationLevel { get; init; } = string.Empty;
    public bool MilitaryServiceInterest { get; init; }
    public decimal? Weight { get; init; }
    public decimal? Height { get; init; }
    
    public string? PhotoPath { get; init; }
    public string? ProfilePhotoPath { get; init; }
    public string? SignaturePath { get; init; }
    public string FingerprintStatus { get; init; } = "Pendiente";
    public string LeftIndexFingerprintStatus { get; init; } = "Pendiente";
    public string RightIndexFingerprintStatus { get; init; } = "Pendiente";

    public string RegistrationMode { get; init; } = "Operador";
    public string? Observations { get; init; }
    public string RegistrationStatus { get; init; } = string.Empty;
    public string SyncStatus { get; init; } = string.Empty;
    public string? SyncMessage { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? CreatedByName { get; init; }
    public string? UpdatedByName { get; init; }
}

public record RegistrationListItemResponse
{
    public int Id { get; init; }
    public string Dni { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public string RegistrationStatus { get; init; } = string.Empty;
    public string SyncStatus { get; init; } = string.Empty;
    public bool MilitaryServiceInterest { get; init; }
    public string RegistrationMode { get; init; } = string.Empty;
    public bool HasPhoto { get; init; }
    public string FingerprintStatus { get; init; } = string.Empty;
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public DateTime CreatedAt { get; init; }
}

// === PAGINATION ===
public record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record RegistrationFilterRequest
{
    public string? SearchTerm { get; init; } // DNI or name
    public string? RegistrationStatus { get; init; }
    public string? SyncStatus { get; init; }
    public string? Department { get; init; }
    public bool? MilitaryServiceInterest { get; init; }
    public string? RegistrationMode { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string SortBy { get; init; } = "CreatedAt";
    public string SortDirection { get; init; } = "desc";
}

// === DASHBOARD ===
public record DashboardResponse
{
    public int TotalRegistrations { get; init; }
    public int TodayRegistrations { get; init; }
    public int MilitaryInterestCount { get; init; }
    public Dictionary<string, int> ByStatus { get; init; } = new();
    public Dictionary<string, int> BySyncStatus { get; init; } = new();
    public Dictionary<string, int> ByDepartment { get; init; } = new();
    public Dictionary<string, int> ByGender { get; init; } = new();
    public Dictionary<string, int> ByMode { get; init; } = new();
    public int WithPhotoCount { get; init; }
    public int WithFingerprintCount { get; init; }
    public List<RegistrationListItemResponse> RecentRegistrations { get; init; } = new();
}

// === AUDIT ===
public record AuditLogResponse
{
    public int Id { get; init; }
    public string EntityName { get; init; } = string.Empty;
    public int EntityId { get; init; }
    public string Action { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? OldValues { get; init; }
    public string? NewValues { get; init; }
    public string UserName { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
}

public record AuditFilterRequest
{
    public string? EntityName { get; init; }
    public int? EntityId { get; init; }
    public string? Action { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

// === SYNC ===
public record UpdateSyncStatusRequest(string SyncStatus, string? SyncMessage);

// === COMMON ===
public record ApiErrorResponse(string Message, Dictionary<string, string[]>? Errors = null);
