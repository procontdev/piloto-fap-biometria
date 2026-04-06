namespace FapPiloto.Api.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string Action { get; set; } = string.Empty; // Create | Update | Delete | StatusChange | SyncChange
    public string? OldValues { get; set; } // JSON snapshot before change
    public string? NewValues { get; set; } // JSON snapshot after change
    public string? Description { get; set; } // Human-readable description
    public int? UserId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }

    // Navigation
    public User? User { get; set; }
}
