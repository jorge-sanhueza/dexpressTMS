import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // estado_registro
  const estadoActivo = await prisma.estadoRegistro.upsert({
    where: { estado: 'activo' },
    update: {},
    create: { estado: 'activo', tenantId: null },
  });

  const estadoInactivo = await prisma.estadoRegistro.upsert({
    where: { estado: 'inactivo' },
    update: {},
    create: { estado: 'inactivo', tenantId: null },
  });

  // tipo_tenant
  const tipoTenantAdmin = await prisma.tipoTenant.upsert({
    where: { tipoTenant: 'admin' },
    update: {},
    create: { tipoTenant: 'admin', tenantId: null },
  });

  // tipo_usuario
  const tipoUsuarioStandard = await prisma.tipoUsuario.upsert({
    where: { tipoUsuario: 'standard' },
    update: {},
    create: { tipoUsuario: 'standard', tenantId: null },
  });

  // tipo_perfil
  const tipoPerfilAdministrativo = await prisma.tipoPerfil.upsert({
    where: { tipoPerfil: 'administrativo' },
    update: {},
    create: { tipoPerfil: 'administrativo', tenantId: null },
  });

  // tipo_accion
  const tipoAccionVer = await prisma.tipoAccion.upsert({
    where: { tipoAccion: 'ver' },
    update: {},
    create: { tipoAccion: 'ver', tenantId: null },
  });

  const tipoAccionCrear = await prisma.tipoAccion.upsert({
    where: { tipoAccion: 'crear' },
    update: {},
    create: { tipoAccion: 'crear', tenantId: null },
  });

  const tipoAccionEditar = await prisma.tipoAccion.upsert({
    where: { tipoAccion: 'editar' },
    update: {},
    create: { tipoAccion: 'editar', tenantId: null },
  });

  const tipoAccionEliminar = await prisma.tipoAccion.upsert({
    where: { tipoAccion: 'eliminar' },
    update: {},
    create: { tipoAccion: 'eliminar', tenantId: null },
  });

  const tipoAccionAdministrar = await prisma.tipoAccion.upsert({
    where: { tipoAccion: 'activar' },
    update: {},
    create: { tipoAccion: 'activar', tenantId: null },
  });

  // admin tenant
  const adminTenant = await prisma.tenant.upsert({
    where: { nombre: 'Tenant Administrativo' },
    update: {},
    create: {
      nombre: 'Tenant Administrativo',
      contacto: 'admin@demo.cl',
      rut: '12345678-9',
      activo: true,
      estadoId: estadoActivo.id,
      tipoTenantId: tipoTenantAdmin.id,
    },
  });

  const adminRoles = [
    {
      codigo: 'admin_access',
      nombre: 'Acceso Administrativo',
      modulo: 'sistema',
      tipo_accion: 'administrar',
      tipoAccionId: tipoAccionAdministrar.id,
    },
    {
      codigo: 'ver_usuarios',
      nombre: 'Ver Usuarios',
      modulo: 'usuarios',
      tipo_accion: 'ver',
      tipoAccionId: tipoAccionVer.id,
    },
    {
      codigo: 'crear_usuarios',
      nombre: 'Crear Usuarios',
      modulo: 'usuarios',
      tipo_accion: 'crear',
      tipoAccionId: tipoAccionCrear.id,
    },
    {
      codigo: 'editar_usuarios',
      nombre: 'Editar Usuarios',
      modulo: 'usuarios',
      tipo_accion: 'editar',
      tipoAccionId: tipoAccionEditar.id,
    },
    {
      codigo: 'eliminar_usuarios',
      nombre: 'Eliminar Usuarios',
      modulo: 'usuarios',
      tipo_accion: 'eliminar',
      tipoAccionId: tipoAccionEliminar.id,
    },
    {
      codigo: 'ver_perfiles',
      nombre: 'Ver Perfiles',
      modulo: 'perfiles',
      tipo_accion: 'ver',
      tipoAccionId: tipoAccionVer.id,
    },
    {
      codigo: 'crear_perfiles',
      nombre: 'Crear Perfiles',
      modulo: 'perfiles',
      tipo_accion: 'crear',
      tipoAccionId: tipoAccionCrear.id,
    },
    {
      codigo: 'editar_perfiles',
      nombre: 'Editar Perfiles',
      modulo: 'perfiles',
      tipo_accion: 'editar',
      tipoAccionId: tipoAccionEditar.id,
    },
    {
      codigo: 'asignar_roles',
      nombre: 'Asignar Roles',
      modulo: 'perfiles',
      tipo_accion: 'editar',
      tipoAccionId: tipoAccionEditar.id,
    },
    {
      codigo: 'ver_roles',
      nombre: 'Ver Roles',
      modulo: 'roles',
      tipo_accion: 'ver',
      tipoAccionId: tipoAccionVer.id,
    },
    {
      codigo: 'crear_roles',
      nombre: 'Crear Roles',
      modulo: 'roles',
      tipo_accion: 'crear',
      tipoAccionId: tipoAccionCrear.id,
    },
    {
      codigo: 'editar_roles',
      nombre: 'Editar Roles',
      modulo: 'roles',
      tipo_accion: 'editar',
      tipoAccionId: tipoAccionEditar.id,
    },
    {
      codigo: 'eliminar_roles',
      nombre: 'Eliminar Roles',
      modulo: 'roles',
      tipo_accion: 'eliminar',
      tipoAccionId: tipoAccionEliminar.id,
    },
    {
      codigo: 'ver_ordenes',
      nombre: 'Ver Órdenes',
      modulo: 'ordenes',
      tipo_accion: 'ver',
      tipoAccionId: tipoAccionVer.id,
    },
    {
      codigo: 'crear_ordenes',
      nombre: 'Crear Órdenes',
      modulo: 'ordenes',
      tipo_accion: 'crear',
      tipoAccionId: tipoAccionCrear.id,
    },
    {
      codigo: 'editar_ordenes',
      nombre: 'Editar Órdenes',
      modulo: 'ordenes',
      tipo_accion: 'editar',
      tipoAccionId: tipoAccionEditar.id,
    },
    {
      codigo: 'eliminar_ordenes',
      nombre: 'Eliminar Órdenes',
      modulo: 'ordenes',
      tipo_accion: 'eliminar',
      tipoAccionId: tipoAccionEliminar.id,
    },
  ];

  const createdRoles: {
    id: string;
    codigo: string;
    nombre: string;
    modulo: string;
    tipoAccionId: string;
    activo: boolean;
    estadoId: string;
    tenantId: string;
    orden: number;
    visible: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  for (const roleData of adminRoles) {
    const role = await prisma.rol.upsert({
      where: { codigo: roleData.codigo },
      update: {},
      create: {
        codigo: roleData.codigo,
        nombre: roleData.nombre,
        modulo: roleData.modulo,
        tipoAccionId: roleData.tipoAccionId,
        activo: true,
        estadoId: estadoActivo.id,
        tenantId: adminTenant.id,
        visible: true,
        orden: 1,
      },
    });
    createdRoles.push(role);
  }

  // Create admin profile - using the composite unique constraint
  const adminProfile = await prisma.perfil.upsert({
    where: {
      nombre_tenantId: {
        nombre: 'Administrador del Sistema',
        tenantId: adminTenant.id,
      },
    },
    update: {},
    create: {
      nombre: 'Administrador del Sistema',
      descripcion:
        'Perfil con acceso completo a todas las funcionalidades del sistema',
      activo: true,
      estadoId: estadoActivo.id,
      tenantId: adminTenant.id,
      tipoId: tipoPerfilAdministrativo.id,
      contacto: 'admin@demo.cl',
      rut: '98765432-1',
    },
  });

  // Assign all roles to admin profile (using PerfilRol model)
  for (const role of createdRoles) {
    await prisma.perfilRol.upsert({
      where: {
        perfilId_rolId_tenantId: {
          perfilId: adminProfile.id,
          rolId: role.id,
          tenantId: adminTenant.id,
        },
      },
      update: {},
      create: {
        perfilId: adminProfile.id,
        rolId: role.id,
        tenantId: adminTenant.id,
      },
    });
  }

  // Create admin user - using correo which is unique
  const adminUser = await prisma.usuario.upsert({
    where: { correo: 'admin@demo.cl' },
    update: {},
    create: {
      correo: 'admin@demo.cl',
      nombre: 'Administrador del Sistema',
      activo: true,
      contacto: 'Administrador Principal',
      rut: '11222333-4',
      telefono: '+56912345678',
      tenantId: adminTenant.id,
      perfilId: adminProfile.id,
      estadoId: estadoActivo.id,
      tipoId: tipoUsuarioStandard.id,
    },
  });

  // Create credentials for admin user
  const passwordHash = await bcrypt.hash('12345678', 12);
  await prisma.usuarioCredencial.upsert({
    where: { usuarioId: adminUser.id },
    update: { passwordHash },
    create: {
      usuarioId: adminUser.id,
      passwordHash,
      activo: true,
      tenantId: adminTenant.id,
    },
  });

  // Also create a regular user for testing
  const regularProfile = await prisma.perfil.upsert({
    where: {
      nombre_tenantId: {
        nombre: 'Usuario Operacional',
        tenantId: adminTenant.id,
      },
    },
    update: {},
    create: {
      nombre: 'Usuario Operacional',
      descripcion: 'Perfil para usuarios con permisos básicos de operación',
      activo: true,
      estadoId: estadoActivo.id,
      tenantId: adminTenant.id,
      tipoId: tipoPerfilAdministrativo.id,
      contacto: 'usuario@demo.cl',
      rut: '55666777-8',
    },
  });

  // Assign basic roles to regular profile
  const basicRoles = ['ver_ordenes', 'crear_ordenes', 'ver_usuarios'];
  for (const roleCode of basicRoles) {
    const role = createdRoles.find((r) => r.codigo === roleCode);
    if (role) {
      await prisma.perfilRol.upsert({
        where: {
          perfilId_rolId_tenantId: {
            perfilId: regularProfile.id,
            rolId: role.id,
            tenantId: adminTenant.id,
          },
        },
        update: {},
        create: {
          perfilId: regularProfile.id,
          rolId: role.id,
          tenantId: adminTenant.id,
        },
      });
    }
  }

  const regularUser = await prisma.usuario.upsert({
    where: { correo: 'usuario@demo.cl' },
    update: {},
    create: {
      correo: 'usuario@demo.cl',
      nombre: 'Usuario de Prueba',
      activo: true,
      contacto: 'Usuario Regular',
      rut: '99888777-6',
      telefono: '+56987654321',
      tenantId: adminTenant.id,
      perfilId: regularProfile.id,
      estadoId: estadoActivo.id,
      tipoId: tipoUsuarioStandard.id,
    },
  });

  const regularPasswordHash = await bcrypt.hash('12345678', 12);
  await prisma.usuarioCredencial.upsert({
    where: { usuarioId: regularUser.id },
    update: { passwordHash: regularPasswordHash },
    create: {
      usuarioId: regularUser.id,
      passwordHash: regularPasswordHash,
      activo: true,
      tenantId: adminTenant.id,
    },
  });

  console.log('🎉 Database seeded successfully!');
  console.log('================================');
  console.log('👑 Admin User: admin@demo.cl');
  console.log('   Password: 12345678');
  console.log('   Permissions: Full admin access');
  console.log('');
  console.log('👤 Regular User: usuario@demo.cl');
  console.log('   Password: 12345678');
  console.log('   Permissions: Basic operational access');
  console.log('');
  console.log('🔑 Both passwords work with the test-login endpoint');
  console.log('================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
