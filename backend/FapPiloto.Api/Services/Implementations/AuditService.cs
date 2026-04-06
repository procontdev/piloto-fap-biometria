using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Entities;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;

    public AuditService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string entityName, int entityId, string action, int? userId,
        string? description = null, object? oldValues = null, object? newValues = null)
    {
        try
        {
            var log = new AuditLog
            {
                EntityName = entityName,
                EntityId = entityId,
                Action = action,
                Description = description,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                UserId = userId,
                Timestamp = DateTime.UtcNow
            };

            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AUDIT ERROR] Failed to log audit for {entityName} {entityId}: {ex.Message}");
        }
    }

    public async Task<PagedResponse<AuditLogResponse>> GetLogsAsync(AuditFilterRequest filter)
    {
        var query = _db.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.EntityName))
            query = query.Where(a => a.EntityName == filter.EntityName);

        if (filter.EntityId.HasValue)
            query = query.Where(a => a.EntityId == filter.EntityId.Value);

        if (!string.IsNullOrEmpty(filter.Action))
            query = query.Where(a => a.Action == filter.Action);

        if (filter.From.HasValue)
            query = query.Where(a => a.Timestamp >= filter.From.Value);

        if (filter.To.HasValue)
            query = query.Where(a => a.Timestamp <= filter.To.Value);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AuditLogResponse
            {
                Id = a.Id,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action,
                Description = a.Description,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                UserName = a.User != null ? a.User.FullName : "Autoservicio",
                Timestamp = a.Timestamp
            })
            .ToListAsync();

        return new PagedResponse<AuditLogResponse>(items, totalCount, filter.Page, filter.PageSize, totalPages);
    }
}
