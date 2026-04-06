namespace FapPiloto.Api.Entities;

public class DniMockRecord
{
    public int Id { get; set; }
    public string Dni { get; set; } = string.Empty;
    public string FirstNames { get; set; } = string.Empty;
    public string PaternalSurname { get; set; } = string.Empty;
    public string MaternalSurname { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string Gender { get; set; } = string.Empty;
}
