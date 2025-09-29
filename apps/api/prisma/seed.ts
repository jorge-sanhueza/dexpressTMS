import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create system-wide statuses using unique field 'estado'
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

  // Create system-wide types using unique fields
  const tipoTenantAdmin = await prisma.tipoTenant.upsert({
    where: { tipoTenant: 'admin' },
    update: {},
    create: { tipoTenant: 'admin', tenantId: null },
  });

  const tipoUsuarioStandard = await prisma.tipoUsuario.upsert({
    where: { tipoUsuario: 'standard' },
    update: {},
    create: { tipoUsuario: 'standard', tenantId: null },
  });

  const tipoPerfilAdministrativo = await prisma.tipoPerfil.upsert({
    where: { tipoPerfil: 'administrativo' },
    update: {},
    create: { tipoPerfil: 'administrativo', tenantId: null },
  });

  const tipoAccionVer = await prisma.tipoAccion.upsert({
    where: { tipoAccion: 'ver' },
    update: {},
    create: { tipoAccion: 'ver', tenantId: null },
  });

  console.log('Database seeded successfully!');
  console.log({
    estadoActivo: estadoActivo.id,
    tipoTenantAdmin: tipoTenantAdmin.id,
    tipoUsuarioStandard: tipoUsuarioStandard.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
