import {
  PrismaClient,
  Rol,
  TipoTenant,
  TipoAccion,
  EstadoUsuario,
  TipoEntidad,
  OrigenDireccion,
  ChoferEstado,
  PlanificacionEstado,
  PlanificacionEtapa,
  TipoOperacion,
  OrdenEstado,
  TipoCarga,
  TipoServicio,
  TipoModelo,
  TipoZona,
  TipoDatoCaracteristica,
  EstadoRetiro,
  TipoTarifa,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Utility function to generate random Chilean RUT
function generateChileanRUT(): string {
  const randomNumber = Math.floor(Math.random() * 25000000) + 1000000;
  const digits = randomNumber.toString().split('').map(Number);
  let sum = 0;
  let multiplier = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    sum += digits[i] * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const checkDigit = 11 - remainder;
  let dv: string;

  if (checkDigit === 11) dv = '0';
  else if (checkDigit === 10) dv = 'K';
  else dv = checkDigit.toString();

  return `${randomNumber.toLocaleString('en-US').replace(/,/g, '.')}-${dv}`;
}

// Utility function to generate random phone number
function generatePhoneNumber(): string {
  const prefixes = ['+569', '+5699', '+5698', '+5697'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return `${prefix}${number}`.substring(0, 12);
}

// Utility function to generate random email
function generateEmail(name: string, domain: string = 'demo.cl'): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  const randomNum = Math.floor(Math.random() * 100);
  return `${cleanName}${randomNum}@${domain}`;
}

// Sample data arrays
const companyNames = [
  'Logística Integrada',
  'Transportes Express',
  'Carga Rápida',
  'Distribución Nacional',
  'Flete Seguro',
  'Logística Avanzada',
  'Transporte Premium',
  'Carga Eficiente',
  'Distribución Global',
  'Flete Confiable',
  'Logística Moderna',
  'Transporte Ágil',
  'Carga Directa',
  'Distribución Regional',
  'Flete Express',
];

const industrySectors = [
  'Alimentos y Bebidas',
  'Tecnología',
  'Manufactura',
  'Retail',
  'Farmacéutico',
  'Automotriz',
  'Textil',
  'Químico',
  'Construcción',
  'Agroindustrial',
  'Electrónica',
  'Minería',
  'Papel y Celulosa',
  'Energía',
  'Telecomunicaciones',
];

const firstNames = [
  'Juan',
  'María',
  'Carlos',
  'Ana',
  'Pedro',
  'Laura',
  'José',
  'Carmen',
  'Luis',
  'Isabel',
  'Miguel',
  'Elena',
  'Francisco',
  'Patricia',
  'Jorge',
  'Sofía',
];

const lastNames = [
  'González',
  'Rodríguez',
  'Pérez',
  'Sánchez',
  'Martínez',
  'López',
  'Díaz',
  'Fernández',
  'García',
  'Ramírez',
  'Torres',
  'Flores',
  'Vásquez',
  'Castro',
  'Rojas',
  'Silva',
];

const streetNames = [
  'Av. Principal',
  'Calle Los Alerces',
  'Av. Libertador',
  'Calle Los Pinos',
  'Av. Central',
  'Calle Los Olivos',
  'Av. Industrial',
  'Calle Los Laureles',
  'Av. Comercial',
  'Calle Los Cerezos',
  'Av. Tecnológica',
  'Calle Los Robles',
  'Av. Logística',
  'Calle Los Cipreses',
  'Av. Distribución',
];

const streetNumbers = [
  '123',
  '456',
  '789',
  '101',
  '202',
  '303',
  '404',
  '505',
  '606',
  '707',
];

const jobTitles = [
  'Gerente de Logística',
  'Supervisor de Operaciones',
  'Coordinador de Transporte',
  'Jefe de Distribución',
  'Analista de Logística',
  'Especialista en Cadena de Suministro',
  'Encargado de Flota',
  'Planificador de Rutas',
  'Controlador de Tráfico',
  'Asistente de Operaciones',
  'Coordinador de Carga',
  'Supervisor de Almacén',
  'Gerente Comercial',
  'Ejecutivo de Cuentas',
  'Asistente Comercial',
];

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

  console.log('🌱 Seeding database...');

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
    // System access
    {
      codigo: 'admin_access',
      nombre: 'Acceso Administrativo',
      modulo: 'sistema',
      tipoAccion: TipoAccion.EDITAR,
      orden: 1,
    },

    // User management
    {
      codigo: 'ver_usuarios',
      nombre: 'Ver Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.VER,
      orden: 2,
    },
    {
      codigo: 'crear_usuarios',
      nombre: 'Crear Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.CREAR,
      orden: 3,
    },
    {
      codigo: 'editar_usuarios',
      nombre: 'Editar Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.EDITAR,
      orden: 4,
    },
    {
      codigo: 'eliminar_usuarios',
      nombre: 'Eliminar Usuarios',
      modulo: 'usuarios',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 5,
    },

    // Profile management
    {
      codigo: 'ver_perfiles',
      nombre: 'Ver Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.VER,
      orden: 6,
    },
    {
      codigo: 'crear_perfiles',
      nombre: 'Crear Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.CREAR,
      orden: 7,
    },
    {
      codigo: 'editar_perfiles',
      nombre: 'Editar Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.EDITAR,
      orden: 8,
    },
    {
      codigo: 'eliminar_perfiles',
      nombre: 'Eliminar Perfiles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 9,
    },
    {
      codigo: 'asignar_roles',
      nombre: 'Asignar Roles',
      modulo: 'perfiles',
      tipoAccion: TipoAccion.EDITAR,
      orden: 10,
    },

    // Role management
    {
      codigo: 'ver_roles',
      nombre: 'Ver Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.VER,
      orden: 11,
    },
    {
      codigo: 'crear_roles',
      nombre: 'Crear Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.CREAR,
      orden: 12,
    },
    {
      codigo: 'editar_roles',
      nombre: 'Editar Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.EDITAR,
      orden: 13,
    },
    {
      codigo: 'eliminar_roles',
      nombre: 'Eliminar Roles',
      modulo: 'roles',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 14,
    },

    // Order management
    {
      codigo: 'ver_ordenes',
      nombre: 'Ver Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.VER,
      orden: 15,
    },
    {
      codigo: 'crear_ordenes',
      nombre: 'Crear Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.CREAR,
      orden: 16,
    },
    {
      codigo: 'editar_ordenes',
      nombre: 'Editar Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.EDITAR,
      orden: 17,
    },
    {
      codigo: 'eliminar_ordenes',
      nombre: 'Eliminar Órdenes',
      modulo: 'ordenes',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 18,
    },

    // Customer management
    {
      codigo: 'ver_clientes',
      nombre: 'Ver Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.VER,
      orden: 19,
    },
    {
      codigo: 'crear_clientes',
      nombre: 'Crear Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.CREAR,
      orden: 20,
    },
    {
      codigo: 'editar_clientes',
      nombre: 'Editar Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.EDITAR,
      orden: 21,
    },
    {
      codigo: 'eliminar_clientes',
      nombre: 'Eliminar Clientes',
      modulo: 'clientes',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 22,
    },

    // Carrier management
    {
      codigo: 'ver_carriers',
      nombre: 'Ver Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.VER,
      orden: 23,
    },
    {
      codigo: 'crear_carriers',
      nombre: 'Crear Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.CREAR,
      orden: 24,
    },
    {
      codigo: 'editar_carriers',
      nombre: 'Editar Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.EDITAR,
      orden: 25,
    },
    {
      codigo: 'eliminar_carriers',
      nombre: 'Eliminar Carriers',
      modulo: 'carriers',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 26,
    },

    // Shipper management
    {
      codigo: 'ver_embarcadores',
      nombre: 'Ver Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.VER,
      orden: 27,
    },
    {
      codigo: 'crear_embarcadores',
      nombre: 'Crear Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.CREAR,
      orden: 28,
    },
    {
      codigo: 'editar_embarcadores',
      nombre: 'Editar Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.EDITAR,
      orden: 29,
    },
    {
      codigo: 'eliminar_embarcadores',
      nombre: 'Eliminar Embarcadores',
      modulo: 'embarcadores',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 30,
    },

    // Dashboard
    {
      codigo: 'ver_dashboard',
      nombre: 'Ver Dashboard',
      modulo: 'dashboard',
      tipoAccion: TipoAccion.VER,
      orden: 31,
    },

    // Address management
    {
      codigo: 'ver_direcciones',
      nombre: 'Ver Direcciones',
      modulo: 'direcciones',
      tipoAccion: TipoAccion.VER,
      orden: 32,
    },
    {
      codigo: 'crear_direcciones',
      nombre: 'Crear Direcciones',
      modulo: 'direcciones',
      tipoAccion: TipoAccion.CREAR,
      orden: 33,
    },
    {
      codigo: 'editar_direcciones',
      nombre: 'Editar Direcciones',
      modulo: 'direcciones',
      tipoAccion: TipoAccion.EDITAR,
      orden: 34,
    },
    {
      codigo: 'desactivar_direcciones',
      nombre: 'Desactivar Direcciones',
      modulo: 'direcciones',
      tipoAccion: TipoAccion.ELIMINAR,
      orden: 35,
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

  const allComunas: any[] = [];

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
        const comuna = await prisma.comuna.create({
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
        allComunas.push(comuna);
      }
    }
  }

  console.log(`✅ Created ${allComunas.length} communes`);

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

  const createdTipoCargas: typeof tipoCargasData extends Array<infer T>
    ? Awaited<ReturnType<typeof prisma.tipoCarga.create>>[]
    : never = [];
  // Create all tipos carga
  for (const data of tipoCargasData) {
    try {
      const tipoCarga = await prisma.tipoCarga.create({
        data,
      });
      createdTipoCargas.push(tipoCarga);
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

  // Create sample equipment types and models
  console.log('🚚 Creating sample equipment types and models...');

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

  const tipoCamioneta = await prisma.tipoEquipo.upsert({
    where: { codigo: 'camioneta' },
    update: {},
    create: {
      codigo: 'camioneta',
      nombre: 'Camioneta',
      descripcion: 'Vehículo de carga liviana',
      activo: true,
      visible: true,
      orden: 3,
      tenantId: adminTenant.id,
    },
  });

  // Create sample transport models
  const modelosTransporte = [
    {
      codigo: 'camion_pesado_2023',
      nombre: 'Camión Pesado Volvo 2023',
      tipoEquipoId: tipoCamion.id,
      tipoModelo: 'RAMPLA' as TipoModelo,
      tonelaje: 15000,
      volumenM3: 80,
      largoMts: 12,
      anchoMts: 2.4,
      altoMts: 2.6,
      orden: 1,
    },
    {
      codigo: 'camion_mediano_2022',
      nombre: 'Camión Mediano Mercedes 2022',
      tipoEquipoId: tipoCamion.id,
      tipoModelo: 'SEMI' as TipoModelo,
      tonelaje: 8000,
      volumenM3: 50,
      largoMts: 9,
      anchoMts: 2.3,
      altoMts: 2.4,
      orden: 2,
    },
    {
      codigo: 'furgon_refrigerado_2023',
      nombre: 'Furgón Refrigerado 2023',
      tipoEquipoId: tipoFurgon.id,
      tipoModelo: 'CARRO' as TipoModelo,
      tonelaje: 3500,
      volumenM3: 30,
      largoMts: 6,
      anchoMts: 2.1,
      altoMts: 2.2,
      orden: 3,
    },
    {
      codigo: 'camioneta_2024',
      nombre: 'Camioneta Ford F-150 2024',
      tipoEquipoId: tipoCamioneta.id,
      tipoModelo: 'TRES_CUARTOS' as TipoModelo,
      tonelaje: 1200,
      volumenM3: 8,
      largoMts: 5.8,
      anchoMts: 2,
      altoMts: 1.8,
      orden: 4,
    },
  ];

  const createdModelos: typeof modelosTransporte extends Array<infer T>
    ? Awaited<ReturnType<typeof prisma.modeloTransporte.create>>[]
    : never = [];
  for (const modelo of modelosTransporte) {
    const created = await prisma.modeloTransporte.create({
      data: {
        ...modelo,
        activo: true,
        visible: true,
        tenantId: adminTenant.id,
      },
    });
    createdModelos.push(created);
  }

  console.log(`✅ Created ${createdModelos.length} transport models`);

  // ========== CREATE ENTIDADES (for contacts, clients, carriers, embarcadores) ==========
  console.log('🏢 Creating entities...');

  const createdEntidades: Awaited<ReturnType<typeof prisma.entidad.create>>[] =
    [];

  for (let i = 0; i < 50; i++) {
    const randomComuna =
      allComunas[Math.floor(Math.random() * allComunas.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const nombre = `${firstName} ${lastName}`;

    const entidad = await prisma.entidad.create({
      data: {
        nombre,
        razonSocial: `${nombre} y Asociados`,
        rut: generateChileanRUT(),
        contacto: `${firstName} ${lastName}`,
        email: generateEmail(nombre),
        telefono: generatePhoneNumber(),
        direccion: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]}`,
        comunaId: randomComuna.id,
        activo: true,
        esPersona: Math.random() > 0.5,
        tipoEntidad: TipoEntidad.PERSONA,
        tenantId: adminTenant.id,
      },
    });
    createdEntidades.push(entidad);
  }

  console.log(`✅ Created ${createdEntidades.length} entities`);

  // ========== CREATE CLIENTES (15 clients) ==========
  console.log('👥 Creating 15 clients...');

  const createdClientes: Awaited<ReturnType<typeof prisma.cliente.create>>[] =
    [];
  const clientComunas = allComunas.filter((c) =>
    [
      'Santiago',
      'Providencia',
      'Las Condes',
      'Ñuñoa',
      'La Florida',
      'Maipú',
      'Puente Alto',
      'San Bernardo',
    ].includes(c.nombre),
  );

  for (let i = 1; i <= 15; i++) {
    const companyName =
      companyNames[Math.floor(Math.random() * companyNames.length)];
    const industry =
      industrySectors[Math.floor(Math.random() * industrySectors.length)];
    const randomComuna =
      clientComunas[Math.floor(Math.random() * clientComunas.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const cliente = await prisma.cliente.create({
      data: {
        nombre: `${companyName} ${industry}`,
        razonSocial: `${companyName} ${industry} S.A.`,
        rut: generateChileanRUT(),
        contacto: `${firstName} ${lastName}`,
        email: generateEmail(companyName, 'cliente.cl'),
        telefono: generatePhoneNumber(),
        direccion: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]}`,
        comunaId: randomComuna.id,
        activo: true,
        esPersona: false,
        tipoEntidad: TipoEntidad.CLIENTE,
        tenantId: adminTenant.id,
      },
    });
    createdClientes.push(cliente);
    console.log(`  ✅ Client ${i}: ${cliente.nombre}`);
  }

  // ========== CREATE CARRIERS (15 carriers) ==========
  console.log('🚛 Creating 15 carriers...');

  const createdCarriers: Awaited<ReturnType<typeof prisma.carrier.create>>[] =
    [];
  const carrierComunas = allComunas.filter((c) =>
    [
      'Santiago',
      'Estación Central',
      'Quilicura',
      'Puente Alto',
      'Maipú',
      'San Bernardo',
      'La Florida',
    ].includes(c.nombre),
  );

  for (let i = 1; i <= 15; i++) {
    const companyName = `Transportes ${companyNames[Math.floor(Math.random() * companyNames.length)]}`;
    const randomComuna =
      carrierComunas[Math.floor(Math.random() * carrierComunas.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const carrier = await prisma.carrier.create({
      data: {
        nombre: companyName,
        razonSocial: `${companyName} S.A.`,
        rut: generateChileanRUT(),
        contacto: `${firstName} ${lastName}`,
        email: generateEmail(companyName, 'transporte.cl'),
        telefono: generatePhoneNumber(),
        direccion: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]}`,
        comunaId: randomComuna.id,
        activo: true,
        esPersona: false,
        tipoEntidad: TipoEntidad.CARRIER,
        tenantId: adminTenant.id,
      },
    });
    createdCarriers.push(carrier);
    console.log(`  ✅ Carrier ${i}: ${carrier.nombre}`);
  }

  // ========== CREATE EMBARCADORES (15 embarcadores) ==========
  console.log('📦 Creating 15 embarcadores...');

  const createdEmbarcadores: Awaited<
    ReturnType<typeof prisma.embarcador.create>
  >[] = [];
  const embarcadorComunas = allComunas.filter((c) =>
    [
      'Santiago',
      'Providencia',
      'Las Condes',
      'Vitacura',
      'Ñuñoa',
      'La Reina',
      'Lo Barnechea',
    ].includes(c.nombre),
  );

  for (let i = 1; i <= 15; i++) {
    const companyName = `Embarcadores ${companyNames[Math.floor(Math.random() * companyNames.length)]}`;
    const industry =
      industrySectors[Math.floor(Math.random() * industrySectors.length)];
    const randomComuna =
      embarcadorComunas[Math.floor(Math.random() * embarcadorComunas.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const embarcador = await prisma.embarcador.create({
      data: {
        nombre: `${companyName} ${industry}`,
        razonSocial: `${companyName} ${industry} Limitada`,
        rut: generateChileanRUT(),
        contacto: `${firstName} ${lastName}`,
        email: generateEmail(companyName, 'embarque.cl'),
        telefono: generatePhoneNumber(),
        direccion: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]}`,
        comunaId: randomComuna.id,
        activo: true,
        esPersona: false,
        tipoEntidad: TipoEntidad.EMBARCADOR,
        tenantId: adminTenant.id,
      },
    });
    createdEmbarcadores.push(embarcador);
    console.log(`  ✅ Embarcador ${i}: ${embarcador.nombre}`);
  }

  // ========== CREATE CONTACTOS (20 contacts) ==========
  console.log('📇 Creating 20 contacts...');

  const createdContactos: any[] = [];
  for (let i = 1; i <= 20; i++) {
    // Use existing entidades (you already created 50)
    const entity =
      createdEntidades[Math.floor(Math.random() * createdEntidades.length)];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];

    const contacto = await prisma.contacto.create({
      data: {
        nombre: `${firstName} ${lastName}`,
        cargo: jobTitle,
        contacto: `${firstName} ${lastName}`,
        direccion:
          entity.direccion ||
          `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetNumbers[Math.floor(Math.random() * streetNumbers.length)]}`,
        email: generateEmail(
          `${firstName}.${lastName}`,
          entity.email?.split('@')[1] || 'demo.cl',
        ),
        telefono: generatePhoneNumber(),
        rut: generateChileanRUT(),
        activo: true,
        esPersonaNatural: true,
        entidadId: entity.id,
        tenantId: adminTenant.id,
        comunaId: entity.comunaId,
      },
    });
    createdContactos.push(contacto);
    console.log(`  ✅ Contact ${i}: ${contacto.nombre} - ${contacto.cargo}`);
  }

  // ========== CREATE EQUIPMENT (for carriers) ==========
  console.log('🚚 Creating equipment for carriers...');

  const createdEquipos: any[] = [];
  const vehiclePlates = [
    'AB123CD',
    'EF456GH',
    'IJ789KL',
    'MN012OP',
    'QR345ST',
    'UV678WX',
    'YZ901AB',
    'CD234EF',
    'GH567IJ',
    'KL890MN',
  ];

  for (let i = 0; i < 10; i++) {
    const carrier =
      createdCarriers[Math.floor(Math.random() * createdCarriers.length)];
    const modelo =
      createdModelos[Math.floor(Math.random() * createdModelos.length)];

    const equipo = await prisma.equipo.create({
      data: {
        nombre: `Vehículo ${i + 1} - ${modelo.nombre}`,
        patente: vehiclePlates[i] || `XX${1000 + i}YY`,
        carrierId: carrier.id,
        modeloTransporteId: modelo.id,
        tipoEquipoId: modelo.tipoEquipoId,
        gpsActivo: Math.random() > 0.3,
        observaciones: `Equipo asignado a ${carrier.nombre}`,
        activo: true,
        tenantId: adminTenant.id,
        vin: `VIN${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(10, '0')}`,
      },
    });
    createdEquipos.push(equipo);
  }

  console.log(`✅ Created ${createdEquipos.length} equipment units`);

  // ========== CREATE CHOFERES (drivers) ==========
  console.log('👨‍✈️ Creating drivers...');

  const createdChoferes: any[] = [];
  const driverLicenses = ['A1', 'A2', 'A3', 'A4', 'B', 'C', 'D', 'E'];

  for (let i = 1; i <= 15; i++) {
    const entity =
      createdEntidades[Math.floor(Math.random() * createdEntidades.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const chofer = await prisma.chofer.create({
      data: {
        nombre: `${firstName} ${lastName}`,
        rut: generateChileanRUT(),
        contacto: `${firstName} ${lastName}`,
        email: generateEmail(`${firstName}.${lastName}`, 'conductor.cl'),
        telefono: generatePhoneNumber(),
        entidadId: entity.id,
        estado: Math.random() > 0.1 ? 'ACTIVO' : 'SUSPENDIDO',
        licenciaTipo:
          driverLicenses[Math.floor(Math.random() * driverLicenses.length)],
        licenciaVencimiento: new Date(
          Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
        ),
        patenteAsignada:
          Math.random() > 0.5
            ? createdEquipos[Math.floor(Math.random() * createdEquipos.length)]
                ?.patente
            : null,
        activo: true,
        tenantId: adminTenant.id,
      },
    });
    createdChoferes.push(chofer);
  }

  console.log(`✅ Created ${createdChoferes.length} drivers`);

  // ========== CREATE ADDRESSES ==========
  console.log('📍 Creating addresses...');

  const createdDirecciones: any[] = [];

  for (let i = 1; i <= 30; i++) {
    const cliente =
      createdClientes[Math.floor(Math.random() * createdClientes.length)];
    const comuna = allComunas[Math.floor(Math.random() * allComunas.length)];
    const street = streetNames[Math.floor(Math.random() * streetNames.length)];
    const number =
      streetNumbers[Math.floor(Math.random() * streetNumbers.length)];

    // Handle null nombre - use a default value
    const clienteNombre = cliente.nombre || `Cliente ${cliente.rut}`;

    const direccion = await prisma.direccion.create({
      data: {
        nombre: `Dirección ${i} - ${clienteNombre.substring(0, 20)}`,
        direccionTexto: `${street} ${number}, ${comuna.nombre}`,
        calle: street,
        numero: number,
        comunaId: comuna.id,
        contacto: cliente.contacto,
        email: cliente.email,
        telefono: cliente.telefono,
        frecuencia: Math.floor(Math.random() * 10) + 1,
        latitud: -33.4 + Math.random() * 1.5,
        longitud: -70.6 + Math.random() * 1.5,
        origen: 'MANUAL',
        esPrincipal: Math.random() > 0.7,
        referencia:
          Math.random() > 0.5
            ? `Referencia ${i}: ${['Cerca del metro', 'Frente al supermercado', 'Al lado del banco', 'Entre calles'][Math.floor(Math.random() * 4)]}`
            : null,
        ultimaVezUsada:
          Math.random() > 0.5
            ? new Date(
                Date.now() -
                  Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
              )
            : null,
        activo: true,
        tenantId: adminTenant.id,
      },
    });
    createdDirecciones.push(direccion);
  }

  console.log(`✅ Created ${createdDirecciones.length} addresses`);

  // ========== CREATE ORDERS ==========
  console.log('📝 Creating sample orders...');

  const createdOrdenes: any[] = [];
  const orderStatuses: OrdenEstado[] = [
    'PENDIENTE',
    'PLANIFICADA',
    'EN_TRANSPORTE',
    'ENTREGADA',
    'CANCELADA',
  ];
  const tarifaTypes: TipoTarifa[] = ['PESO_VOLUMEN', 'EQUIPO'];

  for (let i = 1; i <= 25; i++) {
    const cliente =
      createdClientes[Math.floor(Math.random() * createdClientes.length)];
    const remitente =
      createdEntidades[Math.floor(Math.random() * createdEntidades.length)];
    const destinatario =
      createdEntidades[Math.floor(Math.random() * createdEntidades.length)];
    const direccionOrigen =
      createdDirecciones[Math.floor(Math.random() * createdDirecciones.length)];
    const direccionDestino =
      createdDirecciones[Math.floor(Math.random() * createdDirecciones.length)];
    const tipoCarga =
      createdTipoCargas[Math.floor(Math.random() * createdTipoCargas.length)];
    const tipoServicio = [
      tipoServicioExpress,
      tipoServicioEstandar,
      tipoServicioEconomico,
    ][Math.floor(Math.random() * 3)];
    const equipo =
      Math.random() > 0.3
        ? createdEquipos[Math.floor(Math.random() * createdEquipos.length)]
        : null;

    const orden = await prisma.orden.create({
      data: {
        codigo: `ORD-${2024}-${String(i).padStart(5, '0')}`,
        numeroOt: `OT-${Date.now()}-${i}`,
        fecha: new Date(
          Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
        ),
        fechaEntregaEstimada: new Date(
          Date.now() + Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000),
        ),
        estado: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        tipoTarifa: tarifaTypes[Math.floor(Math.random() * tarifaTypes.length)],
        clienteId: cliente.id,
        remitenteId: remitente.id,
        destinatarioId: destinatario.id,
        direccionOrigenId: direccionOrigen.id,
        direccionDestinoId: direccionDestino.id,
        tipoCargaId: tipoCarga.id,
        tipoServicioId: tipoServicio.id,
        equipoId: equipo?.id,
        pesoTotalKg: Math.floor(Math.random() * 10000) + 100,
        volumenTotalM3: Math.floor(Math.random() * 50) + 1,
        altoCm: Math.floor(Math.random() * 200) + 50,
        largoCm: Math.floor(Math.random() * 300) + 100,
        anchoCm: Math.floor(Math.random() * 200) + 50,
        observaciones: `Orden ${i}: ${['Urgente', 'Fragil', 'Documentación adjunta', 'Requiere manejo especial', 'Entrega en horario comercial'][Math.floor(Math.random() * 5)]}`,
        tenantId: adminTenant.id,
      },
    });
    createdOrdenes.push(orden);
  }

  console.log(`✅ Created ${createdOrdenes.length} orders`);

  // ========== CREATE HUBS ==========
  console.log('🏭 Creating logistics hubs...');

  const createdHubs: any[] = [];
  const hubNames = [
    'Hub Central Santiago',
    'Hub Norte',
    'Hub Sur',
    'Hub Puerto',
    'Hub Aeropuerto',
    'Hub Industrial',
    'Hub Distribución',
  ];
  const hubComunas = allComunas.filter((c) =>
    [
      'Santiago',
      'Estación Central',
      'Quilicura',
      'Puente Alto',
      'Maipú',
      'San Bernardo',
      'Talcahuano',
      'Concepción',
      'Valparaíso',
      'Viña del Mar',
    ].includes(c.nombre),
  );

  for (let i = 0; i < 7; i++) {
    const comuna = hubComunas[i % hubComunas.length];
    const entidad =
      createdEntidades[Math.floor(Math.random() * createdEntidades.length)];

    const hub = await prisma.hub.create({
      data: {
        codigo: `HUB-${String.fromCharCode(65 + i)}`,
        nombre: hubNames[i] || `Hub ${i + 1}`,
        direccion: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${Math.floor(Math.random() * 1000) + 1}, ${comuna.nombre}`,
        comunaId: comuna.id,
        entidadId: entidad.id,
        latitud: -33.4 + Math.random() * 1.5,
        longitud: -70.6 + Math.random() * 1.5,
        activo: true,
        visible: true,
        orden: i + 1,
        tenantId: adminTenant.id,
      },
    });
    createdHubs.push(hub);
    console.log(`  ✅ Hub ${i + 1}: ${hub.nombre}`);
  }

  // ========== CREATE ZONAS ==========
  console.log('🗺️ Creating zones...');

  const createdZonas: any[] = [];
  const zoneTypes: TipoZona[] = ['URBANA', 'RURAL', 'INDUSTRIAL', 'HUB'];

  for (let i = 1; i <= 8; i++) {
    const comunaIds = allComunas
      .slice(i * 10, i * 10 + 5)
      .map((c) => c.id)
      .filter((id) => id);

    const zona = await prisma.zona.create({
      data: {
        codigo: `ZONA-${String(i).padStart(3, '0')}`,
        nombre: `Zona ${i} - ${zoneTypes[i % 4]}`,
        tipoZona: zoneTypes[i % 4],
        comunasIds: comunaIds,
        esOrigen: Math.random() > 0.3,
        esDestino: Math.random() > 0.3,
        observaciones: `Zona para ${zoneTypes[i % 4].toLowerCase()}`,
        activo: true,
        visible: true,
        orden: i,
        tenantId: adminTenant.id,
      },
    });
    createdZonas.push(zona);
  }

  console.log(`✅ Created ${createdZonas.length} zones`);

  // ========== CREATE COBERTURAS (coverage) ==========
  console.log('📊 Creating coverage plans...');

  const createdCoberturas: any[] = [];

  for (let i = 0; i < 15; i++) {
    const entidad =
      createdEntidades[Math.floor(Math.random() * createdEntidades.length)];
    const zona = createdZonas[Math.floor(Math.random() * createdZonas.length)];
    const tipoServicio = [
      tipoServicioExpress,
      tipoServicioEstandar,
      tipoServicioEconomico,
    ][Math.floor(Math.random() * 3)];

    // Handle null nombre - use a default value
    const entidadNombre = entidad.nombre || `Entidad ${entidad.rut}`;

    const cobertura = await prisma.cobertura.create({
      data: {
        entidadId: entidad.id,
        zonaId: zona.id,
        tipoServicioId: tipoServicio.id,
        valor: Math.floor(Math.random() * 100000) + 5000,
        vigencia: new Date(
          Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
        ),
        excluyente: Math.random() > 0.7,
        comentario: `Cobertura ${i + 1} para ${entidadNombre.substring(0, 20)}`,
        activo: true,
        tenantId: adminTenant.id,
      },
    });
    createdCoberturas.push(cobertura);
  }

  console.log(`✅ Created ${createdCoberturas.length} coverage plans`);

  console.log('🎉 Database seeded successfully!');
  console.log('================================');
  console.log('📊 SEED SUMMARY:');
  console.log(`🌎 ${allComunas.length} communes created`);
  console.log(`👥 ${createdClientes.length} clients created`);
  console.log(`🚛 ${createdCarriers.length} carriers created`);
  console.log(`📦 ${createdEmbarcadores.length} embarcadores created`);
  console.log(`📇 ${createdContactos.length} contacts created`);
  console.log(`🚚 ${createdEquipos.length} equipment units created`);
  console.log(`👨‍✈️ ${createdChoferes.length} drivers created`);
  console.log(`📍 ${createdDirecciones.length} addresses created`);
  console.log(`📝 ${createdOrdenes.length} orders created`);
  console.log(`🏭 ${createdHubs.length} logistics hubs created`);
  console.log(`🗺️ ${createdZonas.length} zones created`);
  console.log(`📊 ${createdCoberturas.length} coverage plans created`);
  console.log('');
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
