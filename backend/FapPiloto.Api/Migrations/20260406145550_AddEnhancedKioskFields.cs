using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FapPiloto.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEnhancedKioskFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BloodType",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Complexion",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentAddress",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentDepartment",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentDistrict",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentProvince",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EyeColor",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HairColor",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeftIndexFingerprintStatus",
                table: "Registrations",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProfilePhotoPath",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RightIndexFingerprintStatus",
                table: "Registrations",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ShoeSize",
                table: "Registrations",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SignaturePath",
                table: "Registrations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$iiCM2vwIpqKP647TpMinLuLnvVbjmRvlzWsf3rsgu6uacIh1b88.6");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$npOvc8LENsbHf.T4q.CgZOtk5JYibWAMqb4qtODKoObNJQ1zof3Ci");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BloodType",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Complexion",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CurrentAddress",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CurrentDepartment",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CurrentDistrict",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CurrentProvince",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "EyeColor",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "HairColor",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "LeftIndexFingerprintStatus",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ProfilePhotoPath",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "RightIndexFingerprintStatus",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ShoeSize",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "SignaturePath",
                table: "Registrations");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$NhepLipSKikTxA2fidUxgusxwg6vMNwna7kiXYSREk.7v3kfG9Z.q");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$QE.J0.pwT4X6/pbDUSXQ4.I1rXaC3JcmG7L0yxL/Y32k7jXWNl0Du");
        }
    }
}
