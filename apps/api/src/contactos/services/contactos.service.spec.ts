import { Test, TestingModule } from '@nestjs/testing';
import { ContactosService } from './contactos.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TipoEntidad } from '@prisma/client';
import { ContactoResponseDto } from '../dto/contacto-response.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { UpdateContactoDto } from '../dto/update-contacto.dto';

describe('ContactosService', () => {
  let contactosService: ContactosService;
  let prismaService: PrismaService;

  // Mock Prisma Service
  const mockPrismaService = {
    contacto: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    entidad: {
      create: jest.fn(),
      update: jest.fn(),
    },
    comuna: {
      findUnique: jest.fn(),
    },
    retiro: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    contactosService = module.get<ContactosService>(ContactosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(contactosService).toBeDefined();
    });
  });

  describe('findAll', () => {
    const mockContactos = [
      {
        id: 'contacto-1',
        nombre: 'Contact One',
        rut: '12345678-9',
        email: 'contact1@example.com',
        telefono: '+56912345678',
        direccion: 'Address 1',
        cargo: 'Manager',
        contacto: 'Contact Info 1',
        esPersonaNatural: true,
        activo: true,
        entidadId: 'entidad-1',
        comunaId: 'comuna-1',
        tenantId: 'tenant-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        entidad: {
          id: 'entidad-1',
          nombre: 'Contact One',
          rut: '12345678-9',
          tipoEntidad: TipoEntidad.PERSONA,
        },
        comuna: {
          id: 'comuna-1',
          nombre: 'Comuna One',
          provincia: {
            id: 'provincia-1',
            nombre: 'Province One',
            region: { id: 'region-1', nombre: 'Region One' },
          },
        },
      },
      {
        id: 'contacto-2',
        nombre: 'Contact Two',
        rut: '98765432-1',
        email: 'contact2@example.com',
        telefono: '+56987654321',
        direccion: 'Address 2',
        cargo: 'Director',
        contacto: 'Contact Info 2',
        esPersonaNatural: false,
        activo: false,
        entidadId: 'entidad-2',
        comunaId: 'comuna-2',
        tenantId: 'tenant-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        entidad: {
          id: 'entidad-2',
          nombre: 'Contact Two',
          rut: '98765432-1',
          tipoEntidad: TipoEntidad.PERSONA,
        },
        comuna: {
          id: 'comuna-2',
          nombre: 'Comuna Two',
          provincia: {
            id: 'provincia-2',
            nombre: 'Province Two',
            region: { id: 'region-2', nombre: 'Region Two' },
          },
        },
      },
    ];

    beforeEach(() => {
      mockPrismaService.$transaction.mockResolvedValue([mockContactos, 2]);
    });

    it('should return contactos with pagination', async () => {
      const filter = { page: 1, limit: 10 };
      const tenantId = 'tenant-123';

      const result = await contactosService.findAll(filter, tenantId);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
        }),
      );
      expect(result.contactos).toHaveLength(2);
      expect(result.contactos[0]).toBeInstanceOf(ContactoResponseDto);
      expect(result.total).toBe(2);
    });

    it('should filter by search term', async () => {
      const filter = { search: 'Manager' };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId,
            OR: [
              { nombre: { contains: 'Manager', mode: 'insensitive' } },
              { rut: { contains: 'Manager', mode: 'insensitive' } },
              { email: { contains: 'Manager', mode: 'insensitive' } },
              { cargo: { contains: 'Manager', mode: 'insensitive' } },
              { contacto: { contains: 'Manager', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should filter by active status', async () => {
      const filter = { activo: true };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, activo: true },
        }),
      );
    });

    it('should filter by esPersonaNatural status', async () => {
      const filter = { esPersonaNatural: false };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, esPersonaNatural: false },
        }),
      );
    });

    it('should filter by entidadId', async () => {
      const filter = { entidadId: 'entidad-1' };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, entidadId: 'entidad-1' },
        }),
      );
    });

    it('should handle string page and limit parameters', async () => {
      const filter = { page: 2, limit: 5 };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5,
        }),
      );
    });

    it('should cap limit at 100', async () => {
      const filter = { limit: 150 };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100, // Capped at 100
        }),
      );
    });

    it('should ensure page is at least 1', async () => {
      const filter = { page: 0 };
      const tenantId = 'tenant-123';

      await contactosService.findAll(filter, tenantId);

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // (1-1) * 10 = 0 (page corrected to 1)
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockContacto = {
      id: 'contacto-123',
      nombre: 'Test Contact',
      rut: '12345678-9',
      email: 'test@example.com',
      telefono: '+56912345678',
      direccion: 'Test Address',
      cargo: 'Test Cargo',
      contacto: 'Test Contact Info',
      esPersonaNatural: true,
      activo: true,
      entidadId: 'entidad-123',
      comunaId: 'comuna-123',
      tenantId: 'tenant-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      entidad: {
        id: 'entidad-123',
        nombre: 'Test Contact',
        rut: '12345678-9',
        tipoEntidad: TipoEntidad.PERSONA,
      },
      comuna: {
        id: 'comuna-123',
        nombre: 'Test Comuna',
        provincia: {
          id: 'provincia-123',
          nombre: 'Test Province',
          region: { id: 'region-123', nombre: 'Test Region' },
        },
      },
    };

    beforeEach(() => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(mockContacto);
    });

    it('should return contacto when found', async () => {
      const result = await contactosService.findOne(
        'contacto-123',
        'tenant-123',
      );

      expect(prismaService.contacto.findFirst).toHaveBeenCalledWith({
        where: { id: 'contacto-123', tenantId: 'tenant-123' },
        include: contactosService['contactoInclude'],
      });
      expect(result).toBeInstanceOf(ContactoResponseDto);
      expect(result.id).toBe('contacto-123');
      expect(result.nombre).toBe('Test Contact');
      expect(result.rut).toBe('12345678-9');
      expect(result.entidad?.id).toBe('entidad-123');
      expect(result.comuna?.nombre).toBe('Test Comuna');
    });

    it('should throw NotFoundException when contacto not found', async () => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(null);

      await expect(
        contactosService.findOne('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createContactoDto = {
      rut: '11111111-1',
      nombre: 'New Contact',
      email: 'new@example.com',
      telefono: '+56911111111',
      direccion: 'New Address',
      cargo: 'New Cargo',
      contacto: 'New Contact Info',
      esPersonaNatural: true,
      comunaId: 'comuna-1',
    };

    const mockComuna = {
      id: 'comuna-1',
      nombre: 'Test Comuna',
    };

    const mockEntidad = {
      id: 'entidad-123',
      nombre: 'New Contact',
      rut: '11111111-1',
      tipoEntidad: TipoEntidad.PERSONA,
    };

    const mockCreatedContacto = {
      id: 'new-contact-123',
      ...createContactoDto,
      activo: true,
      entidadId: 'entidad-123',
      tenantId: 'tenant-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      entidad: mockEntidad,
      comuna: {
        id: 'comuna-1',
        nombre: 'Test Comuna',
        provincia: {
          id: 'provincia-1',
          nombre: 'Test Province',
          region: { id: 'region-1', nombre: 'Test Region' },
        },
      },
    };

    beforeEach(() => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(null);
      mockPrismaService.comuna.findUnique.mockResolvedValue(mockComuna);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
    });

    it('should create contacto successfully with entidad', async () => {
      mockPrismaService.entidad.create.mockResolvedValue(mockEntidad);
      mockPrismaService.contacto.create.mockResolvedValue(mockCreatedContacto);

      const result = await contactosService.create(
        createContactoDto,
        'tenant-123',
      );

      expect(prismaService.contacto.findFirst).toHaveBeenCalledWith({
        where: { rut: '11111111-1', tenantId: 'tenant-123' },
      });
      expect(prismaService.comuna.findUnique).toHaveBeenCalledWith({
        where: { id: 'comuna-1' },
      });
      expect(prismaService.entidad.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'New Contact',
            rut: '11111111-1',
            tipoEntidad: TipoEntidad.PERSONA,
            contacto: 'New Contact Info',
            esPersona: true,
            activo: true,
            tenantId: 'tenant-123',
          }),
        }),
      );
      expect(prismaService.contacto.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ContactoResponseDto);
      expect(result.nombre).toBe('New Contact');
      expect(result.entidadId).toBe('entidad-123');
    });

    it('should handle optional fields with null values', async () => {
      const dtoWithoutOptionals: CreateContactoDto = {
        rut: '22222222-2',
        nombre: 'Contact No Optionals',
        contacto: 'Contact Info',
        comunaId: 'comuna-1',
      };

      mockPrismaService.contacto.create.mockResolvedValue({
        ...mockCreatedContacto,
        email: null,
        telefono: null,
        direccion: null,
        cargo: null,
      });

      await contactosService.create(dtoWithoutOptionals, 'tenant-123');

      expect(prismaService.contacto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: null,
            telefono: null,
            direccion: null,
            cargo: null,
            esPersonaNatural: true, // Default value
          }),
        }),
      );
    });

    /*     expect(prismaService.entidad.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: '', // Should be empty string in entidad table
          telefono: '', // Should be empty string in entidad table
          direccion: '',
          comunaId: 'comuna-1',
        }),
      }),
    ); */

    it('should throw ConflictException when RUT already exists', async () => {
      mockPrismaService.contacto.findFirst.mockResolvedValue({
        id: 'existing-contact',
        rut: '11111111-1',
      });

      await expect(
        contactosService.create(createContactoDto, 'tenant-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when comunaId is invalid', async () => {
      mockPrismaService.comuna.findUnique.mockResolvedValue(null);

      await expect(
        contactosService.create(createContactoDto, 'tenant-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const existingContacto = {
      id: 'contacto-123',
      nombre: 'Old Name',
      rut: '12345678-9',
      email: 'old@example.com',
      telefono: '+56911111111',
      direccion: 'Old Address',
      cargo: 'Old Cargo',
      contacto: 'Old Contact Info',
      esPersonaNatural: true,
      activo: true,
      entidadId: 'entidad-123',
      comunaId: 'comuna-1',
      tenantId: 'tenant-123',
      entidad: { id: 'entidad-123' },
    };

    const updateContactoDto = {
      nombre: 'Updated Name',
      email: 'updated@example.com',
      cargo: 'Updated Cargo',
    };

    const mockUpdatedContacto = {
      ...existingContacto,
      ...updateContactoDto,
      updatedAt: new Date('2024-01-03'),
      entidad: {
        id: 'entidad-123',
        nombre: 'Updated Name',
        rut: '12345678-9',
        tipoEntidad: TipoEntidad.PERSONA,
      },
      comuna: {
        id: 'comuna-1',
        nombre: 'Test Comuna',
        provincia: {
          id: 'provincia-1',
          nombre: 'Test Province',
          region: { id: 'region-1', nombre: 'Test Region' },
        },
      },
    };

    const mockComuna = {
      id: 'comuna-1',
      nombre: 'Test Comuna',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.contacto.findFirst.mockResolvedValue(existingContacto);
      mockPrismaService.comuna.findUnique.mockResolvedValue(mockComuna);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
    });

    it('should update contacto successfully', async () => {
      mockPrismaService.contacto.update.mockResolvedValue(mockUpdatedContacto);

      const result = await contactosService.update(
        'contacto-123',
        updateContactoDto,
        'tenant-123',
      );

      expect(prismaService.contacto.findFirst).toHaveBeenCalledWith({
        where: { id: 'contacto-123', tenantId: 'tenant-123' },
        include: { entidad: true },
      });
      expect(prismaService.contacto.update).toHaveBeenCalled();
      expect(prismaService.entidad.update).toHaveBeenCalledWith({
        where: { id: 'entidad-123' },
        data: expect.objectContaining({
          nombre: 'Updated Name',
          email: 'updated@example.com',
        }),
      });
      expect(result).toBeInstanceOf(ContactoResponseDto);
      expect(result.nombre).toBe('Updated Name');
    });

    it('should throw NotFoundException when contacto not found', async () => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(null);

      await expect(
        contactosService.update(
          'non-existent',
          updateContactoDto,
          'tenant-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to duplicate RUT', async () => {
      const dtoWithNewRut = { rut: '99999999-9' };
      mockPrismaService.contacto.findFirst
        .mockResolvedValueOnce(existingContacto) // First call for contacto lookup
        .mockResolvedValueOnce({
          // Second call for RUT check
          id: 'other-contact',
          rut: '99999999-9',
        });

      await expect(
        contactosService.update('contacto-123', dtoWithNewRut, 'tenant-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should not check RUT uniqueness when RUT is not changed', async () => {
      const dtoWithSameRut = { rut: '12345678-9', nombre: 'Updated' };
      mockPrismaService.contacto.update.mockResolvedValue(mockUpdatedContacto);

      await contactosService.update(
        'contacto-123',
        dtoWithSameRut,
        'tenant-123',
      );

      // Should only be called once (for the contacto lookup)
      expect(prismaService.contacto.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when comunaId is invalid', async () => {
      const dtoWithComuna = { comunaId: 'invalid-comuna' };
      mockPrismaService.comuna.findUnique.mockResolvedValue(null);

      await expect(
        contactosService.update('contacto-123', dtoWithComuna, 'tenant-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update contacto field in entidad when provided', async () => {
      const dtoWithContacto = { contacto: 'Updated Contact Info' };
      mockPrismaService.contacto.update.mockResolvedValue(mockUpdatedContacto);

      await contactosService.update(
        'contacto-123',
        dtoWithContacto,
        'tenant-123',
      );

      expect(prismaService.entidad.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contacto: 'Updated Contact Info',
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    const existingContacto = {
      id: 'contacto-123',
      entidadId: 'entidad-123',
      tenantId: 'tenant-123',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.contacto.findFirst.mockResolvedValue(existingContacto);
      mockPrismaService.retiro.count.mockResolvedValue(0); // No retiros associated
    });

    it('should deactivate contacto and entidad when no retiros associated', async () => {
      mockPrismaService.$transaction.mockResolvedValue([null, null]);

      const result = await contactosService.remove(
        'contacto-123',
        'tenant-123',
      );

      expect(prismaService.contacto.findFirst).toHaveBeenCalledWith({
        where: { id: 'contacto-123', tenantId: 'tenant-123' },
        select: { id: true, entidadId: true },
      });
      expect(prismaService.retiro.count).toHaveBeenCalledWith({
        where: { contactoRetiroId: 'contacto-123' },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Contacto desactivado exitosamente' });
    });

    it('should throw NotFoundException when contacto not found', async () => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(null);

      await expect(
        contactosService.remove('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when contacto has associated retiros', async () => {
      mockPrismaService.retiro.count.mockResolvedValue(2); // Has retiros

      await expect(
        contactosService.remove('contacto-123', 'tenant-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include proper error message for retiro constraint', async () => {
      mockPrismaService.retiro.count.mockResolvedValue(1);

      await expect(
        contactosService.remove('contacto-123', 'tenant-123'),
      ).rejects.toThrow(
        'No se puede desactivar el contacto dado que se encuentra asociado a un retiro. Debe actualizar el retiro primero.',
      );
    });
  });

  describe('findByRut', () => {
    const mockContacto = {
      id: 'contacto-123',
      nombre: 'Test Contact',
      rut: '12345678-9',
      email: 'test@example.com',
      telefono: '+56912345678',
      direccion: 'Test Address',
      cargo: 'Test Cargo',
      contacto: 'Test Contact Info',
      esPersonaNatural: true,
      activo: true,
      entidadId: 'entidad-123',
      comunaId: 'comuna-123',
      tenantId: 'tenant-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      entidad: {
        id: 'entidad-123',
        nombre: 'Test Contact',
        rut: '12345678-9',
        tipoEntidad: TipoEntidad.PERSONA,
      },
      comuna: {
        id: 'comuna-123',
        nombre: 'Test Comuna',
        provincia: {
          id: 'provincia-123',
          nombre: 'Test Province',
          region: { id: 'region-123', nombre: 'Test Region' },
        },
      },
    };

    beforeEach(() => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(mockContacto);
    });

    it('should return contacto when found by RUT', async () => {
      const result = await contactosService.findByRut(
        '12345678-9',
        'tenant-123',
      );

      expect(prismaService.contacto.findFirst).toHaveBeenCalledWith({
        where: { rut: '12345678-9', tenantId: 'tenant-123' },
        include: contactosService['contactoInclude'],
      });
      expect(result).toBeInstanceOf(ContactoResponseDto);
      expect(result?.rut).toBe('12345678-9');
    });

    it('should return null when contacto not found by RUT', async () => {
      mockPrismaService.contacto.findFirst.mockResolvedValue(null);

      const result = await contactosService.findByRut(
        'non-existent',
        'tenant-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('findByEntidad', () => {
    const mockContactos = [
      {
        id: 'contacto-1',
        nombre: 'Contact One',
        rut: '11111111-1',
        email: 'contact1@example.com',
        activo: true,
        entidadId: 'entidad-123',
        tenantId: 'tenant-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        entidad: { id: 'entidad-123', nombre: 'Entidad' },
        comuna: null,
      },
      {
        id: 'contacto-2',
        nombre: 'Contact Two',
        rut: '22222222-2',
        email: 'contact2@example.com',
        activo: true,
        entidadId: 'entidad-123',
        tenantId: 'tenant-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        entidad: { id: 'entidad-123', nombre: 'Entidad' },
        comuna: null,
      },
    ];

    beforeEach(() => {
      mockPrismaService.contacto.findMany.mockResolvedValue(mockContactos);
    });

    it('should return contactos for given entidad', async () => {
      const result = await contactosService.findByEntidad(
        'entidad-123',
        'tenant-123',
      );

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith({
        where: {
          entidadId: 'entidad-123',
          tenantId: 'tenant-123',
          activo: true,
        },
        include: contactosService['contactoInclude'],
        orderBy: { nombre: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ContactoResponseDto);
      expect(result[0].entidadId).toBe('entidad-123');
      expect(result[1].entidadId).toBe('entidad-123');
    });

    it('should only return active contactos', async () => {
      await contactosService.findByEntidad('entidad-123', 'tenant-123');

      expect(prismaService.contacto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            activo: true,
          }),
        }),
      );
    });

    it('should return empty array when no contactos found', async () => {
      mockPrismaService.contacto.findMany.mockResolvedValue([]);

      const result = await contactosService.findByEntidad(
        'entidad-123',
        'tenant-123',
      );

      expect(result).toEqual([]);
    });
  });

  describe('private methods', () => {
    describe('buildWhereClause', () => {
      it('should build where clause with search term', () => {
        const filter = { search: 'test' };
        const tenantId = 'tenant-123';

        const where = contactosService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          OR: [
            { nombre: { contains: 'test', mode: 'insensitive' } },
            { rut: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
            { cargo: { contains: 'test', mode: 'insensitive' } },
            { contacto: { contains: 'test', mode: 'insensitive' } },
          ],
        });
      });

      it('should build where clause with activo filter', () => {
        const filter = { activo: true };
        const tenantId = 'tenant-123';

        const where = contactosService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          activo: true,
        });
      });

      it('should build where clause with esPersonaNatural filter', () => {
        const filter = { esPersonaNatural: false };
        const tenantId = 'tenant-123';

        const where = contactosService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          esPersonaNatural: false,
        });
      });

      it('should build where clause with entidadId filter', () => {
        const filter = { entidadId: 'entidad-123' };
        const tenantId = 'tenant-123';

        const where = contactosService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          entidadId: 'entidad-123',
        });
      });

      it('should build where clause with multiple filters', () => {
        const filter = {
          search: 'test',
          activo: true,
          esPersonaNatural: false,
          entidadId: 'entidad-123',
        };
        const tenantId = 'tenant-123';

        const where = contactosService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          OR: [
            { nombre: { contains: 'test', mode: 'insensitive' } },
            { rut: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
            { cargo: { contains: 'test', mode: 'insensitive' } },
            { contacto: { contains: 'test', mode: 'insensitive' } },
          ],
          activo: true,
          esPersonaNatural: false,
          entidadId: 'entidad-123',
        });
      });

      it('should handle boolean string conversion', () => {
        const filter = { activo: 'true' as any }; // Simulating string from query param
        const tenantId = 'tenant-123';

        const where = contactosService['buildWhereClause'](filter, tenantId);

        expect(where.activo).toBe(true); // Should be converted to boolean
      });
    });

    describe('getSyncFields', () => {
      it('should only include fields that exist in the DTO', () => {
        const dto: CreateContactoDto = {
          rut: '12345678-9',
          nombre: 'Test',
          contacto: 'Contact Info',
          comunaId: 'comuna-1',
          // email and telefono are not defined at all
        };

        const syncFields = contactosService['getSyncFields'](dto);

        // Should NOT include email and telefono since they're not in the DTO
        expect(syncFields).toEqual({
          nombre: 'Test',
          rut: '12345678-9',
          comunaId: 'comuna-1',
          // email and telefono should NOT be here
        });
      });

      it('should convert undefined values to empty string for email/telefono when they exist in DTO', () => {
        const dto: UpdateContactoDto = {
          nombre: 'Test',
          email: undefined, // Explicitly undefined
          telefono: undefined, // Explicitly undefined
        };

        const syncFields = contactosService['getSyncFields'](dto);

        expect(syncFields).toEqual({
          nombre: 'Test',
          email: '', // Should convert undefined to empty string
          telefono: '', // Should convert undefined to empty string
        });
      });

      it('should preserve explicit empty strings for entidad sync', () => {
        const dto: UpdateContactoDto = {
          nombre: 'Test',
          email: '',
          telefono: '',
        };

        const syncFields = contactosService['getSyncFields'](dto);

        expect(syncFields).toEqual({
          nombre: 'Test',
          email: '', // Empty string preserved
          telefono: '', // Empty string preserved
        });
      });
    });
  });
});
