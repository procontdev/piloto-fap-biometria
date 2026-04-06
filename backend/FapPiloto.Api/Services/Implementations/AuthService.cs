using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FapPiloto.Api.Data;
using FapPiloto.Api.DTOs;
using FapPiloto.Api.Security;
using FapPiloto.Api.Services.Interfaces;

namespace FapPiloto.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user == null)
            return null;

        bool passwordValid;
        try
        {
            passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Invalid password hash format for user {Username}", user.Username);
            return null;
        }

        if (!passwordValid)
            return null;

        if (user.Role == null || string.IsNullOrWhiteSpace(user.Role.Name))
        {
            _logger.LogWarning("User {Username} has invalid Role relation. RoleId={RoleId}", user.Username, user.RoleId);
            return null;
        }

        var expiresAt = DateTime.UtcNow.AddHours(8);
        var token = GenerateJwt(user, expiresAt);

        return new LoginResponse(token, user.Username, user.FullName, user.Role.Name, expiresAt);
    }

    private string GenerateJwt(Entities.User user, DateTime expiresAt)
    {
        var jwtConfig = JwtConfigurationResolver.Resolve(_config, _logger);
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfig.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.GivenName, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.Name)
        };

        var token = new JwtSecurityToken(
            issuer: jwtConfig.Issuer,
            audience: jwtConfig.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
