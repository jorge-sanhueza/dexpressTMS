// create-test-user.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // 1. Find or create a tenant
    let tenant = await prisma.tenant.findFirst({
      where: { nombre: 'Test Tenant' },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          nombre: 'Test Tenant',
          contacto: 'test@tenant.com',
          rut: '99999999-9',
          activo: true,
          tipoTenant: 'ADMIN',
        },
      });
      console.log('✅ Created test tenant:', tenant.id);
    } else {
      console.log('✅ Using existing test tenant:', tenant.id);
    }

    // 2. Find or create a profile
    let profile = await prisma.perfil.findFirst({
      where: {
        nombre: 'Test Profile',
        tenantId: tenant.id,
      },
    });

    if (!profile) {
      profile = await prisma.perfil.create({
        data: {
          nombre: 'Test Profile',
          descripcion: 'Profile for testing',
          activo: true,
          tenantId: tenant.id,
        },
      });
      console.log('✅ Created test profile:', profile.id);
    } else {
      console.log('✅ Using existing test profile:', profile.id);
    }

    // 3. Create test user
    const testUser = await prisma.usuario.create({
      data: {
        correo: 'test@example.com',
        nombre: 'Test User',
        activo: true,
        estado: 'ACTIVO',
        tenantId: tenant.id,
        perfilId: profile.id,
        rut: '11111111-1',
        telefono: '+56912345678',
      },
    });

    console.log('✅ Created test user:', testUser.id);
    console.log('📧 Email:', testUser.correo);
    console.log('🔑 Tenant ID:', testUser.tenantId);

    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
