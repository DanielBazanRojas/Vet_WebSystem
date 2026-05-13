# VET PETS DAVID — Reglas del proyecto

## Contexto del sistema
Sistema de gestión veterinaria y estética para mascotas "Vet Pets David".
Monorepo con dos workspaces: `backend/` y `frontend/`.

## Stack tecnológico
- Frontend: React 18 + Vite, React Router v6, Zustand, TanStack Query, React Hook Form + Zod, Tailwind CSS + shadcn/ui, Axios
- Backend: Node.js 20 + Express, pg (cliente PostgreSQL nativo, sin ORM), jsonwebtoken, bcryptjs, Resend (emails)
- Base de datos: PostgreSQL en Supabase (plan gratuito, máx 10 conexiones)
- Despliegue: Backend en Azure App Service, Frontend en Vercel
- Idioma del sistema: español (labels, mensajes de error, respuestas de API)

## Estructura de archivos — backend
backend/src/modules/{modulo}/{modulo}.routes.js
backend/src/modules/{modulo}/{modulo}.controller.js
backend/src/modules/{modulo}/{modulo}.service.js
backend/src/modules/{modulo}/{modulo}.queries.js
backend/src/middlewares/auth.js       (verifyToken)
backend/src/middlewares/rbac.js       (checkPermission)
backend/src/middlewares/audit.js      (registra en audit_logs)
backend/src/config/db.js              (pool pg, export query y getClient)
backend/src/config/supabase.js        (cliente para Storage)

## Estructura de archivos — frontend
frontend/src/modules/{modulo}/{Modulo}Page.jsx
frontend/src/modules/{modulo}/{modulo}.api.js    (llamadas axios)
frontend/src/modules/{modulo}/use{Modulo}.js     (hook con TanStack Query)
frontend/src/store/authStore.js                  (Zustand)
frontend/src/api/client.js                       (instancia axios con interceptores JWT)
frontend/src/components/PrivateRoute.jsx

## Base de datos — convenciones
- PKs: UUID tipo gen_random_uuid()
- Soft-delete: campo deleted_at TIMESTAMPTZ (NULL = activo)
- Todas las queries filtran WHERE deleted_at IS NULL salvo historial
- El backend usa SIEMPRE la service_role key de Supabase (bypasea RLS)
- NUNCA usar la anon key en el backend
- Parámetros siempre posicionales ($1, $2...) para prevenir SQL injection

## Tablas principales por módulo
- Auth:        users, roles, permissions, user_roles, role_permissions, sessions, login_attempts, password_reset_tokens
- Clientes:    clients, pets, species, breeds
- Agenda:      appointments, appointment_types
- Clínico:     consultations, treatments, vaccination_records, vaccination_reminders, lab_results
- Farmacia:    products, product_categories, product_lots, inventory_movements, stock_alerts
- Estética:    grooming_sessions, grooming_session_services, grooming_service_catalog, grooming_service_species
- Facturación: invoices, invoice_items, payments, payment_methods
- Sistema:     audit_logs, media_files, notifications, system_settings

## Reglas de código
- ES Modules (import/export) en todo el proyecto, no CommonJS
- async/await, nunca callbacks ni .then() encadenados
- Manejo de errores con try/catch en todos los controllers
- Los controllers solo manejan HTTP (req/res), la lógica va en services
- Las queries son SQL puro en .queries.js, sin string concatenation — siempre parámetros posicionales
- Respuestas de error siempre con { error: "mensaje en español" }
- Paginación: query params page y limit, default page=1 limit=20
- Fechas: siempre TIMESTAMPTZ en BD, ISO 8601 en API

## Auth — flujo JWT
- Access token: JWT 15min, viaja en Authorization: Bearer header
- Refresh token: 7 días, httpOnly cookie, hash SHA-256 guardado en sessions
- El payload del JWT incluye: { id, email, full_name, user_type, permissions: [{module, action}] }
- verifyToken middleware: verifica JWT y pone req.user
- checkPermission(module, action): verifica req.user.permissions

## Convenciones de respuesta API
GET /recursos        → { data: [...], total, page, limit }
GET /recursos/:id    → { data: {...} }
POST /recursos       → { data: {...} } status 201
PUT /recursos/:id    → { data: {...} }
DELETE /recursos/:id → { message: "Eliminado correctamente" }
Errores              → { error: "mensaje" } con status apropiado

## Lo que NO hacer
- No usar Sequelize, Prisma ni ningún ORM — SQL puro con pg
- No usar localStorage para tokens — access token en memoria (Zustand)
- No hardcodear IDs ni secrets — siempre process.env
- No crear tablas nuevas — el esquema ya está en Supabase
- No modificar el SQL ya ejecutado — solo agregar lógica en el backend

## Base de datos — esquema completo
El archivo `docs/database.sql` contiene el esquema completo de PostgreSQL.
Antes de escribir cualquier query, consultar ese archivo para:
- Nombres exactos de tablas y columnas
- Tipos de datos y constraints (NOT NULL, UNIQUE, etc.)
- ENUMs disponibles y sus valores
- FKs y relaciones entre tablas
- Triggers existentes (NO reimplementar su lógica en el backend)