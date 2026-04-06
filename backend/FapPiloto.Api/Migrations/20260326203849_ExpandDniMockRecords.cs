using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FapPiloto.Api.Migrations
{
    /// <inheritdoc />
    public partial class ExpandDniMockRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "DniMockRecords",
                columns: new[] { "Id", "BirthDate", "Dni", "FirstNames", "Gender", "MaternalSurname", "PaternalSurname" },
                values: new object[,]
                {
                    { 11, new DateOnly(2008, 5, 12), "70000011", "Sonia Patricia", "F", "Soto", "Palomino" },
                    { 12, new DateOnly(2008, 1, 25), "70000012", "Roberto Carlos", "M", "Rivas", "Delgado" },
                    { 13, new DateOnly(2008, 10, 3), "70000013", "Andrea Cecilia", "F", "Silva", "Navarro" },
                    { 14, new DateOnly(2008, 6, 30), "70000014", "Andrés Avelino", "M", "Dongo", "Cáceres" },
                    { 15, new DateOnly(2008, 2, 8), "70000015", "Gabriela Pilar", "F", "Bravo", "Medina" },
                    { 16, new DateOnly(2008, 11, 15), "70000016", "Francisco Javier", "M", "Guzmán", "Pardo" },
                    { 17, new DateOnly(2008, 8, 19), "70000017", "Beatriz Clara", "F", "León", "Montalvo" },
                    { 18, new DateOnly(2008, 3, 22), "70000018", "Víctor Manuel", "M", "Uribe", "Salazar" },
                    { 19, new DateOnly(2008, 7, 14), "70000019", "Isabel Cristina", "F", "Ortiz", "Bustamante" },
                    { 20, new DateOnly(2008, 1, 1), "70000020", "Álvaro José", "M", "Roca", "Cornejo" },
                    { 21, new DateOnly(2008, 4, 11), "70000021", "Daniela Roxana", "F", "Vega", "Villanueva" },
                    { 22, new DateOnly(2008, 2, 28), "70000022", "Héctor Ricardo", "M", "Lapa", "Guerrero" },
                    { 23, new DateOnly(2008, 9, 7), "70000023", "Carmen Julia", "F", "Saavedra", "Mendoza" },
                    { 24, new DateOnly(2008, 6, 17), "70000024", "Eduardo Felipe", "M", "Luna", "Ibañez" },
                    { 25, new DateOnly(2008, 12, 5), "70000025", "Natalia Emperatriz", "F", "Paz", "Arias" },
                    { 26, new DateOnly(2008, 11, 20), "70000026", "Oscar Enrique", "M", "Salcedo", "Balbi" },
                    { 27, new DateOnly(2008, 10, 31), "70000027", "Silvia Irene", "F", "Ríos", "Carvajal" },
                    { 28, new DateOnly(2008, 5, 25), "70000028", "Manuel Antonio", "M", "Moreno", "Belgrano" },
                    { 29, new DateOnly(2008, 3, 8), "70000029", "Claudia Cecilia", "F", "Lazo", "Zegarra" },
                    { 30, new DateOnly(2008, 7, 2), "70000030", "Rafael Humberto", "M", "Cisneros", "Ferrand" },
                    { 31, new DateOnly(2008, 9, 13), "70000031", "Marita Elena", "F", "Dávila", "Aranda" },
                    { 32, new DateOnly(2008, 1, 15), "70000032", "Julio César", "M", "Brizuela", "Santisteban" },
                    { 33, new DateOnly(2008, 4, 30), "70000033", "Verónica Lucía", "F", "Lynch", "Peralta" },
                    { 34, new DateOnly(2008, 6, 21), "70000034", "Guillermo León", "M", "Carranza", "Aliaga" },
                    { 35, new DateOnly(2008, 8, 1), "70000035", "Diana Carolina", "F", "Ramos", "Chirinos" },
                    { 36, new DateOnly(2008, 11, 11), "70000036", "Fernando Alfonso", "M", "Tirado", "Reaño" },
                    { 37, new DateOnly(2008, 2, 19), "70000037", "Karen Vanessa", "F", "Echegaray", "Gallardo" },
                    { 38, new DateOnly(2008, 5, 2), "70000038", "Pablo Francisco", "M", "Olaya", "Zárate" },
                    { 39, new DateOnly(2008, 10, 18), "70000039", "Milagros Rosario", "F", "Paz", "Quimper" },
                    { 40, new DateOnly(2008, 7, 7), "70000040", "Alejandro Román", "M", "Palacios", "Ugarte" },
                    { 41, new DateOnly(2008, 1, 12), "70000041", "Gisella Ivonne", "F", "Letts", "Osterling" },
                    { 42, new DateOnly(2008, 3, 29), "70000042", "Pedro Abelardo", "M", "Llanos", "Guevara" },
                    { 43, new DateOnly(2008, 12, 9), "70000043", "Tania Libertad", "F", "Casas", "Noriega" },
                    { 44, new DateOnly(2008, 6, 2), "70000044", "Marco Antonio", "M", "Reynoso", "Solis" },
                    { 45, new DateOnly(2008, 8, 21), "70000045", "Elena Sofía", "F", "Arizmendi", "Mendiola" },
                    { 46, new DateOnly(2008, 5, 14), "70000046", "José Carlos", "M", "Lira", "Mariátegui" },
                    { 47, new DateOnly(2008, 9, 2), "70000047", "Rosa Luz", "F", "Alvarado", "Velasco" },
                    { 48, new DateOnly(2008, 7, 10), "70000048", "Emilio Martín", "M", "Westphalen", "Adolfo" },
                    { 49, new DateOnly(2008, 1, 20), "70000049", "Blanca Varela", "F", "Prada", "Gonzáles" },
                    { 50, new DateOnly(2008, 8, 30), "70000050", "Abraham Valdelomar", "M", "Arias", "Pinto" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FullName", "PasswordHash" },
                values: new object[] { "Juan Perez Garcia", "$2a$11$NhepLipSKikTxA2fidUxgusxwg6vMNwna7kiXYSREk.7v3kfG9Z.q" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FullName", "PasswordHash" },
                values: new object[] { "Maria Lopez Torres", "$2a$11$QE.J0.pwT4X6/pbDUSXQ4.I1rXaC3JcmG7L0yxL/Y32k7jXWNl0Du" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "DniMockRecords",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FullName", "PasswordHash" },
                values: new object[] { "Juan Pérez García", "$2a$11$2R8VTm.p9tI7hwVZN3yN6uARRWCq6LKWVhJxvZgzxlSpI2P9uxqZ2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FullName", "PasswordHash" },
                values: new object[] { "María López Torres", "$2a$11$Ewo4REX20txlBaNwoKLslOyUIDIQVi.G/OjeHz.XAM6D/VbdNOsHC" });
        }
    }
}
