using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FapPiloto.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBiometricsAndDualFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "Registrations",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<string>(
                name: "FingerprintStatus",
                table: "Registrations",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Height",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationMode",
                table: "Registrations",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "AuditLogs",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$2R8VTm.p9tI7hwVZN3yN6uARRWCq6LKWVhJxvZgzxlSpI2P9uxqZ2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$Ewo4REX20txlBaNwoKLslOyUIDIQVi.G/OjeHz.XAM6D/VbdNOsHC");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FingerprintStatus",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "RegistrationMode",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Registrations");

            migrationBuilder.AlterColumn<int>(
                name: "CreatedBy",
                table: "Registrations",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "AuditLogs",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$JM/i4lqir6qfNfqFm4ujPOyy0Ned9G212g4AkIH6pbqF3EVffPJlW");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$8f2k.QWdyZ.e0iTRGH/jUO.y5dn2EmBRPgKioQqvEJG8yAHF19TTi");
        }
    }
}
