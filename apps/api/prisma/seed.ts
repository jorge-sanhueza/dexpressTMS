import {
  PrismaClient,
  Rol,
  TipoTenant,
  TipoAccion,
  EstadoUsuario,
  TipoEntidad,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const chileanRegions = [
    {
      codigo: 'XV',
      nombre: 'XV de Arica y Parinacota',
      ordinal: 15,
      provincias: [
        {
          nombre: 'Arica',
          comunas: ['Arica', 'Camarones'],
        },
        {
          nombre: 'Parinacota',
          comunas: ['Putre', 'General Lagos'],
        },
      ],
    },
    {
      codigo: 'I',
      nombre: 'I de Tarapacá',
      ordinal: 1,
      provincias: [
        {
          nombre: 'Iquique',
          comunas: ['Alto Hospicio', 'Iquique'],
        },
        {
          nombre: 'Del Tamarugal',
          comunas: ['Huara', 'Camiña', 'Colchane', 'Pica', 'Pozo Almonte'],
        },
      ],
    },
    {
      codigo: 'II',
      nombre: 'II de Antofagasta',
      ordinal: 2,
      provincias: [
        {
          nombre: 'Tocopilla',
          comunas: ['Tocopilla', 'María Elena'],
        },
        {
          nombre: 'El Loa',
          comunas: ['Calama', 'Ollagüe', 'San Pedro de Atacama'],
        },
        {
          nombre: 'Antofagasta',
          comunas: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal'],
        },
      ],
    },
    {
      codigo: 'III',
      nombre: 'III de Atacama',
      ordinal: 3,
      provincias: [
        {
          nombre: 'Chañaral',
          comunas: ['Chañaral', 'Diego de Almagro'],
        },
        {
          nombre: 'Copiapó',
          comunas: ['Copiapó', 'Caldera', 'Tierra Amarilla'],
        },
        {
          nombre: 'Huasco',
          comunas: ['Vallenar', 'Freirina', 'Huasco', 'Alto del Carmen'],
        },
      ],
    },
    {
      codigo: 'IV',
      nombre: 'IV de Coquimbo',
      ordinal: 4,
      provincias: [
        {
          nombre: 'Elqui',
          comunas: [
            'La Serena',
            'La Higuera',
            'Coquimbo',
            'Andacollo',
            'Vicuña',
            'Paihuano',
          ],
        },
        {
          nombre: 'Limarí',
          comunas: [
            'Ovalle',
            'Río Hurtado',
            'Monte Patria',
            'Combarbalá',
            'Punitaqui',
          ],
        },
        {
          nombre: 'Choapa',
          comunas: ['Illapel', 'Salamanca', 'Los Vilos', 'Canela'],
        },
      ],
    },
    {
      codigo: 'V',
      nombre: 'V de Valparaíso',
      ordinal: 5,
      provincias: [
        {
          nombre: 'Petorca',
          comunas: ['La Ligua', 'Petorca', 'Cabildo', 'Zapallar', 'Papudo'],
        },
        {
          nombre: 'Los Andes',
          comunas: ['Los Andes', 'San Esteban', 'Calle Larga', 'Rinconada'],
        },
        {
          nombre: 'San Felipe de Aconcagua',
          comunas: [
            'San Felipe',
            'Putaendo',
            'Santa María',
            'Panquehue',
            'Llaillay',
            'Catemu',
          ],
        },
        {
          nombre: 'Quillota',
          comunas: [
            'Quillota',
            'La Cruz',
            'Calera',
            'Nogales',
            'Hijuelas',
            'Limache',
            'Olmué',
          ],
        },
        {
          nombre: 'Valparaíso',
          comunas: [
            'Valparaíso',
            'Viña del Mar',
            'Quintero',
            'Puchuncaví',
            'Quilpué',
            'Villa Alemana',
            'Casablanca',
            'Concón',
            'Juan Fernández',
          ],
        },
        {
          nombre: 'San Antonio',
          comunas: [
            'San Antonio',
            'Cartagena',
            'El Tabo',
            'El Quisco',
            'Algarrobo',
            'Santo Domingo',
          ],
        },
        {
          nombre: 'Isla de Pascua',
          comunas: ['Isla de Pascua'],
        },
      ],
    },
    {
      codigo: 'VI',
      nombre: "VI del Libertador General Bernardo O'Higgins",
      ordinal: 6,
      provincias: [
        {
          nombre: 'Cachapoal',
          comunas: [
            'Rancagua',
            'Graneros',
            'Mostazal',
            'Codegua',
            'Machalí',
            'Olivar',
            'Requinoa',
            'Rengo',
            'Malloa',
            'Quinta de Tilcoco',
            'San Vicente',
            'Pichidegua',
            'Peumo',
            'Coltauco',
            'Coinco',
            'Doñihue',
            'Las Cabras',
          ],
        },
        {
          nombre: 'Colchagua',
          comunas: [
            'San Fernando',
            'Chimbarongo',
            'Placilla',
            'Nancagua',
            'Chépica',
            'Santa Cruz',
            'Lolol',
            'Pumanque',
            'Palmilla',
            'Peralillo',
          ],
        },
        {
          nombre: 'Cardenal Caro',
          comunas: [
            'Pichilemu',
            'Navidad',
            'Litueche',
            'La Estrella',
            'Marchihue',
            'Paredones',
          ],
        },
      ],
    },
    {
      codigo: 'VII',
      nombre: 'VII del Maule',
      ordinal: 7,
      provincias: [
        {
          nombre: 'Curicó',
          comunas: [
            'Curicó',
            'Teno',
            'Romeral',
            'Molina',
            'Sagrada Familia',
            'Hualañé',
            'Licantén',
            'Vichuquén',
            'Rauco',
          ],
        },
        {
          nombre: 'Talca',
          comunas: [
            'Talca',
            'Pelarco',
            'Río Claro',
            'San Clemente',
            'Maule',
            'San Rafael',
            'Empedrado',
            'Pencahue',
            'Constitución',
            'Curepto',
          ],
        },
        {
          nombre: 'Linares',
          comunas: [
            'Linares',
            'Yerbas Buenas',
            'Colbún',
            'Longaví',
            'Parral',
            'Retiro',
            'Villa Alegre',
            'San Javier',
          ],
        },
        {
          nombre: 'Cauquenes',
          comunas: ['Cauquenes', 'Pelluhue', 'Chanco'],
        },
      ],
    },
    {
      codigo: 'VIII',
      nombre: 'VIII del Biobío',
      ordinal: 8,
      provincias: [
        {
          nombre: 'Ñuble',
          comunas: [
            'Chillán',
            'San Carlos',
            'Ñiquén',
            'San Fabián',
            'Coihueco',
            'Pinto',
            'San Ignacio',
            'El Carmen',
            'Yungay',
            'Pemuco',
            'Bulnes',
            'Quillón',
            'Ránquil',
            'Portezuelo',
            'Coelemu',
            'Treguaco',
            'Cobquecura',
            'Quirihue',
            'Ninhue',
            'San Nicolás',
            'Chillán Viejo',
          ],
        },
        {
          nombre: 'Biobío',
          comunas: [
            'Alto Biobío',
            'Los Angeles',
            'Cabrero',
            'Tucapel',
            'Antuco',
            'Quilleco',
            'Santa Bárbara',
            'Quilaco',
            'Mulchén',
            'Negrete',
            'Nacimiento',
            'Laja',
            'San Rosendo',
            'Yumbel',
          ],
        },
        {
          nombre: 'Concepción',
          comunas: [
            'Concepción',
            'Talcahuano',
            'Penco',
            'Tomé',
            'Florida',
            'Hualpén',
            'Hualqui',
            'Santa Juana',
            'Lota',
            'Coronel',
            'San Pedro de la Paz',
            'Chiguayante',
          ],
        },
        {
          nombre: 'Arauco',
          comunas: [
            'Lebu',
            'Arauco',
            'Curanilahue',
            'Los Alamos',
            'Cañete',
            'Contulmo',
            'Tirua',
          ],
        },
      ],
    },
    {
      codigo: 'IX',
      nombre: 'IX de la Araucanía',
      ordinal: 9,
      provincias: [
        {
          nombre: 'Malleco',
          comunas: [
            'Angol',
            'Renaico',
            'Collipulli',
            'Lonquimay',
            'Curacautín',
            'Ercilla',
            'Victoria',
            'Traiguén',
            'Lumaco',
            'Purén',
            'Los Sauces',
          ],
        },
        {
          nombre: 'Cautín',
          comunas: [
            'Temuco',
            'Lautaro',
            'Perquenco',
            'Vilcún',
            'Cholchol',
            'Cunco',
            'Melipeuco',
            'Curarrehue',
            'Pucón',
            'Villarrica',
            'Freire',
            'Pitrufquén',
            'Gorbea',
            'Loncoche',
            'Toltén',
            'Teodoro Schmidt',
            'Saavedra',
            'Carahue',
            'Nueva Imperial',
            'Galvarino',
            'Padre las Casas',
          ],
        },
      ],
    },
    {
      codigo: 'XIV',
      nombre: 'XIV de los Ríos',
      ordinal: 14,
      provincias: [
        {
          nombre: 'Valdivia',
          comunas: [
            'Valdivia',
            'Mariquina',
            'Lanco',
            'Máfil',
            'Corral',
            'Los Lagos',
            'Panguipulli',
            'Paillaco',
            'Ranco',
            'La Unión',
            'Futrono',
            'Río Bueno',
            'Lago Ranco',
          ],
        },
      ],
    },
    {
      codigo: 'X',
      nombre: 'X de los Lagos',
      ordinal: 10,
      provincias: [
        {
          nombre: 'Osorno',
          comunas: [
            'Osorno',
            'San Pablo',
            'Puyehue',
            'Puerto Octay',
            'Purranque',
            'Río Negro',
            'San Juan de la Costa',
          ],
        },
        {
          nombre: 'Llanquihue',
          comunas: [
            'Puerto Montt',
            'Puerto Varas',
            'Cochamó',
            'Calbuco',
            'Maullín',
            'Los Muermos',
            'Fresia',
            'Llanquihue',
            'Frutillar',
          ],
        },
        {
          nombre: 'Chiloé',
          comunas: [
            'Castro',
            'Ancud',
            'Quemchi',
            'Dalcahue',
            'Curaco de Vélez',
            'Quinchao',
            'Puqueldón',
            'Chonchi',
            'Queilén',
            'Quellón',
          ],
        },
        {
          nombre: 'Palena',
          comunas: ['Chaitén', 'Hualaihué', 'Futaleufú', 'Palena'],
        },
      ],
    },
    {
      codigo: 'XI',
      nombre: 'XI Aysén del General Carlos Ibáñez del Campo',
      ordinal: 11,
      provincias: [
        {
          nombre: 'Coihaique',
          comunas: ['Coyhaique', 'Lago Verde'],
        },
        {
          nombre: 'Aisén',
          comunas: ['Aysén', 'Cisnes', 'Guaitecas'],
        },
        {
          nombre: 'General Carrera',
          comunas: ['Chile Chico', 'Río Ibánez'],
        },
        {
          nombre: 'Capitán Prat',
          comunas: ['Cochrane', "O'Higgins", 'Tortel'],
        },
      ],
    },
    {
      codigo: 'XII',
      nombre: 'XII de Magallanes y Antártica Chilena',
      ordinal: 12,
      provincias: [
        {
          nombre: 'Ultima Esperanza',
          comunas: ['Natales', 'Torres del Paine'],
        },
        {
          nombre: 'Magallanes',
          comunas: [
            'Punta Arenas',
            'Río Verde',
            'Laguna Blanca',
            'San Gregorio',
          ],
        },
        {
          nombre: 'Tierra del Fuego',
          comunas: ['Porvenir', 'Primavera', 'Timaukel'],
        },
        {
          nombre: 'Antártica Chilena',
          comunas: ['Cabo de Hornos', 'Antártica'],
        },
      ],
    },
    {
      codigo: 'RM',
      nombre: 'Metropolitana de Santiago',
      ordinal: 13,
      provincias: [
        {
          nombre: 'Santiago',
          comunas: [
            'Santiago',
            'Independencia',
            'Conchalí',
            'Huechuraba',
            'Recoleta',
            'Providencia',
            'Vitacura',
            'Lo Barnechea',
            'Las Condes',
            'Ñuñoa',
            'La Reina',
            'Macul',
            'Peñalolén',
            'La Florida',
            'San Joaquín',
            'La Granja',
            'La Pintana',
            'San Ramón',
            'San Miguel',
            'La Cisterna',
            'El Bosque',
            'Pedro Aguirre Cerda',
            'Lo Espejo',
            'Estación Central',
            'Cerrillos',
            'Maipú',
            'Quinta Normal',
            'Lo Prado',
            'Pudahuel',
            'Cerro Navia',
            'Renca',
            'Quilicura',
          ],
        },
        {
          nombre: 'Chacabuco',
          comunas: ['Colina', 'Lampa', 'Tiltil'],
        },
        {
          nombre: 'Cordillera',
          comunas: ['Puente Alto', 'San José de Maipo', 'Pirque'],
        },
        {
          nombre: 'Maipo',
          comunas: ['San Bernardo', 'Buin', 'Paine', 'Calera de Tango'],
        },
        {
          nombre: 'Melipilla',
          comunas: [
            'Melipilla',
            'María Pinto',
            'Curacaví',
            'Alhué',
            'San Pedro',
          ],
        },
        {
          nombre: 'Talagante',
          comunas: [
            'Talagante',
            'Peñaflor',
            'Isla de Maipo',
            'El Monte',
            'Padre Hurtado',
          ],
        },
      ],
    },
  ];

  console.log('Seeding database...');

  // Create admin tenant first
  let adminTenant;

  try {
    adminTenant = await prisma.tenant.upsert({
      where: { nombre: 'Tenant Administrativo' },
      update: {},
      create: {
        nombre: 'Tenant Administrativo',
        contacto: 'admin@demo.cl',
        rut: '12345678-9',
        activo: true,
        tipoTenant: TipoTenant.ADMIN,
      },
    });
    console.log('✅ Admin tenant created:', adminTenant.id);
  } catch (error) {
    console.error('❌ Failed to create admin tenant:', error);
    throw error;
  }

  if (!adminTenant) {
    throw new Error('Admin tenant creation failed');
  }

  // Create roles for the admin tenant
  const adminRoles = [
    {
      codigo: 'admin_access',
      nombre: 'Acceso Administrativo',
      modulo: 'sistema',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'ver_usuarios',
      nombre: 'Ver Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_usuarios',
      nombre: 'Crear Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_usuarios',
      nombre: 'Editar Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'eliminar_usuarios',
      nombre: 'Eliminar Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.ELIMINAR,
    },
    {
      codigo: 'ver_perfiles',
      nombre: 'Ver Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_perfiles',
      nombre: 'Crear Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_perfiles',
      nombre: 'Editar Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'asignar_roles',
      nombre: 'Asignar Roles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'ver_roles',
      nombre: 'Ver Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_roles',
      nombre: 'Crear Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_roles',
      nombre: 'Editar Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'eliminar_roles',
      nombre: 'Eliminar Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.ELIMINAR,
    },
    {
      codigo: 'ver_ordenes',
      nombre: 'Ver Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_ordenes',
      nombre: 'Crear Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_ordenes',
      nombre: 'Editar Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'eliminar_ordenes',
      nombre: 'Eliminar Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.ELIMINAR,
    },
    {
      codigo: 'ver_clientes',
      nombre: 'Ver Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_clientes',
      nombre: 'Crear Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_clientes',
      nombre: 'Editar Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'eliminar_clientes',
      nombre: 'Eliminar Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.ELIMINAR,
    },
    {
      codigo: 'ver_carriers',
      nombre: 'Ver Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_carriers',
      nombre: 'Crear Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_carriers',
      nombre: 'Editar Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'eliminar_carriers',
      nombre: 'Eliminar Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.ELIMINAR,
    },
    {
      codigo: 'ver_embarcadores',
      nombre: 'Ver Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.VER,
    },
    {
      codigo: 'crear_embarcadores',
      nombre: 'Crear Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.CREAR,
    },
    {
      codigo: 'editar_embarcadores',
      nombre: 'Editar Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.EDITAR,
    },
    {
      codigo: 'eliminar_embarcadores',
      nombre: 'Eliminar Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.ELIMINAR,
    },
  ];
  const createdRoles: Rol[] = [];

  for (const roleData of adminRoles) {
    try {
      const role = await prisma.rol.upsert({
        where: { codigo: roleData.codigo },
        update: {},
        create: {
          codigo: roleData.codigo,
          nombre: roleData.nombre,
          modulo: roleData.modulo,
          tipoAccion: roleData.tipoAccion,
          activo: true,
          tenantId: adminTenant.id,
          visible: true,
          orden: 1,
        },
      });
      createdRoles.push(role);
    } catch (error) {
      console.log(`Role ${roleData.codigo} already exists, skipping...`);
    }
  }

  // Create admin profile
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
      tenantId: adminTenant.id,
    },
  });

  // Assign all roles to admin profile
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

  // Create admin user
  const adminUser = await prisma.usuario.upsert({
    where: { correo: 'admin@demo.cl' },
    update: {},
    create: {
      correo: 'admin@demo.cl',
      nombre: 'Administrador del Sistema',
      activo: true,
      estado: EstadoUsuario.ACTIVO,
      rut: '11222333-4',
      telefono: '+56912345678',
      tenantId: adminTenant.id,
      perfilId: adminProfile.id,
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

  // Create regular user profile
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
      tenantId: adminTenant.id,
    },
  });

  // Assign view-only roles to regular profile
  const viewOnlyRoles = [
    'ver_usuarios',
    'ver_perfiles',
    'ver_roles',
    'ver_ordenes',
    'ver_clientes',
    'ver_carriers',
    'ver_embarcadores',
  ];

  for (const roleCode of viewOnlyRoles) {
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
      estado: EstadoUsuario.ACTIVO,
      rut: '99888777-6',
      telefono: '+56987654321',
      tenantId: adminTenant.id,
      perfilId: regularProfile.id,
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

  // Create Chilean regions, provinces, and communes with tenant
  console.log('🌎 Creating Chilean regions, provinces, and communes...');

  for (const regionData of chileanRegions) {
    const region = await prisma.region.create({
      data: {
        codigo: regionData.codigo,
        nombre: regionData.nombre,
        ordinal: regionData.ordinal,
        activo: true,
        visible: true,
        orden: regionData.ordinal,
        tenantId: adminTenant.id,
      },
    });

    let provinciaOrder = 1;
    for (const provinciaData of regionData.provincias) {
      const provincia = await prisma.provincia.create({
        data: {
          codigo: provinciaData.nombre.toLowerCase().replace(/ /g, '_'),
          nombre: provinciaData.nombre,
          regionId: region.id,
          activo: true,
          visible: true,
          orden: provinciaOrder++,
          tenantId: adminTenant.id,
        },
      });

      let comunaOrder = 1;
      for (const comunaNombre of provinciaData.comunas) {
        await prisma.comuna.create({
          data: {
            nombre: comunaNombre,
            regionId: region.id,
            provinciaId: provincia.id,
            visible: true,
            orden: comunaOrder++,
            activo: true,
            tenantId: adminTenant.id,
          },
        });
      }
    }
  }

  // Create order-related types
  console.log('📦 Creating order-related types...');

  // tipo_carga
  const tipoCargasData = [
    {
      nombre: 'Carga Seca',
      observaciones: 'Carga general sin requerimientos especiales',
      requiereEquipoEspecial: false,
      requiereTempControlada: false,
      visible: true,
      orden: 1,
      activo: true,
      tenantId: adminTenant.id,
    },
    {
      nombre: 'Carga Refrigerada',
      observaciones: 'Carga que requiere control de temperatura',
      requiereEquipoEspecial: true,
      requiereTempControlada: true,
      visible: true,
      orden: 2,
      activo: true,
      tenantId: adminTenant.id,
    },
    {
      nombre: 'Carga Peligrosa',
      observaciones:
        'Materiales peligrosos que requieren certificación especial',
      requiereEquipoEspecial: true,
      requiereTempControlada: false,
      visible: true,
      orden: 3,
      activo: true,
      tenantId: adminTenant.id,
    },
  ];

  // Create all tipos carga
  for (const data of tipoCargasData) {
    try {
      await prisma.tipoCarga.create({
        data,
      });
      console.log(`✅ Created TipoCarga: ${data.nombre}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⏩ TipoCarga "${data.nombre}" already exists, skipping...`,
        );
      } else {
        throw error;
      }
    }
  }

  // tipo_servicio
  const tipoServicioExpress = await prisma.tipoServicio.upsert({
    where: { codigo: 'express' },
    update: {},
    create: {
      codigo: 'express',
      nombre: 'Servicio Express',
      descripcion: 'Entrega urgente en 24 horas',
      activo: true,
      visible: true,
      orden: 1,
      tenantId: adminTenant.id,
    },
  });

  const tipoServicioEstandar = await prisma.tipoServicio.upsert({
    where: { codigo: 'estandar' },
    update: {},
    create: {
      codigo: 'estandar',
      nombre: 'Servicio Estándar',
      descripcion: 'Entrega en 2-3 días hábiles',
      activo: true,
      visible: true,
      orden: 2,
      tenantId: adminTenant.id,
    },
  });

  const tipoServicioEconomico = await prisma.tipoServicio.upsert({
    where: { codigo: 'economico' },
    update: {},
    create: {
      codigo: 'economico',
      nombre: 'Servicio Económico',
      descripcion: 'Entrega en 4-5 días hábiles',
      activo: true,
      visible: true,
      orden: 3,
      tenantId: adminTenant.id,
    },
  });

  // Get a comuna for creating entities
  const santiagoComuna = await prisma.comuna.findFirst({
    where: {
      nombre: 'Santiago',
      tenantId: adminTenant.id,
    },
  });

  // Create sample clients, carriers, and embarcadores
  console.log('🏢 Creating sample business entities...');

  // Sample carrier - FIXED with null check
  if (!santiagoComuna) {
    throw new Error('Santiago comuna not found, cannot create carrier');
  }

  // Sample client
  const sampleClient = await prisma.cliente.upsert({
    where: { rut: '76000000-0' },
    update: {},
    create: {
      nombre: 'Cliente Demo S.A.',
      razonSocial: 'Cliente Demo Sociedad Anónima',
      rut: '76000000-0',
      contacto: 'Juan Pérez',
      email: 'cliente@demo.cl',
      telefono: '+56912345678',
      direccion: 'Av. Principal 123',
      comunaId: santiagoComuna.id,
      activo: true,
      tipoEntidad: TipoEntidad.CLIENTE,
      tenantId: adminTenant.id,
    },
  });

  // Sample carrier
  const sampleCarrier = await prisma.carrier.upsert({
    where: { rut: '77000000-0' },
    update: {},
    create: {
      nombre: 'Transportes Express S.A.',
      razonSocial: 'Transportes Express Sociedad Anónima',
      rut: '77000000-0',
      contacto: 'María González',
      email: 'transportes@demo.cl',
      telefono: '+56987654321',
      direccion: 'Av. Logística 456',
      comunaId: santiagoComuna?.id,
      activo: true,
      tipoEntidad: TipoEntidad.CARRIER,
      tenantId: adminTenant.id,
    },
  });

  // Sample embarcador
  const sampleEmbarcador = await prisma.embarcador.upsert({
    where: { rut: '78000000-0' },
    update: {},
    create: {
      nombre: 'Embarcadores Unidos S.A.',
      razonSocial: 'Embarcadores Unidos Sociedad Anónima',
      rut: '78000000-0',
      contacto: 'Carlos López',
      email: 'embarcadores@demo.cl',
      telefono: '+56911223344',
      direccion: 'Av. Comercial 789',
      comunaId: santiagoComuna?.id,
      activo: true,
      tipoEntidad: TipoEntidad.EMBARCADOR,
      tenantId: adminTenant.id,
    },
  });

  // Create sample equipment types and models
  console.log('🚚 Creating sample equipment types...');

  const tipoCamion = await prisma.tipoEquipo.upsert({
    where: { codigo: 'camion' },
    update: {},
    create: {
      codigo: 'camion',
      nombre: 'Camión',
      descripcion: 'Vehículo de carga pesada',
      activo: true,
      visible: true,
      orden: 1,
      tenantId: adminTenant.id,
    },
  });

  const tipoFurgon = await prisma.tipoEquipo.upsert({
    where: { codigo: 'furgon' },
    update: {},
    create: {
      codigo: 'furgon',
      nombre: 'Furgón',
      descripcion: 'Vehículo de carga mediana',
      activo: true,
      visible: true,
      orden: 2,
      tenantId: adminTenant.id,
    },
  });

  // Create sample transport models
  const modeloCamionPesado = await prisma.modeloTransporte.create({
    data: {
      codigo: 'camion_pesado_2023',
      nombre: 'Camión Pesado 2023',
      tipoEquipoId: tipoCamion.id,
      tipoModelo: 'RAMPLA',
      tonelaje: 15000,
      volumenM3: 80,
      largoMts: 12,
      anchoMts: 2.4,
      altoMts: 2.6,
      activo: true,
      visible: true,
      orden: 1,
      tenantId: adminTenant.id,
    },
  });

  console.log('🎉 Database seeded successfully!');
  console.log('================================');
  console.log('🌎 Created all Chilean regions, provinces, and communes');
  console.log('📦 Created order types and sample business entities');
  console.log('🚚 Created equipment types and models');
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
