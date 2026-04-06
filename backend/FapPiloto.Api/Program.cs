using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using FapPiloto.Api.Data;
using FapPiloto.Api.Security;
using FapPiloto.Api.Services.Implementations;
using FapPiloto.Api.Services.Interfaces;

// QuestPDF Community License
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// === Database ===
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=fap_piloto_v2.db"));

// === Authentication ===
using var bootstrapLoggerFactory = LoggerFactory.Create(logging => logging.AddConsole());
var bootstrapLogger = bootstrapLoggerFactory.CreateLogger("JwtConfiguration");
var jwtConfig = JwtConfigurationResolver.Resolve(builder.Configuration, bootstrapLogger);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidAudience = jwtConfig.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.Key)),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

// === Services (DI) ===
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDniLookupService, DniLookupService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ISyncService, SyncService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IExportService, ExportService>();

// === Controllers ===
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// === CORS ===
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// === Ensure database is created and migrated ===
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("StartupDataRepair");

    db.Database.EnsureCreated();

    // Ensure critical auth seed data exists in persistent databases.
    var operadorRole = db.Roles.FirstOrDefault(r => r.Name == "Operador");
    if (operadorRole == null)
    {
        operadorRole = new FapPiloto.Api.Entities.Role
        {
            Name = "Operador",
            Description = "Registro y consulta de inscripciones"
        };
        db.Roles.Add(operadorRole);
    }

    var supervisorRole = db.Roles.FirstOrDefault(r => r.Name == "Supervisor");
    if (supervisorRole == null)
    {
        supervisorRole = new FapPiloto.Api.Entities.Role
        {
            Name = "Supervisor",
            Description = "Dashboard, auditoría y administración"
        };
        db.Roles.Add(supervisorRole);
    }

    db.SaveChanges();

    var operador = db.Users.FirstOrDefault(u => u.Username == "operador1");
    if (operador == null)
    {
        db.Users.Add(new FapPiloto.Api.Entities.User
        {
            Username = "operador1",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operador123"),
            FullName = "Juan Perez Garcia",
            RoleId = operadorRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        logger.LogInformation("Default user operador1 recreated");
    }
    else if (!db.Roles.Any(r => r.Id == operador.RoleId))
    {
        operador.RoleId = operadorRole.Id;
        logger.LogWarning("User operador1 had invalid RoleId. Repaired to Operador");
    }

    if (operador != null)
    {
        try
        {
            _ = BCrypt.Net.BCrypt.Verify("Operador123", operador.PasswordHash);
        }
        catch (Exception ex)
        {
            operador.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operador123");
            logger.LogWarning(ex, "User operador1 had invalid PasswordHash. Hash reset to seed default password");
        }
    }

    var supervisor = db.Users.FirstOrDefault(u => u.Username == "supervisor1");
    if (supervisor == null)
    {
        db.Users.Add(new FapPiloto.Api.Entities.User
        {
            Username = "supervisor1",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Supervisor123"),
            FullName = "Maria Lopez Torres",
            RoleId = supervisorRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        logger.LogInformation("Default user supervisor1 recreated");
    }
    else if (!db.Roles.Any(r => r.Id == supervisor.RoleId))
    {
        supervisor.RoleId = supervisorRole.Id;
        logger.LogWarning("User supervisor1 had invalid RoleId. Repaired to Supervisor");
    }

    if (supervisor != null)
    {
        try
        {
            _ = BCrypt.Net.BCrypt.Verify("Supervisor123", supervisor.PasswordHash);
        }
        catch (Exception ex)
        {
            supervisor.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Supervisor123");
            logger.LogWarning(ex, "User supervisor1 had invalid PasswordHash. Hash reset to seed default password");
        }
    }

    db.SaveChanges();
}

// === Middleware pipeline ===
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "FAP Piloto Biometría API is running... 🚀");

app.Run();
