using Microsoft.EntityFrameworkCore;
using FapPiloto.Api.Entities;

namespace FapPiloto.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ApplicantRegistration> Registrations => Set<ApplicantRegistration>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DniMockRecord> DniMockRecords => Set<DniMockRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Role
        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).HasMaxLength(50).IsRequired();
            e.HasIndex(r => r.Name).IsUnique();
        });

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Username).HasMaxLength(50).IsRequired();
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            e.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId);
        });

        // ApplicantRegistration
        modelBuilder.Entity<ApplicantRegistration>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Dni).HasMaxLength(8).IsRequired();
            e.HasIndex(r => r.Dni).IsUnique();
            e.Property(r => r.FirstNames).HasMaxLength(150).IsRequired();
            e.Property(r => r.PaternalSurname).HasMaxLength(100).IsRequired();
            e.Property(r => r.MaternalSurname).HasMaxLength(100).IsRequired();
            e.Property(r => r.Gender).HasMaxLength(1).IsRequired();
            e.Property(r => r.Phone).HasMaxLength(15);
            e.Property(r => r.Email).HasMaxLength(150);
            e.Property(r => r.Address).HasMaxLength(300).IsRequired();
            e.Property(r => r.Department).HasMaxLength(100).IsRequired();
            e.Property(r => r.Province).HasMaxLength(100).IsRequired();
            e.Property(r => r.District).HasMaxLength(100).IsRequired();
            e.Property(r => r.EducationLevel).HasMaxLength(100).IsRequired();
            e.Property(r => r.Observations).HasMaxLength(500);
            e.Property(r => r.RegistrationStatus).HasMaxLength(50).IsRequired();
            e.Property(r => r.SyncStatus).HasMaxLength(50).IsRequired();
            e.Property(r => r.SyncMessage).HasMaxLength(500);

            e.HasOne(r => r.CreatedByUser)
                .WithMany()
                .HasForeignKey(r => r.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.UpdatedByUser)
                .WithMany()
                .HasForeignKey(r => r.UpdatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.EntityName).HasMaxLength(100).IsRequired();
            e.Property(a => a.Action).HasMaxLength(50).IsRequired();
            e.Property(a => a.Description).HasMaxLength(500);
            e.Property(a => a.IpAddress).HasMaxLength(50);
            e.HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(a => a.Timestamp);
            e.HasIndex(a => new { a.EntityName, a.EntityId });
        });

        // DniMockRecord
        modelBuilder.Entity<DniMockRecord>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.Dni).HasMaxLength(8).IsRequired();
            e.HasIndex(d => d.Dni).IsUnique();
            e.Property(d => d.FirstNames).HasMaxLength(150).IsRequired();
            e.Property(d => d.PaternalSurname).HasMaxLength(100).IsRequired();
            e.Property(d => d.MaternalSurname).HasMaxLength(100).IsRequired();
            e.Property(d => d.Gender).HasMaxLength(1).IsRequired();
        });

        // === SEED DATA ===
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Operador", Description = "Registro y consulta de inscripciones" },
            new Role { Id = 2, Name = "Supervisor", Description = "Dashboard, auditoría y administración" }
        );

        // Users (passwords: Operador123, Supervisor123)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "operador1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operador123"),
                FullName = "Juan Perez Garcia",
                RoleId = 1,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 2,
                Username = "supervisor1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Supervisor123"),
                FullName = "Maria Lopez Torres",
                RoleId = 2,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // DNI Mock Records (10 registros ficticios)
        modelBuilder.Entity<DniMockRecord>().HasData(
            new DniMockRecord { Id = 1, Dni = "70000001", FirstNames = "Carlos Alberto", PaternalSurname = "Quispe", MaternalSurname = "Huamán", BirthDate = new DateOnly(2008, 3, 15), Gender = "M" },
            new DniMockRecord { Id = 2, Dni = "70000002", FirstNames = "Luis Fernando", PaternalSurname = "Mamani", MaternalSurname = "Condori", BirthDate = new DateOnly(2008, 7, 22), Gender = "M" },
            new DniMockRecord { Id = 3, Dni = "70000003", FirstNames = "Ana María", PaternalSurname = "Flores", MaternalSurname = "Ramos", BirthDate = new DateOnly(2008, 1, 10), Gender = "F" },
            new DniMockRecord { Id = 4, Dni = "70000004", FirstNames = "Diego Alejandro", PaternalSurname = "Torres", MaternalSurname = "Silva", BirthDate = new DateOnly(2008, 11, 5), Gender = "M" },
            new DniMockRecord { Id = 5, Dni = "70000005", FirstNames = "Rosa María", PaternalSurname = "García", MaternalSurname = "Mendoza", BirthDate = new DateOnly(2008, 5, 18), Gender = "F" },
            new DniMockRecord { Id = 6, Dni = "70000006", FirstNames = "Pedro José", PaternalSurname = "Rojas", MaternalSurname = "Chávez", BirthDate = new DateOnly(2008, 9, 30), Gender = "M" },
            new DniMockRecord { Id = 7, Dni = "70000007", FirstNames = "María Elena", PaternalSurname = "Vargas", MaternalSurname = "Paredes", BirthDate = new DateOnly(2008, 2, 14), Gender = "F" },
            new DniMockRecord { Id = 8, Dni = "70000008", FirstNames = "Jorge Luis", PaternalSurname = "Castillo", MaternalSurname = "Herrera", BirthDate = new DateOnly(2008, 8, 25), Gender = "M" },
            new DniMockRecord { Id = 9, Dni = "70000009", FirstNames = "Lucía Fernanda", PaternalSurname = "Salazar", MaternalSurname = "Ruiz", BirthDate = new DateOnly(2008, 12, 1), Gender = "F" },
            new DniMockRecord { Id = 10, Dni = "70000010", FirstNames = "Miguel Ángel", PaternalSurname = "Espinoza", MaternalSurname = "Díaz", BirthDate = new DateOnly(2008, 4, 8), Gender = "M" },
            new DniMockRecord { Id = 11, Dni = "70000011", FirstNames = "Sonia Patricia", PaternalSurname = "Palomino", MaternalSurname = "Soto", BirthDate = new DateOnly(2008, 5, 12), Gender = "F" },
            new DniMockRecord { Id = 12, Dni = "70000012", FirstNames = "Roberto Carlos", PaternalSurname = "Delgado", MaternalSurname = "Rivas", BirthDate = new DateOnly(2008, 1, 25), Gender = "M" },
            new DniMockRecord { Id = 13, Dni = "70000013", FirstNames = "Andrea Cecilia", PaternalSurname = "Navarro", MaternalSurname = "Silva", BirthDate = new DateOnly(2008, 10, 3), Gender = "F" },
            new DniMockRecord { Id = 14, Dni = "70000014", FirstNames = "Andrés Avelino", PaternalSurname = "Cáceres", MaternalSurname = "Dongo", BirthDate = new DateOnly(2008, 6, 30), Gender = "M" },
            new DniMockRecord { Id = 15, Dni = "70000015", FirstNames = "Gabriela Pilar", PaternalSurname = "Medina", MaternalSurname = "Bravo", BirthDate = new DateOnly(2008, 2, 8), Gender = "F" },
            new DniMockRecord { Id = 16, Dni = "70000016", FirstNames = "Francisco Javier", PaternalSurname = "Pardo", MaternalSurname = "Guzmán", BirthDate = new DateOnly(2008, 11, 15), Gender = "M" },
            new DniMockRecord { Id = 17, Dni = "70000017", FirstNames = "Beatriz Clara", PaternalSurname = "Montalvo", MaternalSurname = "León", BirthDate = new DateOnly(2008, 8, 19), Gender = "F" },
            new DniMockRecord { Id = 18, Dni = "70000018", FirstNames = "Víctor Manuel", PaternalSurname = "Salazar", MaternalSurname = "Uribe", BirthDate = new DateOnly(2008, 3, 22), Gender = "M" },
            new DniMockRecord { Id = 19, Dni = "70000019", FirstNames = "Isabel Cristina", PaternalSurname = "Bustamante", MaternalSurname = "Ortiz", BirthDate = new DateOnly(2008, 7, 14), Gender = "F" },
            new DniMockRecord { Id = 20, Dni = "70000020", FirstNames = "Álvaro José", PaternalSurname = "Cornejo", MaternalSurname = "Roca", BirthDate = new DateOnly(2008, 1, 1), Gender = "M" },
            new DniMockRecord { Id = 21, Dni = "70000021", FirstNames = "Daniela Roxana", PaternalSurname = "Villanueva", MaternalSurname = "Vega", BirthDate = new DateOnly(2008, 4, 11), Gender = "F" },
            new DniMockRecord { Id = 22, Dni = "70000022", FirstNames = "Héctor Ricardo", PaternalSurname = "Guerrero", MaternalSurname = "Lapa", BirthDate = new DateOnly(2008, 2, 28), Gender = "M" },
            new DniMockRecord { Id = 23, Dni = "70000023", FirstNames = "Carmen Julia", PaternalSurname = "Mendoza", MaternalSurname = "Saavedra", BirthDate = new DateOnly(2008, 9, 7), Gender = "F" },
            new DniMockRecord { Id = 24, Dni = "70000024", FirstNames = "Eduardo Felipe", PaternalSurname = "Ibañez", MaternalSurname = "Luna", BirthDate = new DateOnly(2008, 6, 17), Gender = "M" },
            new DniMockRecord { Id = 25, Dni = "70000025", FirstNames = "Natalia Emperatriz", PaternalSurname = "Arias", MaternalSurname = "Paz", BirthDate = new DateOnly(2008, 12, 5), Gender = "F" },
            new DniMockRecord { Id = 26, Dni = "70000026", FirstNames = "Oscar Enrique", PaternalSurname = "Balbi", MaternalSurname = "Salcedo", BirthDate = new DateOnly(2008, 11, 20), Gender = "M" },
            new DniMockRecord { Id = 27, Dni = "70000027", FirstNames = "Silvia Irene", PaternalSurname = "Carvajal", MaternalSurname = "Ríos", BirthDate = new DateOnly(2008, 10, 31), Gender = "F" },
            new DniMockRecord { Id = 28, Dni = "70000028", FirstNames = "Manuel Antonio", PaternalSurname = "Belgrano", MaternalSurname = "Moreno", BirthDate = new DateOnly(2008, 5, 25), Gender = "M" },
            new DniMockRecord { Id = 29, Dni = "70000029", FirstNames = "Claudia Cecilia", PaternalSurname = "Zegarra", MaternalSurname = "Lazo", BirthDate = new DateOnly(2008, 3, 8), Gender = "F" },
            new DniMockRecord { Id = 30, Dni = "70000030", FirstNames = "Rafael Humberto", PaternalSurname = "Ferrand", MaternalSurname = "Cisneros", BirthDate = new DateOnly(2008, 7, 2), Gender = "M" },
            new DniMockRecord { Id = 31, Dni = "70000031", FirstNames = "Marita Elena", PaternalSurname = "Aranda", MaternalSurname = "Dávila", BirthDate = new DateOnly(2008, 9, 13), Gender = "F" },
            new DniMockRecord { Id = 32, Dni = "70000032", FirstNames = "Julio César", PaternalSurname = "Santisteban", MaternalSurname = "Brizuela", BirthDate = new DateOnly(2008, 1, 15), Gender = "M" },
            new DniMockRecord { Id = 33, Dni = "70000033", FirstNames = "Verónica Lucía", PaternalSurname = "Peralta", MaternalSurname = "Lynch", BirthDate = new DateOnly(2008, 4, 30), Gender = "F" },
            new DniMockRecord { Id = 34, Dni = "70000034", FirstNames = "Guillermo León", PaternalSurname = "Aliaga", MaternalSurname = "Carranza", BirthDate = new DateOnly(2008, 6, 21), Gender = "M" },
            new DniMockRecord { Id = 35, Dni = "70000035", FirstNames = "Diana Carolina", PaternalSurname = "Chirinos", MaternalSurname = "Ramos", BirthDate = new DateOnly(2008, 8, 1), Gender = "F" },
            new DniMockRecord { Id = 36, Dni = "70000036", FirstNames = "Fernando Alfonso", PaternalSurname = "Reaño", MaternalSurname = "Tirado", BirthDate = new DateOnly(2008, 11, 11), Gender = "M" },
            new DniMockRecord { Id = 37, Dni = "70000037", FirstNames = "Karen Vanessa", PaternalSurname = "Gallardo", MaternalSurname = "Echegaray", BirthDate = new DateOnly(2008, 2, 19), Gender = "F" },
            new DniMockRecord { Id = 38, Dni = "70000038", FirstNames = "Pablo Francisco", PaternalSurname = "Zárate", MaternalSurname = "Olaya", BirthDate = new DateOnly(2008, 5, 2), Gender = "M" },
            new DniMockRecord { Id = 39, Dni = "70000039", FirstNames = "Milagros Rosario", PaternalSurname = "Quimper", MaternalSurname = "Paz", BirthDate = new DateOnly(2008, 10, 18), Gender = "F" },
            new DniMockRecord { Id = 40, Dni = "70000040", FirstNames = "Alejandro Román", PaternalSurname = "Ugarte", MaternalSurname = "Palacios", BirthDate = new DateOnly(2008, 7, 7), Gender = "M" },
            new DniMockRecord { Id = 41, Dni = "70000041", FirstNames = "Gisella Ivonne", PaternalSurname = "Osterling", MaternalSurname = "Letts", BirthDate = new DateOnly(2008, 1, 12), Gender = "F" },
            new DniMockRecord { Id = 42, Dni = "70000042", FirstNames = "Pedro Abelardo", PaternalSurname = "Guevara", MaternalSurname = "Llanos", BirthDate = new DateOnly(2008, 3, 29), Gender = "M" },
            new DniMockRecord { Id = 43, Dni = "70000043", FirstNames = "Tania Libertad", PaternalSurname = "Noriega", MaternalSurname = "Casas", BirthDate = new DateOnly(2008, 12, 9), Gender = "F" },
            new DniMockRecord { Id = 44, Dni = "70000044", FirstNames = "Marco Antonio", PaternalSurname = "Solis", MaternalSurname = "Reynoso", BirthDate = new DateOnly(2008, 6, 2), Gender = "M" },
            new DniMockRecord { Id = 45, Dni = "70000045", FirstNames = "Elena Sofía", PaternalSurname = "Mendiola", MaternalSurname = "Arizmendi", BirthDate = new DateOnly(2008, 8, 21), Gender = "F" },
            new DniMockRecord { Id = 46, Dni = "70000046", FirstNames = "José Carlos", PaternalSurname = "Mariátegui", MaternalSurname = "Lira", BirthDate = new DateOnly(2008, 5, 14), Gender = "M" },
            new DniMockRecord { Id = 47, Dni = "70000047", FirstNames = "Rosa Luz", PaternalSurname = "Velasco", MaternalSurname = "Alvarado", BirthDate = new DateOnly(2008, 9, 2), Gender = "F" },
            new DniMockRecord { Id = 48, Dni = "70000048", FirstNames = "Emilio Martín", PaternalSurname = "Adolfo", MaternalSurname = "Westphalen", BirthDate = new DateOnly(2008, 7, 10), Gender = "M" },
            new DniMockRecord { Id = 49, Dni = "70000049", FirstNames = "Blanca Varela", PaternalSurname = "Gonzáles", MaternalSurname = "Prada", BirthDate = new DateOnly(2008, 1, 20), Gender = "F" },
            new DniMockRecord { Id = 50, Dni = "70000050", FirstNames = "Abraham Valdelomar", PaternalSurname = "Pinto", MaternalSurname = "Arias", BirthDate = new DateOnly(2008, 8, 30), Gender = "M" }
        );
    }
}
