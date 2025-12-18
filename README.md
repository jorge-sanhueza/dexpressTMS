# TMS - Presentación de Desarrollo Inicial

> **Estado**: Desarrollo Inicial - Prueba de Concepto
> **Última Actualización**: 07/12/2025

## Resumen

Esta es la presentación de desarrollo inicial para un de Sistema de Gestión de Transporte (TMS) multiusuario creada con NestJS, incluye Control de Acceso Basado en Roles (RBAC) y un sistema de autenticación híbrido.

## Características

- **Arquitectura multiusuario** con aislamiento de datos
- **Sistema RBAC (Control de acceso basado en roles)**
- **Autenticación híbrida** (Auth0 + JWT personalizado)
- **Base de datos PostgreSQL** con Prisma ORM
- **Estructura de API RESTful**
- **Gestión de usuarios/perfiles/roles**
- **Creación de entidades básicas**
- **Creación de ordenes y pedidos**

### En progreso
- Módulos de Envíos & Seguimiento de ordenes

## Arquitectura
Auth0 (IDP)   - NestJS API    - PostgreSQL
              - Multi-tenant  - Prisma
              - RBAC          - Neon

## Inicio rápido

### Requisitos
- Node.js 18+
- Base de datos PostgreSQL
- Cuenta Auth0

## Instalación

### Configuración de entorno
Editar .env con las credenciales de la base de datos

### Generar el cliente Prisma
npx prisma generate

### Subir el esquema de la base de datos
npx prisma db push

### Semillar los datos iniciales
npx prisma db seed

### API Endpoints
Autenticacion
POST /auth/test-login - Endpoint de prueba

POST /auth/login - Auth0  (produccion)

GET /auth/profile - Get perfil de usuario
