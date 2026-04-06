# FAP — Plataforma de Inscripción Digital (Piloto Institucional)

## 1. Visión General

Plataforma local de inscripción y preinscripción militar para jóvenes de 17 años, orientada a **digitalizar el proceso de registro** que actualmente se realiza en papel. El piloto corre 100% offline en una laptop, sin dependencias cloud, y debe servir de base real del producto (no demo descartable).

**Objetivos:**
- Registro digital con validaciones y trazabilidad
- Consulta mock por DNI (desacoplada para futura integración con RENIEC)
- Dashboard operativo para supervisores
- Generación de constancia PDF
- Auditoría y simulación de sincronización con sistema institucional (SICERM)
- Base extensible para Fase 2 sin reescrituras

---

## 2. Arquitectura Técnica

```
┌─────────────────────────────────┐
│         NAVEGADOR (SPA)         │
│  React + Vite + TS + Tailwind   │
│  React Router / Hook Form / Zod │
│         Puerto :5173            │
└──────────┬──────────────────────┘
           │ HTTP/REST (JSON)
           │ Authorization: Bearer JWT
┌──────────▼──────────────────────┐
│        .NET 8 Web API           │
│  Controllers → Services → EF    │
│  DTOs / Validators / Middleware  │
│         Puerto :5062            │
└──────────┬──────────────────────┘
           │ EF Core
┌──────────▼──────────────────────┐
│     SQLite (fap_piloto.db)      │
│  Archivo local, sin servidor    │
└─────────────────────────────────┘
```

**Principios:**
- Separación estricta frontend/backend
- Servicios desacoplados (inyección de dependencias)
- DTOs para todas las fronteras API
- Consulta DNI detrás de interfaz `IDniLookupService` (mock hoy, RENIEC mañana)
- Sincronización SICERM detrás de interfaz `ISyncService` (simulada)
- JWT simple (sin OAuth) para autenticación local
- CORS configurado solo para `localhost:5173`

---

## 3. Módulos

| # | Módulo | Fase | Roles |
|---|--------|------|-------|
| 1 | Autenticación local (JWT) | 1 | Todos |
| 2 | Registro de jóvenes | 1 | Operador |
| 3 | Consulta mock DNI | 1 | Operador |
| 4 | Validaciones (front+back) | 1 | — |
| 5 | Bandeja de registros | 1 | Operador, Supervisor |
| 6 | Detalle de registro | 1 | Operador, Supervisor |
| 7 | Constancia PDF | 1 | Operador |
| 8 | Dashboard básico | 1 | Supervisor |
| 9 | Edición de registros | 2 | Operador |
| 10 | Auditoría básica | 2 | Supervisor |
| 11 | Sincronización simulada | 2 | Supervisor |
| 12 | Exportación Excel/CSV | 2 | Supervisor |

---

## 4. Modelo de Datos

### 4.1 `Role`
| Campo | Tipo | Notas |
|-------|------|-------|
| Id | int (PK) | |
| Name | string | "Operador" \| "Supervisor" |
| Description | string? | |

### 4.2 `User`
| Campo | Tipo | Notas |
|-------|------|-------|
| Id | int (PK) | |
| Username | string (unique) | |
| PasswordHash | string | BCrypt |
| FullName | string | |
| RoleId | int (FK → Role) | |
| IsActive | bool | |
| CreatedAt | DateTime | UTC |

### 4.3 `ApplicantRegistration`
| Campo | Tipo | Notas |
|-------|------|-------|
| Id | int (PK) | |
| Dni | string(8) (unique) | Validación 8 dígitos |
| FirstNames | string | |
| PaternalSurname | string | |
| MaternalSurname | string | |
| BirthDate | DateOnly | Validación edad ~17 |
| Gender | string | "M" \| "F" |
| Phone | string? | |
| Email | string? | |
| Address | string | |
| Department | string | |
| Province | string | |
| District | string | |
| EducationLevel | string | |
| MilitaryServiceInterest | bool | |
| Observations | string? | |
| RegistrationStatus | string | "Borrador" \| "Completado" \| "Anulado" |
| SyncStatus | string | "Pendiente" \| "Sincronizado" \| "Observado" \| "Error" |
| CreatedAt | DateTime | UTC |
| UpdatedAt | DateTime? | |
| CreatedBy | int (FK → User) | |
| UpdatedBy | int? (FK → User) | |

### 4.4 `AuditLog`
| Campo | Tipo | Notas |
|-------|------|-------|
| Id | int (PK) | |
| EntityName | string | Tabla afectada |
| EntityId | int | PK del registro |
| Action | string | "Create" \| "Update" \| "Delete" \| "StatusChange" |
| Changes | string? | JSON diff (Fase 2) |
| UserId | int (FK → User) | |
| Timestamp | DateTime | UTC |
| IpAddress | string? | |

### 4.5 `DniMockRecord`
| Campo | Tipo | Notas |
|-------|------|-------|
| Id | int (PK) | |
| Dni | string(8) (unique) | |
| FirstNames | string | |
| PaternalSurname | string | |
| MaternalSurname | string | |
| BirthDate | DateOnly | |
| Gender | string | |

---

## 5. Estructura de Carpetas

```
e:\DESARROLLO\FAP\Piloto\web\
├── backend\
│   └── FapPiloto.Api\
│       ├── Controllers\          # Controladores API
│       ├── Data\                 # DbContext, Migrations
│       ├── DTOs\                 # Request/Response DTOs
│       ├── Entities\             # Modelos de dominio
│       ├── Middleware\           # Auth middleware, error handling
│       ├── Services\             # Lógica de negocio
│       │   ├── Interfaces\       # Contratos de servicio
│       │   └── Implementations\  # Implementaciones
│       ├── Validators\           # FluentValidation (si aplica)
│       ├── Seed\                 # Datos semilla
│       ├── Program.cs
│       ├── appsettings.json
│       └── FapPiloto.Api.csproj
├── frontend\
│   ├── public\
│   ├── src\
│   │   ├── api\                  # Cliente HTTP, interceptors
│   │   ├── components\           # Componentes compartidos (UI)
│   │   │   ├── ui\               # Botones, inputs, modals, tables
│   │   │   └── layout\           # Sidebar, header, main layout
│   │   ├── features\             # Módulos por dominio
│   │   │   ├── auth\
│   │   │   ├── registration\
│   │   │   ├── dashboard\
│   │   │   ├── audit\
│   │   │   └── sync\
│   │   ├── hooks\                # Custom hooks compartidos
│   │   ├── lib\                  # Utilidades, helpers
│   │   ├── schemas\              # Esquemas Zod
│   │   ├── types\                # Tipos TypeScript
│   │   ├── routes\               # Configuración React Router
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css             # Tailwind base
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
└── docs\
    ├── README.md
    ├── INSTALL.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    └── ROADMAP.md
```

---

## 6. Roadmap

### Fase 1 — MVP Funcional
| Entregable | Detalle |
|------------|---------|
| Auth | Login local con JWT, dos roles seed |
| Registro | Formulario completo con validaciones front+back |
| DNI Mock | Autocompletado de datos desde tabla mock |
| Bandeja | Listado paginado con filtros básicos |
| Detalle | Vista de solo lectura del registro |
| Constancia PDF | Generación y descarga desde detalle |
| Dashboard | Contadores y métricas básicas |
| Seed Data | Usuarios, roles, registros DNI mock |

### Fase 2 — Ampliación Operativa
| Entregable | Detalle |
|------------|---------|
| Edición | Modificación de registros existentes |
| Auditoría | Tabla de logs con filtros |
| Sincronización | Estados SICERM simulados + cambio manual |
| Exportación | Excel y CSV desde bandeja |
| Roles mejorados | Guards más finos en front y back |
| UX | Mejoras visuales, feedback, animaciones |

> [!IMPORTANT]
> La Fase 2 se construye sobre los servicios e interfaces de la Fase 1. No hay reescritura.

---

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| SQLite no soporta concurrencia pesada | Bajo (piloto mono-usuario) | Suficiente para piloto; migrar a PostgreSQL si escala |
| JWT sin refresh token | Medio | Token de 8h para uso en jornada; agregar refresh en Fase 2 si hace falta |
| Sin HTTPS en local | Bajo | Aceptable para piloto local; documentar para producción |
| Tailwind requiere build | Bajo | Vite lo resuelve; no hay dependencia runtime |
| Mock DNI no valida contra RENIEC real | Esperado | Interfaz `IDniLookupService` permite swap sin tocar lógica |
| Sin backup automático | Medio | SQLite es un archivo; documentar copia manual; agregar script en Fase 2 |

---

## 8. Propuesta de Implementación

### Backend — Orden de implementación
1. Crear solución .NET 8 Web API con SQLite y EF Core
2. Entidades y DbContext
3. Migration inicial + seed data (2 usuarios, 2 roles, 10 DNI mock)
4. DTOs (request/response para cada entidad)
5. Servicios: `AuthService`, `RegistrationService`, `DniLookupService`, `DashboardService`
6. Controladores: `AuthController`, `RegistrationsController`, `DniController`, `DashboardController`
7. Middleware JWT y manejo global de errores
8. **Fase 2**: `AuditService`, `SyncService`, `ExportService` + controladores

### Frontend — Orden de implementación
1. Scaffold Vite + React + TS + Tailwind + React Router
2. Sistema de diseño base (colores institucionales, componentes UI)
3. Cliente HTTP con interceptor JWT
4. Auth context + ruta protegida
5. Login page
6. Layout principal (sidebar + header)
7. Formulario de registro con consulta DNI + validaciones Zod
8. Bandeja de registros
9. Detalle de registro
10. Generación PDF (usando `@react-pdf/renderer` o `jspdf`)
11. Dashboard con métricas
12. **Fase 2**: Edición, auditoría, export, sync UI

---

## 9. Verificación

### 9.1 Verificación automatizada
- **Backend**: ejecutar `dotnet build` para compilación sin errores
- **Frontend**: ejecutar `npm run build` para verificar que TypeScript y Vite compilen sin errores

### 9.2 Verificación manual (flujo completo)
1. **Iniciar backend**: `cd backend/FapPiloto.Api && dotnet run` — verificar que arranca en `http://localhost:5062`
2. **Iniciar frontend**: `cd frontend && npm run dev` — verificar que arranca en `http://localhost:5173`
3. **Login**: acceder a `http://localhost:5173`, ingresar con usuario operador seed → debe redirigir a la bandeja
4. **Consulta DNI**: en formulario de registro, ingresar un DNI mock → debe autocompletar datos
5. **Registro**: completar formulario y guardar → debe aparecer en la bandeja
6. **Detalle**: hacer clic en un registro → debe mostrar información completa
7. **Constancia PDF**: desde el detalle, generar constancia → debe descargar PDF
8. **Dashboard**: cerrar sesión, ingresar como supervisor → debe ver métricas
9. **Validaciones**: intentar registrar con DNI duplicado, campos vacíos, edad incorrecta → deben mostrar errores

> [!NOTE]
> Se recomienda que el usuario valide manualmente el flujo completo ya que no hay tests unitarios automatizados en esta fase piloto. Se pueden agregar tests con xUnit (backend) y Vitest (frontend) en iteraciones posteriores.

---

## Datos Semilla

**Roles:**
- `Operador` — Registro y consulta
- `Supervisor` — Dashboard y administración

**Usuarios:**
| Username | Password | Rol |
|----------|----------|-----|
| operador1 | Oper@dor1 | Operador |
| supervisor1 | Super@visor1 | Supervisor |

**DNI Mock (10 registros):**
DNIs ficticios (70000001–70000010) con datos peruanos realistas para demo.
