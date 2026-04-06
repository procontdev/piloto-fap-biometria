using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FapPiloto.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DniMockRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Dni = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    FirstNames = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    PaternalSurname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    MaternalSurname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Gender = table.Column<string>(type: "TEXT", maxLength: 1, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DniMockRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    RoleId = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EntityName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    EntityId = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    OldValues = table.Column<string>(type: "TEXT", nullable: true),
                    NewValues = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IpAddress = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Registrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Dni = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    FirstNames = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    PaternalSurname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    MaternalSurname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Gender = table.Column<string>(type: "TEXT", maxLength: 1, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Province = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    District = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    EducationLevel = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    MilitaryServiceInterest = table.Column<bool>(type: "INTEGER", nullable: false),
                    Observations = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    RegistrationStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    SyncStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    SyncMessage = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedBy = table.Column<int>(type: "INTEGER", nullable: false),
                    UpdatedBy = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Registrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Registrations_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Registrations_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "DniMockRecords",
                columns: new[] { "Id", "BirthDate", "Dni", "FirstNames", "Gender", "MaternalSurname", "PaternalSurname" },
                values: new object[,]
                {
                    { 1, new DateOnly(2008, 3, 15), "70000001", "Carlos Alberto", "M", "Huamán", "Quispe" },
                    { 2, new DateOnly(2008, 7, 22), "70000002", "Luis Fernando", "M", "Condori", "Mamani" },
                    { 3, new DateOnly(2008, 1, 10), "70000003", "Ana María", "F", "Ramos", "Flores" },
                    { 4, new DateOnly(2008, 11, 5), "70000004", "Diego Alejandro", "M", "Silva", "Torres" },
                    { 5, new DateOnly(2008, 5, 18), "70000005", "Rosa María", "F", "Mendoza", "García" },
                    { 6, new DateOnly(2008, 9, 30), "70000006", "Pedro José", "M", "Chávez", "Rojas" },
                    { 7, new DateOnly(2008, 2, 14), "70000007", "María Elena", "F", "Paredes", "Vargas" },
                    { 8, new DateOnly(2008, 8, 25), "70000008", "Jorge Luis", "M", "Herrera", "Castillo" },
                    { 9, new DateOnly(2008, 12, 1), "70000009", "Lucía Fernanda", "F", "Ruiz", "Salazar" },
                    { 10, new DateOnly(2008, 4, 8), "70000010", "Miguel Ángel", "M", "Díaz", "Espinoza" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Registro y consulta de inscripciones", "Operador" },
                    { 2, "Dashboard, auditoría y administración", "Supervisor" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "FullName", "IsActive", "PasswordHash", "RoleId", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Juan Pérez García", true, "$2a$11$JM/i4lqir6qfNfqFm4ujPOyy0Ned9G212g4AkIH6pbqF3EVffPJlW", 1, "operador1" },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "María López Torres", true, "$2a$11$8f2k.QWdyZ.e0iTRGH/jUO.y5dn2EmBRPgKioQqvEJG8yAHF19TTi", 2, "supervisor1" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityName_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityName", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Timestamp",
                table: "AuditLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DniMockRecords_Dni",
                table: "DniMockRecords",
                column: "Dni",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_CreatedBy",
                table: "Registrations",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_Dni",
                table: "Registrations",
                column: "Dni",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_UpdatedBy",
                table: "Registrations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "DniMockRecords");

            migrationBuilder.DropTable(
                name: "Registrations");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
