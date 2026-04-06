# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos .csproj y restaurar dependencias
COPY ["FapPiloto.Api.csproj", "./"]
RUN dotnet restore "FapPiloto.Api.csproj"

# Copiar el resto del código y compilar
COPY . .
RUN dotnet publish "FapPiloto.Api.csproj" -c Release -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Crear carpeta para la base de datos SQLite (Persistente)
RUN mkdir -p /app/data
ENV ConnectionStrings__Default="Data Source=/app/data/fap_piloto_v2.db"

COPY --from=build /app/publish .

# Exponer el puerto
EXPOSE 80
ENTRYPOINT ["dotnet", "FapPiloto.Api.dll"]
