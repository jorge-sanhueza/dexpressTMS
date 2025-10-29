import { PrismaClient, Perfil } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { fakerES as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with additional data...');

  // First, let's check what already exists
  const existingTenant = await prisma.tenant.findFirst({
    where: { nombre: 'Tenant Administrativo' },
  });

  if (!existingTenant) {
    console.log(
      '❌ Admin tenant not found. Please run your original seed first.',
    );
    process.exit(1);
  }

  const adminTenant = existingTenant;
  const estadoActivo = await prisma.estadoRegistro.findFirst({
    where: { estado: 'activo' },
  });
  const tipoPerfilBasico = await prisma.tipoPerfil.findFirst({
    where: { tipoPerfil: 'básico' },
  });
  const tipoUsuarioStandard = await prisma.tipoUsuario.findFirst({
    where: { tipoUsuario: 'standard' },
  });

  if (!estadoActivo || !tipoPerfilBasico || !tipoUsuarioStandard) {
    console.log(
      '❌ Required base types not found. Please run your original seed first.',
    );
    process.exit(1);
  }

  // Get existing roles to assign to new profiles
  const existingRoles = await prisma.rol.findMany({
    where: { tenantId: adminTenant.id },
  });

  // Create additional profiles (12 básico profiles)
  console.log('👥 Creating additional profiles...');

  const basicProfiles = [
    {
      nombre: 'Asistente Comercial',
      descripcion: 'Perfil para asistencia en actividades comerciales',
      contacto: 'asistente@demo.cl',
      rut: '55666778-8',
    },
    {
      nombre: 'Analista Junior',
      descripcion: 'Perfil para análisis básicos y reportes',
      contacto: 'analista@demo.cl',
      rut: '55666779-8',
    },
    {
      nombre: 'Ejecutivo de Ventas',
      descripcion: 'Perfil para gestión comercial y ventas',
      contacto: 'ventas@demo.cl',
      rut: '55666780-8',
    },
    {
      nombre: 'Asistente Administrativo',
      descripcion: 'Perfil para apoyo administrativo general',
      contacto: 'asistadmin@demo.cl',
      rut: '55666781-8',
    },
    {
      nombre: 'Operador Logístico',
      descripcion: 'Perfil para operaciones logísticas básicas',
      contacto: 'operador@demo.cl',
      rut: '55666782-8',
    },
    {
      nombre: 'Coordinador de Campo',
      descripcion: 'Perfil para coordinación en terreno',
      contacto: 'campo@demo.cl',
      rut: '55666783-8',
    },
    {
      nombre: 'Especialista en Clientes',
      descripcion: 'Perfil para atención y gestión de clientes',
      contacto: 'clientes@demo.cl',
      rut: '55666784-8',
    },
    {
      nombre: 'Técnico Operativo',
      descripcion: 'Perfil para soporte técnico operativo',
      contacto: 'tecnico@demo.cl',
      rut: '55666785-8',
    },
    {
      nombre: 'Auditor Interno',
      descripcion: 'Perfil para auditorías internas básicas',
      contacto: 'auditor@demo.cl',
      rut: '55666786-8',
    },
    {
      nombre: 'Planificador',
      descripcion: 'Perfil para planificación operativa',
      contacto: 'planificador@demo.cl',
      rut: '55666787-8',
    },
    {
      nombre: 'Digitador',
      descripcion: 'Perfil para ingreso de datos y documentación',
      contacto: 'digitador@demo.cl',
      rut: '55666788-8',
    },
    {
      nombre: 'Inspector de Calidad',
      descripcion: 'Perfil para control de calidad operativo',
      contacto: 'calidad@demo.cl',
      rut: '55666789-8',
    },
  ];

  // FIX: Explicitly type the array
  const createdProfiles: Perfil[] = [];

  for (const profileData of basicProfiles) {
    try {
      const profile = await prisma.perfil.create({
        data: {
          nombre: profileData.nombre,
          descripcion: profileData.descripcion,
          activo: true,
          estadoId: estadoActivo.id,
          tenantId: adminTenant.id,
          tipoId: tipoPerfilBasico.id,
          contacto: profileData.contacto,
          rut: profileData.rut,
        },
      });
      createdProfiles.push(profile);

      // Assign view-only roles to basic profiles
      const viewOnlyRoles = existingRoles.filter(
        (role) =>
          role.codigo.includes('ver_') &&
          !role.codigo.includes('eliminar_') &&
          !role.codigo.includes('activar_'),
      );

      for (const role of viewOnlyRoles) {
        await prisma.perfilRol.create({
          data: {
            perfilId: profile.id,
            rolId: role.id,
            tenantId: adminTenant.id,
          },
        });
      }
      console.log(`✅ Created profile: ${profileData.nombre}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Profile "${profileData.nombre}" already exists, skipping...`,
        );
        // Try to find the existing profile
        const existingProfile = await prisma.perfil.findFirst({
          where: {
            nombre: profileData.nombre,
            tenantId: adminTenant.id,
          },
        });
        if (existingProfile) {
          createdProfiles.push(existingProfile);
        }
      } else {
        console.log(
          `❌ Error creating profile ${profileData.nombre}:`,
          error.message,
        );
      }
    }
  }

  // Create additional users (20 total)
  console.log('👤 Creating additional users...');

  const additionalUsers = [
    {
      correo: 'asistente1@demo.cl',
      nombre: 'Ana Martínez',
      perfilNombre: 'Asistente Comercial',
    },
    {
      correo: 'analista1@demo.cl',
      nombre: 'Pedro Rodríguez',
      perfilNombre: 'Analista Junior',
    },
    {
      correo: 'ventas1@demo.cl',
      nombre: 'Laura Fernández',
      perfilNombre: 'Ejecutivo de Ventas',
    },
    {
      correo: 'asistadmin1@demo.cl',
      nombre: 'Diego Silva',
      perfilNombre: 'Asistente Administrativo',
    },
    {
      correo: 'operador1@demo.cl',
      nombre: 'Camila Rojas',
      perfilNombre: 'Operador Logístico',
    },
    {
      correo: 'campo1@demo.cl',
      nombre: 'Jorge Mendoza',
      perfilNombre: 'Coordinador de Campo',
    },
    {
      correo: 'clientes1@demo.cl',
      nombre: 'Sofía Vargas',
      perfilNombre: 'Especialista en Clientes',
    },
    {
      correo: 'tecnico1@demo.cl',
      nombre: 'Ricardo Castro',
      perfilNombre: 'Técnico Operativo',
    },
    {
      correo: 'auditor1@demo.cl',
      nombre: 'Elena Torres',
      perfilNombre: 'Auditor Interno',
    },
    {
      correo: 'planificador1@demo.cl',
      nombre: 'Miguel Ángel Soto',
      perfilNombre: 'Planificador',
    },
    {
      correo: 'digitador1@demo.cl',
      nombre: 'Patricia Núñez',
      perfilNombre: 'Digitador',
    },
    {
      correo: 'asistente2@demo.cl',
      nombre: 'Fernando García',
      perfilNombre: 'Asistente Comercial',
    },
    {
      correo: 'analista2@demo.cl',
      nombre: 'Gabriela Muñoz',
      perfilNombre: 'Analista Junior',
    },
    {
      correo: 'ventas2@demo.cl',
      nombre: 'Roberto Díaz',
      perfilNombre: 'Ejecutivo de Ventas',
    },
    {
      correo: 'asistadmin2@demo.cl',
      nombre: 'Claudia Pérez',
      perfilNombre: 'Asistente Administrativo',
    },
    {
      correo: 'operador2@demo.cl',
      nombre: 'Héctor Ruiz',
      perfilNombre: 'Operador Logístico',
    },
    {
      correo: 'campo2@demo.cl',
      nombre: 'Mónica Herrera',
      perfilNombre: 'Coordinador de Campo',
    },
    {
      correo: 'clientes2@demo.cl',
      nombre: 'Oscar Jiménez',
      perfilNombre: 'Especialista en Clientes',
    },
    {
      correo: 'tecnico2@demo.cl',
      nombre: 'Natalia Romero',
      perfilNombre: 'Técnico Operativo',
    },
    {
      correo: 'auditor2@demo.cl',
      nombre: 'Pablo Navarro',
      perfilNombre: 'Auditor Interno',
    },
  ];

  // FIX: Explicitly type the users array too
  const createdUsers: any[] = [];

  for (const userData of additionalUsers) {
    try {
      const profile = createdProfiles.find(
        (p) => p.nombre === userData.perfilNombre,
      );
      if (!profile) {
        console.log(
          `❌ Profile "${userData.perfilNombre}" not found for user ${userData.correo}`,
        );
        continue;
      }

      const user = await prisma.usuario.create({
        data: {
          correo: userData.correo,
          nombre: userData.nombre,
          activo: true,
          contacto: userData.nombre,
          rut: faker.string.numeric(8) + '-' + faker.string.numeric(1),
          telefono: '+569' + faker.string.numeric(8),
          tenantId: adminTenant.id,
          perfilId: profile.id,
          estadoId: estadoActivo.id,
          tipoId: tipoUsuarioStandard.id,
        },
      });
      createdUsers.push(user);

      const passwordHash = await bcrypt.hash('12345678', 12);
      await prisma.usuarioCredencial.create({
        data: {
          usuarioId: user.id,
          passwordHash,
          activo: true,
          tenantId: adminTenant.id,
        },
      });
      console.log(`✅ Created user: ${userData.correo}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️ User "${userData.correo}" already exists, skipping...`);
      } else {
        console.log(
          `❌ Error creating user ${userData.correo}:`,
          error.message,
        );
      }
    }
  }

  // Get comunas for creating entities
  const comunas = await prisma.comuna.findMany({
    take: 10,
  });

  // Create additional clients (12 total)
  console.log('🏢 Creating additional clients...');

  const clientTypes = ['corporativo', 'pyme', 'individual', 'gubernamental'];
  const clientSectors = [
    'retail',
    'manufactura',
    'tecnología',
    'salud',
    'educación',
    'construcción',
    'agroindustria',
  ];

  let clientsCreated = 0;
  for (let i = 0; i < 20 && clientsCreated < 12; i++) {
    // Try up to 20 times to get 12 unique
    try {
      const clientType =
        clientTypes[Math.floor(Math.random() * clientTypes.length)];
      const clientSector =
        clientSectors[Math.floor(Math.random() * clientSectors.length)];
      const comuna = comunas[Math.floor(Math.random() * comunas.length)];

      await prisma.cliente.create({
        data: {
          nombre: faker.company.name(),
          razonSocial: faker.company.name() + ' SpA',
          rut: faker.string.numeric(8) + '-' + faker.string.numeric(1),
          contacto: faker.person.fullName(),
          email: faker.internet.email(),
          telefono: '+569' + faker.string.numeric(8),
          direccion: faker.location.streetAddress(),
          comunaId: comuna.id,
          activo: faker.datatype.boolean(0.8),
          estado: 'activo',
          tipo: clientType,
          tenantId: adminTenant.id,
        },
      });
      clientsCreated++;
      console.log(`✅ Created client ${clientsCreated}/12`);
    } catch (error: any) {
      if (error.code !== 'P2002') {
        console.log('❌ Error creating client:', error.message);
      }
      // Continue on duplicate RUT error
    }
  }

  // Create additional embarcadores (12 total)
  console.log('🚢 Creating additional embarcadores...');

  const embarcadorTypes = [
    'exportador',
    'importador',
    'nacional',
  ];
  const embarcadorSpecialties = [
    'alimentos',
    'electrónicos',
    'textil',
    'químicos',
    'maquinaria',
    'materias primas',
  ];

  let embarcadoresCreated = 0;
  for (let i = 0; i < 20 && embarcadoresCreated < 12; i++) {
    try {
      const embarcadorType =
        embarcadorTypes[Math.floor(Math.random() * embarcadorTypes.length)];
      const specialty =
        embarcadorSpecialties[
          Math.floor(Math.random() * embarcadorSpecialties.length)
        ];
      const comuna = comunas[Math.floor(Math.random() * comunas.length)];

      await prisma.embarcador.create({
        data: {
          nombre: `Embarcadores ${faker.company.name()}`,
          razonSocial: faker.company.name() + ' Logística SpA',
          rut: faker.string.numeric(8) + '-' + faker.string.numeric(1),
          contacto: faker.person.fullName(),
          email: faker.internet.email(),
          telefono: '+569' + faker.string.numeric(8),
          direccion: faker.location.streetAddress(),
          comunaId: comuna.id,
          activo: faker.datatype.boolean(0.8),
          estado: 'activo',
          tipo: embarcadorType,
          tenantId: adminTenant.id,
        },
      });
      embarcadoresCreated++;
      console.log(`✅ Created embarcador ${embarcadoresCreated}/12`);
    } catch (error: any) {
      if (error.code !== 'P2002') {
        console.log('❌ Error creating embarcador:', error.message);
      }
    }
  }

  // Create additional carriers (10 total)
  console.log('🚛 Creating additional carriers...');

  const carrierTypes = [
    'nacional',
    'internacional',
    'especializado',
    'multimodal',
  ];
  const vehicleTypes = [
    'camión',
    'furgón',
    'plataforma',
    'refrigerado',
    'tanque',
  ];

  let carriersCreated = 0;
  for (let i = 0; i < 20 && carriersCreated < 10; i++) {
    try {
      const carrierType =
        carrierTypes[Math.floor(Math.random() * carrierTypes.length)];
      const vehicleType =
        vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const comuna = comunas[Math.floor(Math.random() * comunas.length)];

      await prisma.carrier.create({
        data: {
          nombre: `Transportes ${faker.company.name()}`,
          razonSocial: faker.company.name() + ' Transportes SpA',
          rut: faker.string.numeric(8) + '-' + faker.string.numeric(1),
          contacto: faker.person.fullName(),
          email: faker.internet.email(),
          telefono: '+569' + faker.string.numeric(8),
          direccion: faker.location.streetAddress(),
          comunaId: comuna.id,
          activo: faker.datatype.boolean(0.8),
          estado: 'activo',
          tipo: carrierType,
          tenantId: adminTenant.id,
        },
      });
      carriersCreated++;
      console.log(`✅ Created carrier ${carriersCreated}/10`);
    } catch (error: any) {
      if (error.code !== 'P2002') {
        console.log('❌ Error creating carrier:', error.message);
      }
    }
  }

  console.log('🎉 Additional data seeded successfully!');
  console.log('================================');
  console.log('📊 Summary of additional data:');
  console.log(`👥 Basic Profiles: ${createdProfiles.length}`);
  console.log(`👤 Users: ${createdUsers.length}`);
  console.log(`🏢 Clients: ${clientsCreated}`);
  console.log(`🚢 Embarcadores: ${embarcadoresCreated}`);
  console.log(`🚛 Carriers: ${carriersCreated}`);
  console.log('');
  console.log('🔑 All new users can login with:');
  console.log('   Email: [assigned-email]');
  console.log('   Password: 12345678');
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
