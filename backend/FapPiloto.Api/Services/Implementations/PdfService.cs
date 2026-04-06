using System.IO;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using FapPiloto.Api.Data;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class PdfService : IPdfService
{
    private readonly AppDbContext _db;
    private readonly string _webRootPath;

    public PdfService(AppDbContext db)
    {
        _db = db;
        _webRootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"));
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GenerateConstanciaAsync(int registrationId)
    {
        var reg = await _db.Registrations
            .Include(r => r.CreatedByUser)
            .FirstOrDefaultAsync(r => r.Id == registrationId);

        if (reg == null)
            throw new KeyNotFoundException($"Registro #{registrationId} no encontrado");

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                // Tamaño Media Página A4 (A5 Horizontal aprox) - 595 x 421
                page.Size(595, 421);
                page.Margin(20);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Arial));

                // MARCA DE AGUA (Logotipo muy suave y centrado)
                page.Background().AlignMiddle().AlignCenter().Width(230).Image(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "logo_fap_watermark.png"));

                page.Content().Border(1.5f).BorderColor(Colors.Black).Background(Colors.Transparent).Padding(15).Column(col =>
                {
                    // HEADER (Escudo - Título - Logo FAP)
                    col.Item().Row(row =>
                    {
                        var assetsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets");
                        row.ConstantItem(50).Image(Path.Combine(assetsPath, "escudo_peru.png"));
                        row.RelativeItem().PaddingTop(2).Column(headerCol =>
                        {
                            headerCol.Item().AlignCenter().Text("REPÚBLICA DEL PERÚ").Bold().FontSize(12).FontColor(Colors.Black);
                            headerCol.Item().AlignCenter().Text("MINISTERIO DE DEFENSA").Bold().FontSize(11).FontColor(Colors.Black);
                            headerCol.Item().AlignCenter().Text("CONSTANCIA DE INSCRIPCIÓN MILITAR").Bold().FontSize(12).FontColor(Colors.Black);
                        });
                        row.ConstantItem(50).Image(Path.Combine(assetsPath, "logo_fap.png"));
                    });

                    col.Item().PaddingVertical(4).LineHorizontal(0.5f).LineColor(Colors.Black);

                    // IDENTIFICADORES (CIM, Libro, Folio)
                    col.Item().PaddingBottom(8).Row(row =>
                    {
                        row.RelativeItem().Text(text => { text.Span("CIM: ").Bold(); text.Span($"{reg.Dni}F").Bold().FontSize(12); });
                        row.RelativeItem().AlignCenter().Text(text => { text.Span("Libro: ").Bold(); text.Span("026").FontSize(11); });
                        row.RelativeItem().AlignRight().Text(text => { text.Span("Folio: ").Bold(); text.Span((110 + reg.Id).ToString()).FontSize(11); });
                    });

                    // CUERPO (FOTO + DATOS)
                    col.Item().Row(row =>
                    {
                        // FOTO (Dimensiones estables)
                        row.ConstantItem(120).Border(1).BorderColor(Colors.Black).Padding(1).Column(imgCol =>
                        {
                            if (!string.IsNullOrEmpty(reg.PhotoPath))
                            {
                                if (TryResolveLocalMediaPath(reg.PhotoPath, out var absolutePath) && File.Exists(absolutePath))
                                {
                                    imgCol.Item().Width(115).Height(145).Image(absolutePath);
                                }
                                else
                                {
                                    DrawEmptyPhoto(imgCol);
                                }
                            }
                            else
                            {
                                DrawEmptyPhoto(imgCol);
                            }
                        });

                        // DATOS
                        row.RelativeItem().PaddingLeft(20).Column(dataCol =>
                        {
                            dataCol.Spacing(2);
                            AddCimField(dataCol, "Ap. Paterno", reg.PaternalSurname.ToUpper());
                            AddCimField(dataCol, "Ap. Materno", reg.MaternalSurname.ToUpper());
                            AddCimField(dataCol, "Nombres", reg.FirstNames.ToUpper());

                            dataCol.Item().PaddingTop(8).Row(r =>
                            {
                                r.RelativeItem().Text(t => { t.Span("Clase: ").Bold(); t.Span(reg.BirthDate.Year.ToString()); });
                                r.RelativeItem().Text(t => { t.Span(" Calificación: ").Bold(); t.Span("SELECCIONADO"); });
                            });

                            dataCol.Item().Row(r =>
                            {
                                r.RelativeItem().Text(t => { t.Span("Fecha de Nacimiento: ").Bold(); t.Span(reg.BirthDate.ToString("dd/MM/yyyy")); });
                            });

                            dataCol.Item().Row(r =>
                            {
                                var sexoLabel = reg.Gender == "F" ? "FEMENINO" : "MASCULINO";
                                r.RelativeItem().Text(t => { t.Span("Sexo: ").Bold(); t.Span(sexoLabel); });
                                r.RelativeItem().Text(t => { t.Span("Talla: ").Bold(); t.Span($"{reg.Height?.ToString("0.00") ?? "—"} (m.)"); });
                            });
                            
                            if (reg.Weight.HasValue)
                            {
                                dataCol.Item().Text(t => { t.Span("Peso: ").Bold(); t.Span($"{reg.Weight:0.0} kg."); });
                            }
                        });
                    });

                    // FOOTER (FIRMA HORIZONTAL COMPACTA)
                    col.Item().AlignRight().PaddingRight(20).PaddingTop(5).Column(footerCol =>
                    {
                        var assetsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets");
                        
                        // Uso de FitArea para que la imagen se adapte al espacio sin desbordar por AspectRatio
                        footerCol.Item().Width(150).Height(50).AlignCenter().Image(Path.Combine(assetsPath, "firma_jose_effio_horizontal.png")).FitArea();
                        
                        footerCol.Item().AlignCenter().Text("JOSE ANTONIO EFFIO PALMA").Bold().FontSize(8);
                        footerCol.Item().AlignCenter().Text("COR. FAP DIRECTOR DE LA DIREM").FontSize(7);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    private static void DrawEmptyPhoto(ColumnDescriptor col)
    {
        col.Item().Width(115).Height(145)
            .Background(Colors.Grey.Lighten3)
            .Border(0.5f).BorderColor(Colors.Grey.Lighten1)
            .AlignCenter()
            .AlignMiddle()
            .Text("SIN FOTO")
            .FontSize(8)
            .FontColor(Colors.Grey.Medium);
    }

    private static void AddCimField(ColumnDescriptor col, string label, string value)
    {
        col.Item().PaddingBottom(1).Text(text =>
        {
            text.Span($"{label}: ").Bold();
            text.Span(value);
        });
    }

    private bool TryResolveLocalMediaPath(string? photoPath, out string localPath)
    {
        localPath = string.Empty;
        if (string.IsNullOrWhiteSpace(photoPath))
            return false;

        var candidate = photoPath.Trim();

        if (Uri.TryCreate(candidate, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
        {
            candidate = uri.AbsolutePath;
        }

        candidate = candidate.Replace('\\', '/').TrimStart('/');
        if (string.IsNullOrWhiteSpace(candidate))
            return false;

        var resolved = Path.GetFullPath(Path.Combine(_webRootPath, candidate));

        if (!resolved.StartsWith(_webRootPath, StringComparison.OrdinalIgnoreCase))
            return false;

        localPath = resolved;
        return true;
    }
}
