# API TMS - Presentación de Desarrollo Inicial

> **Branch**: `showcase/early-development-demo`
> **Estado**: Desarrollo Inicial - Prueba de Concepto
> **Última Actualización**: 27/09/2025

## 🚀 Resumen

Esta es una presentación de desarrollo inicial para API de Sistema de Gestión de Transporte (TMS) multiusuario creada con NestJS, incluye Control de Acceso Basado en Roles (RBAC) y un sistema de autenticación híbrido.

## 📋 Características actuales

### ✅ Implementado
- **Arquitectura multiusuario** con aislamiento de datos
- **Sistema RBAC (Control de acceso basado en roles)**
- **Autenticación híbrida** (Auth0 + JWT personalizado)
- **Base de datos PostgreSQL** con Prisma ORM
- **Estructura de API RESTful**
- **Gestión de usuarios/perfiles/roles**

### 🔄 En progreso
- Módulos principales del TMS (Pedidos, Envíos, Seguimiento)
- Sistema avanzado de permisos
- Integración frontend

## 🏗️ Arquitectura
┌─────────────────┐ ┌──────────────────┐ ┌──────────────┐
│     Auth0 (IDP) │─│   NestJS API     │─│ PostgreSQL   │
│                 │ │ - Multi-tenant   │ │ - Prisma     │
│        Identity │ │ - RBAC           │ │ - Neon       │
└─────────────────┘ └──────────────────┘ └──────────────┘

## 🚀 Inicio rápido

### Requisitos previos
- Node.js 18+
- Base de datos PostgreSQL
- Cuenta Auth0

### Instalación

# Configurar el entorno
cp .env.example .env
# Editar .env con las credenciales de la base de datos

# Generar el cliente Prisma
npx prisma generate

# Subir el esquema de la base de datos
npx prisma db push

# Semillar los datos iniciales
npx prisma db seed

# Iniciar el servidor de desarrollo
npm run start:dev

**API Endpoints**
Autenticacion
POST /auth/test-login - Endpoint de prueba

POST /auth/login - Auth0  (produccion)

GET /auth/profile - Get perfil de usuario