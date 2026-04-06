# FAP - Plataforma de Inscripción Digital (Piloto)

## Planning
- [/] Visión general, arquitectura, módulos, modelo de datos, estructura, roadmap, riesgos
- [ ] Revisión y aprobación del plan por el usuario

## Implementación Backend (.NET 8)
- [ ] Crear proyecto Web API con estructura limpia
- [ ] Modelo de datos y DbContext con SQLite
- [ ] Entidades: User, Role, ApplicantRegistration, AuditLog, DniMockRecord
- [ ] DTOs y mapeos
- [ ] Servicios: Auth, Registration, DniMock, Audit, Export, Sync
- [ ] Controladores API
- [ ] Middleware de autenticación local (JWT simple)
- [ ] Datos semilla (usuarios, roles, DNI mock)
- [ ] Validaciones backend

## Implementación Frontend (React + Vite + TS)
- [ ] Crear proyecto Vite con React + TypeScript + TailwindCSS
- [ ] Estructura de carpetas (features, shared, services, hooks)
- [ ] Configuración de rutas con React Router
- [ ] Servicio de autenticación y contexto
- [ ] Pantalla de Login
- [ ] Dashboard (Supervisor)
- [ ] Formulario de registro (React Hook Form + Zod)
- [ ] Consulta mock DNI integrada al formulario
- [ ] Bandeja de registros (listado con filtros)
- [ ] Detalle de registro
- [ ] Edición de registro (Fase 2)
- [ ] Generación de constancia PDF
- [ ] Vista de auditoría (Fase 2)
- [ ] Exportación Excel/CSV (Fase 2)
- [ ] Sincronización simulada UI (Fase 2)

## Documentación
- [ ] README general en /docs
- [ ] Guía de instalación local
- [ ] Arquitectura resumida
- [ ] Modelo de datos documentado
- [ ] Roadmap Fase 1 → Fase 2

## Verificación
- [ ] Checklist de pruebas manuales
- [ ] Verificación de flujo completo en navegador
