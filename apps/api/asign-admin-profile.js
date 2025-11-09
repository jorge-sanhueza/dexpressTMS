const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignAdminProfile() {
  try {
    const testUserEmail = 'test@example.com';
    const adminTenantName = 'Tenant Administrativo';

    console.log('👑 Assigning admin profile to test user...\n');

    // Find the admin tenant
    const adminTenant = await prisma.tenant.findFirst({
      where: { nombre: adminTenantName },
    });

    if (!adminTenant) {
      throw new Error('Admin tenant not found');
    }
    console.log('✅ Found admin tenant:', adminTenant.id);

    // Find the admin profile
    const adminProfile = await prisma.perfil.findFirst({
      where: {
        nombre: 'Administrador del Sistema',
        tenantId: adminTenant.id,
      },
      include: {
        perfilesRoles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!adminProfile) {
      throw new Error('Admin profile not found');
    }
    console.log('✅ Found admin profile:', adminProfile.id);
    console.log(
      '📋 Admin profile has',
      adminProfile.perfilesRoles.length,
      'roles',
    );

    // Find the test user
    const testUser = await prisma.usuario.findFirst({
      where: { correo: testUserEmail },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }
    console.log('✅ Found test user:', testUser.id);

    // Update the test user to use the admin profile
    const updatedUser = await prisma.usuario.update({
      where: { id: testUser.id },
      data: {
        perfilId: adminProfile.id,
        tenantId: adminTenant.id, // Also ensure they're in the admin tenant
      },
      include: {
        perfil: {
          include: {
            perfilesRoles: {
              include: {
                rol: true,
              },
            },
          },
        },
      },
    });

    console.log('🎉 Successfully assigned admin profile to test user!');
    console.log('\n📊 Updated user details:');
    console.log('   Email:', updatedUser.correo);
    console.log('   Name:', updatedUser.nombre);
    console.log('   Profile:', updatedUser.perfil.nombre);
    console.log('   Tenant:', adminTenant.nombre);
    console.log(
      '   Permissions count:',
      updatedUser.perfil.perfilesRoles.length,
    );

    // Show some of the permissions
    console.log('\n🔑 Sample permissions:');
    updatedUser.perfil.perfilesRoles.slice(0, 10).forEach((pr) => {
      console.log(`   - ${pr.rol.nombre} (${pr.rol.codigo})`);
    });
    if (updatedUser.perfil.perfilesRoles.length > 10) {
      console.log(
        `   ... and ${updatedUser.perfil.perfilesRoles.length - 10} more`,
      );
    }
  } catch (error) {
    console.error('❌ Error assigning admin profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminProfile();
