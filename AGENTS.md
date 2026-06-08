# AGENTS.md — Studio Medico

## Project Summary

**Studio Medico** is an Italian medical practice management system for nutritional planning with AI assistance.
It is a full-stack web application in active development, currently in MVP phase with significant incomplete areas.

## Repository Layout

```
studio_medico/
├── backend_express/        # Node.js + Express 5 REST API
│   ├── server.js           # entry point
│   └── src/
│       ├── app.js          # Express app setup, route mounting, middleware
│       ├── config/
│       │   └── database.js # MySQL2 connection pool
│       ├── controllers/    # HTTP request handlers
│       ├── middleware/     # auth + error middleware (currently empty stubs)
│       ├── models/         # database access functions
│       ├── routes/         # Express router definitions
│       └── services/
│           └── ai.service.js  # stub for AI nutritional plan generation
├── frontend/               # Angular 22 standalone SPA
│   └── src/app/
│       ├── core/auth/      # JWT interceptor, auth guard, role guard, auth service
│       ├── features/
│       │   ├── auth/       # login (placeholder)
│       │   ├── medico/     # doctor views (dashboard implemented, rest placeholder)
│       │   └── paziente/   # patient views (all placeholder)
│       └── app.routes.ts   # lazy-loaded route config
└── postman/                # API collection for manual testing
```

## Domain Model

- **utenti** — system users, role: `medico` or `paziente`
- **pazienti** — patient profiles linked to a utente
- **visite** — visit records (weight, BMI, body fat percentage, date)
- **piani_alimentari** — nutritional plans assigned to patients
- **giorni_piano** — daily meal plan entries within a plan
- **pasti** — individual meals within a day
- **voci_pasto** — food items within a meal

## API Endpoints

All routes are prefixed under the Express app. No authentication middleware is active yet.

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| POST | `/auth/register` | auth.controller | Creates utente with hashed password |
| POST | `/auth/login` | auth.controller | Returns JWT; role in payload |
| GET | `/auth/users` | auth.controller | Returns all users (unprotected) |
| GET | `/pazienti` | pazienti.controller | List all patients |
| GET | `/pazienti/:id` | pazienti.controller | Get single patient |
| POST | `/pazienti` | pazienti.controller | Create patient |
| PUT | `/pazienti/:id` | pazienti.controller | Update patient |
| DELETE | `/pazienti/:id` | pazienti.controller | Delete patient |
| GET | `/visite` | visite.controller | **BROKEN** — casing bug crashes all handlers |
| GET | `/visite/:id` | visite.controller | **BROKEN** |
| POST | `/visite` | visite.controller | **BROKEN** |
| PUT | `/visite/:id` | visite.controller | **BROKEN** |
| DELETE | `/visite/:id` | visite.controller | **BROKEN** |
| GET | `/piani` | piani.controller | List all nutritional plans |
| GET | `/piani/:id` | piani.controller | Get plan with days, meals, food items |
| POST | `/piani` | piani.controller | Create plan |
| PUT | `/piani/:id` | piani.controller | Update plan |
| DELETE | `/piani/:id` | piani.controller | Delete plan |
| GET | `/utenti` | utenti.controller | List all utenti |

## Active Bugs

### Bug 1 — visite.controller.js variable name mismatch
- **File**: `backend_express/src/controllers/visite.controller.js`
- **Problem**: `const VisitaModel = require('../models/visita.model')` imported as PascalCase, then called as `visitaModel.*` (camelCase) on every handler
- **Effect**: `ReferenceError: visitaModel is not defined` on all `/visite` routes
- **Fix**: Rename the import constant from `VisitaModel` to `visitaModel`

### Bug 2 — auth.middleware.js is empty
- **File**: `backend_express/src/middleware/auth.middleware.js`
- **Problem**: File contains only a blank line; no JWT verification implemented
- **Effect**: Every backend route is completely unauthenticated
- **Fix**: Implement `verifyToken` middleware that reads `Authorization: Bearer <token>`, verifies it with `jsonwebtoken.verify(token, process.env.JWT_SECRET)`, and attaches decoded payload to `req.user`

### Bug 3 — role.guard.ts is empty
- **File**: `frontend/src/app/core/auth/role.guard.ts`
- **Problem**: File contains only a blank line; no guard logic
- **Effect**: Role-based route separation on frontend is non-functional
- **Fix**: Implement `CanActivateFn` that reads `authService.userRole()` signal and redirects unauthorized roles

## Security Posture

This application has **not** passed a security review and is **not production-ready**.

### Failing OWASP checks (critical)
- A01: No backend access control — all endpoints are public
- A02: JWT stored in localStorage (XSS-readable); no HTTPS; no token revocation
- A04: `ruolo` accepted from registration request body — privilege escalation possible
- A05: `app.use(cors())` with no origin restriction; no `helmet`; no rate limiting
- A07: Backend never validates JWT; no password policy; no account lockout

### Passing OWASP checks
- A03: Parameterized SQL queries throughout — no injection risk
- A06: All dependencies are current versions
- A10: No user-controlled outbound URLs

## Environment Variables

```
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=studio_medico
JWT_SECRET=          # must be set; use minimum 32 random characters
PORT=3000
```

No `.env.example` exists yet. No DB schema SQL file exists in the repo.

## What Is Implemented vs. Placeholder

### Implemented (works with caveats)
- Express server, route wiring, CORS, JSON body parsing
- MySQL connection pool
- `auth.controller.js` — register + login with bcrypt + JWT generation
- `pazienti.controller.js` — full CRUD
- `piani.controller.js` — full CRUD with nested day/meal/food queries
- `utenti.controller.js` — list users
- Angular app shell, routing, lazy loading
- JWT interceptor (adds Bearer token to requests)
- Auth guard (checks signal, but backend doesn't enforce)
- Doctor dashboard UI with hardcoded patient data

### Stub / Placeholder (not functional)
- `auth.middleware.js` — empty
- `error.middleware.js` — empty
- `ai.service.js` — empty
- `env.js` — empty
- Angular login component
- Angular patient detail (scheda-paziente)
- Angular plan editor (piano-alimentare)
- Angular patient dashboard (dashboard-paziente)
- Angular plan viewer (visualizza-piano)
- `role.guard.ts`

## Coding Conventions

- Backend uses CommonJS (`require`/`module.exports`), not ESM
- Controllers follow pattern: `async (req, res) => { try { ... } catch (error) { res.status(500).json({ error: error.message }) } }`
- Models return raw query results from `pool.query()`; controllers destructure as `const [rows] = await Model.method()`
- Frontend uses Angular signals (`signal()`, `computed()`) — not RxJS Subjects for local state
- Angular components are standalone; no NgModules
- Route guards use `inject()` inside `CanActivateFn`

## Testing

- Vitest configured in frontend (`vitest.config.ts`) but no test files are written
- Postman collection present in `/postman` for manual API testing
- No backend test framework configured

## Out of Scope / Future Work

- AI nutritional plan generation (`ai.service.js`)
- Docker / containerization
- CI/CD pipeline
- Database migrations
- Multi-factor authentication
- Audit logging / HIPAA-style compliance
- Patient-to-doctor assignment model
