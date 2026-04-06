namespace FapPiloto.Api.Security;

public sealed record JwtConfiguration(string Key, string Issuer, string Audience);

public static class JwtConfigurationResolver
{
    private const int MinJwtKeyLength = 32;
    private const string DefaultJwtKey = "FapPilotoSecretKey2025!@#$%^&*()_+";
    private const string DefaultIssuer = "FapPiloto";
    private const string DefaultAudience = "FapPilotoApp";

    public static JwtConfiguration Resolve(IConfiguration configuration, ILogger? logger = null)
    {
        var key = (configuration["Jwt:Key"] ?? string.Empty).Trim();
        if (key.Length < MinJwtKeyLength)
        {
            logger?.LogWarning(
                "JWT signing key missing or too short ({Length}). Falling back to secure default key.",
                key.Length);
            key = DefaultJwtKey;
        }

        var issuer = (configuration["Jwt:Issuer"] ?? DefaultIssuer).Trim();
        var audience = (configuration["Jwt:Audience"] ?? DefaultAudience).Trim();

        if (string.IsNullOrWhiteSpace(issuer))
            issuer = DefaultIssuer;

        if (string.IsNullOrWhiteSpace(audience))
            audience = DefaultAudience;

        return new JwtConfiguration(key, issuer, audience);
    }
}
