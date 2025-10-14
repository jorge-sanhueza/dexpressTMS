# Copilot Instructions for dexpressTMS

## Project Overview
- **Monorepo** with API (`apps/api`), Web frontend (`apps/web`), and shared types/utilities (`packages/shared`).
- **API**: NestJS, Prisma ORM, PostgreSQL, multi-tenant RBAC, hybrid Auth (Auth0 + JWT).
- **Web**: React + TypeScript + Vite, modular hooks/services, React Query for data.

## Key Architectural Patterns
- **Multi-tenancy**: Data isolation per tenant; see `tenants/` modules and Prisma schema.
- **RBAC**: Roles and permissions managed in `roles/`, `users/`, and `auth/` modules.
- **Hybrid Auth**: Auth0 integration (production) and custom JWT (dev/testing); endpoints in `auth.controller.ts`.
- **Prisma**: All DB access via Prisma Service (`prisma.service.ts`). Migrations in `prisma/migrations/`.
- **Frontend-Backend Integration**: API endpoints consumed via hooks/services in `apps/web/src/services/` and `apps/web/src/hooks/`.

## Developer Workflows
- **Setup**: Copy `.env.example` to `.env` and configure DB/Auth0 credentials.
- **Prisma**: Run `npx prisma generate`, `npx prisma db push`, and `npx prisma db seed` for DB setup.
- **API**: Start with `npm run start:dev` in `apps/api`.
- **Web**: Start with `npm run dev` in `apps/web`.
- **Testing**: API tests in `apps/api/test/` (Jest). E2E config in `jest-e2e.json`.

## Project-Specific Conventions
- **Modules**: Feature modules (e.g., `users`, `orders`, `profiles`) follow NestJS structure: `controllers/`, `services/`, `dto/`, `interfaces/`.
- **Frontend Services**: API calls abstracted in `services/` and consumed via custom hooks in `hooks/`.
- **Shared Types**: Use `packages/shared/src/types/` for cross-app type safety.
- **Environment Config**: Sensitive config in `.env`, loaded via NestJS ConfigModule and Vite.

## Integration Points & External Dependencies
- **Auth0**: Used for production authentication; see `auth/` modules and `.env` config.
- **Prisma/Neon**: DB migrations and access; see `prisma/` folder.
- **React Query**: Data fetching/caching in frontend; see `ReactQueryProvider.tsx`.

## Examples
- **API Endpoint**: `POST /auth/login` (Auth0), `POST /auth/test-login` (dev JWT)
- **Frontend Service**: `apps/web/src/services/usersService.ts` for user API calls
- **Shared Type**: `packages/shared/src/types/`

## References
- See `README.md` in root and `apps/api/` for setup and architecture details.
- Prisma schema and migrations: `apps/api/prisma/`
- Main entrypoints: `apps/api/src/main.ts`, `apps/web/src/main.tsx`

---
_If any section is unclear or missing, please provide feedback for improvement._
