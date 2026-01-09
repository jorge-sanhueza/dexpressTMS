import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TipoEntidad } from '@prisma/client';
import { ClientResponseDto } from '../dto/client-response.dto';
import { ClientStatsDto } from '../dto/client-stats.dto';

describe('ClientsService', () => {
  let clientsService: ClientsService;
  let prismaService: PrismaService;

  // Mock Prisma Service
  const mockPrismaService = {
    cliente: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    entidad: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    comuna: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    clientsService = module.get<ClientsService>(ClientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(clientsService).toBeDefined();
    });
  });

  describe('findAll', () => {
    const mockClients = [
      {
        id: 'client-1',
        nombre: 'Client One',
        razonSocial: null,
        rut: '12345678-9',
        contacto: 'Contact One',
        email: 'client1@example.com',
        telefono: '+56912345678',
        direccion: 'Address 1',
        comunaId: 'comuna-1',
        activo: true,
        esPersona: true,
        tipoEntidad: TipoEntidad.CLIENTE,
        tenantId: 'tenant-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        comuna: {
          id: 'comuna-1',
          nombre: 'Comuna One',
          region: { nombre: 'Region One' },
          provincia: { nombre: 'Province One' },
        },
        entidad: { id: 'entidad-1' },
      },
      {
        id: 'client-2',
        nombre: null,
        razonSocial: 'Business Two',
        rut: '98765432-1',
        contacto: 'Contact Two',
        email: 'client2@example.com',
        telefono: '+56987654321',
        direccion: 'Address 2',
        comunaId: 'comuna-2',
        activo: false,
        esPersona: false,
        tipoEntidad: TipoEntidad.CLIENTE,
        tenantId: 'tenant-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        comuna: {
          id: 'comuna-2',
          nombre: 'Comuna Two',
          region: { nombre: 'Region Two' },
          provincia: { nombre: 'Province Two' },
        },
        entidad: { id: 'entidad-2' },
      },
    ];

    beforeEach(() => {
      mockPrismaService.$transaction.mockResolvedValue([mockClients, 2]);
    });

    it('should return clients with pagination', async () => {
      const filter = { page: 1, limit: 10 };
      const tenantId = 'tenant-123';

      const result = await clientsService.findAll(filter, tenantId);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
        }),
      );
      expect(result.clients).toHaveLength(2);
      expect(result.clients[0]).toBeInstanceOf(ClientResponseDto);
      expect(result.total).toBe(2);
    });

    it('should filter by search term', async () => {
      const filter = { search: 'Client' };
      const tenantId = 'tenant-123';

      await clientsService.findAll(filter, tenantId);

      expect(prismaService.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId,
            OR: [
              { nombre: { contains: 'Client', mode: 'insensitive' } },
              { razonSocial: { contains: 'Client', mode: 'insensitive' } },
              { rut: { contains: 'Client', mode: 'insensitive' } },
              { contacto: { contains: 'Client', mode: 'insensitive' } },
              { email: { contains: 'Client', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should filter by active status', async () => {
      const filter = { activo: true };
      const tenantId = 'tenant-123';

      await clientsService.findAll(filter, tenantId);

      expect(prismaService.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, activo: true },
        }),
      );
    });

    it('should handle default pagination values', async () => {
      const filter = {};
      const tenantId = 'tenant-123';

      await clientsService.findAll(filter, tenantId);

      expect(prismaService.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should calculate correct skip for page 2', async () => {
      const filter = { page: 2, limit: 5 };
      const tenantId = 'tenant-123';

      await clientsService.findAll(filter, tenantId);

      expect(prismaService.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockClient = {
      id: 'client-123',
      nombre: 'Test Client',
      razonSocial: null,
      rut: '12345678-9',
      contacto: 'Test Contact',
      email: 'test@example.com',
      telefono: '+56912345678',
      direccion: 'Test Address',
      comunaId: 'comuna-1',
      activo: true,
      esPersona: true,
      tipoEntidad: TipoEntidad.CLIENTE,
      tenantId: 'tenant-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      comuna: {
        id: 'comuna-1',
        nombre: 'Test Comuna',
        region: { nombre: 'Test Region' },
        provincia: { nombre: 'Test Province' },
      },
      entidad: { id: 'entidad-123' },
    };

    beforeEach(() => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(mockClient);
    });

    it('should return client when found', async () => {
      const result = await clientsService.findOne('client-123', 'tenant-123');

      expect(prismaService.cliente.findFirst).toHaveBeenCalledWith({
        where: { id: 'client-123', tenantId: 'tenant-123' },
        include: clientsService['clienteInclude'],
      });
      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(result.id).toBe('client-123');
      expect(result.nombre).toBe('Test Client');
      expect(result.rut).toBe('12345678-9');
    });

    it('should throw NotFoundException when client not found', async () => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(null);

      await expect(
        clientsService.findOne('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createClientDto = {
      nombre: 'New Client',
      rut: '11111111-1',
      contacto: 'New Contact',
      email: 'new@example.com',
      telefono: '+56911111111',
      direccion: 'New Address',
      comunaId: 'comuna-1',
      esPersona: true,
    };

    const mockComuna = {
      id: 'comuna-1',
      nombre: 'Test Comuna',
    };

    const mockCreatedClient = {
      id: 'new-client-123',
      ...createClientDto,
      razonSocial: null,
      activo: true,
      tipoEntidad: TipoEntidad.CLIENTE,
      tenantId: 'tenant-123',
      entidadId: 'entidad-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      comuna: mockComuna,
      entidad: { id: 'entidad-123' },
    };

    beforeEach(() => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(null);
      mockPrismaService.comuna.findUnique.mockResolvedValue(mockComuna);
      mockPrismaService.entidad.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
    });

    it('should create client successfully with new entidad', async () => {
      mockPrismaService.entidad.create.mockResolvedValue({
        id: 'entidad-123',
      });
      mockPrismaService.cliente.create.mockResolvedValue(mockCreatedClient);

      const result = await clientsService.create(createClientDto, 'tenant-123');

      expect(prismaService.cliente.findFirst).toHaveBeenCalledWith({
        where: { rut: '11111111-1', tenantId: 'tenant-123' },
      });
      expect(prismaService.comuna.findUnique).toHaveBeenCalledWith({
        where: { id: 'comuna-1' },
      });
      expect(prismaService.entidad.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'New Client',
            rut: '11111111-1',
            tipoEntidad: TipoEntidad.CLIENTE,
            activo: true,
            tenantId: 'tenant-123',
          }),
        }),
      );
      expect(prismaService.cliente.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(result.nombre).toBe('New Client');
    });

    it('should reuse existing entidad when RUT exists', async () => {
      const existingEntidad = {
        id: 'existing-entidad',
        rut: '11111111-1',
      };

      mockPrismaService.entidad.findFirst.mockResolvedValue(existingEntidad);
      mockPrismaService.entidad.update.mockResolvedValue(existingEntidad);
      mockPrismaService.cliente.create.mockResolvedValue(mockCreatedClient);

      await clientsService.create(createClientDto, 'tenant-123');

      expect(prismaService.entidad.update).toHaveBeenCalledWith({
        where: { id: 'existing-entidad' },
        data: expect.objectContaining({
          nombre: 'New Client',
          tipoEntidad: TipoEntidad.CLIENTE,
          activo: true,
        }),
      });
      expect(prismaService.entidad.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when RUT already exists in cliente', async () => {
      mockPrismaService.cliente.findFirst.mockResolvedValue({
        id: 'existing-client',
        rut: '11111111-1',
      });

      await expect(
        clientsService.create(createClientDto, 'tenant-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when comunaId is invalid', async () => {
      mockPrismaService.comuna.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.create(createClientDto, 'tenant-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should determine nombreField correctly when esPersona is true', async () => {
      const dtoWithPerson = {
        ...createClientDto,
        esPersona: true,
        nombre: 'John',
      };
      mockPrismaService.cliente.create.mockResolvedValue(mockCreatedClient);

      await clientsService.create(dtoWithPerson, 'tenant-123');

      expect(prismaService.entidad.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'John',
          }),
        }),
      );
    });

    it('should determine nombreField correctly when esPersona is false', async () => {
      const dtoWithBusiness = {
        razonSocial: 'Business Corp',
        rut: '22222222-2',
        contacto: 'Contact',
        email: 'business@example.com',
        telefono: '+56922222222',
        direccion: 'Address',
        comunaId: 'comuna-1',
        esPersona: false,
      };
      mockPrismaService.cliente.create.mockResolvedValue({
        ...mockCreatedClient,
        razonSocial: 'Business Corp',
      });

      await clientsService.create(dtoWithBusiness, 'tenant-123');

      expect(prismaService.entidad.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Business Corp',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const existingClient = {
      id: 'client-123',
      nombre: 'Old Name',
      rut: '12345678-9',
      contacto: 'Old Contact',
      email: 'old@example.com',
      telefono: '+56911111111',
      direccion: 'Old Address',
      comunaId: 'comuna-1',
      activo: true,
      esPersona: true,
      tenantId: 'tenant-123',
      entidadId: 'entidad-123',
      entidad: { id: 'entidad-123' },
    };

    const updateClientDto = {
      nombre: 'Updated Name',
      contacto: 'Updated Contact',
      email: 'updated@example.com',
    };

    const mockUpdatedClient = {
      ...existingClient,
      ...updateClientDto,
      updatedAt: new Date('2024-01-03'),
      comuna: { id: 'comuna-1' },
      entidad: { id: 'entidad-123' },
    };

    const mockComuna = {
      id: 'comuna-1',
      nombre: 'Test Comuna',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.cliente.findFirst.mockResolvedValue(existingClient);
      mockPrismaService.comuna.findUnique.mockResolvedValue(mockComuna);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
    });

    it('should update client successfully', async () => {
      mockPrismaService.cliente.update.mockResolvedValue(mockUpdatedClient);

      const result = await clientsService.update(
        'client-123',
        updateClientDto,
        'tenant-123',
      );

      expect(prismaService.cliente.findFirst).toHaveBeenCalledWith({
        where: { id: 'client-123', tenantId: 'tenant-123' },
        include: { entidad: true },
      });
      expect(prismaService.cliente.update).toHaveBeenCalled();
      expect(prismaService.entidad.update).toHaveBeenCalledWith({
        where: { id: 'entidad-123' },
        data: expect.objectContaining({
          nombre: 'Updated Name',
          tipoEntidad: TipoEntidad.CLIENTE,
        }),
      });
      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(result.nombre).toBe('Updated Name');
    });

    it('should throw NotFoundException when client not found', async () => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(null);

      await expect(
        clientsService.update('non-existent', updateClientDto, 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to duplicate RUT', async () => {
      const dtoWithNewRut = { rut: '99999999-9' };
      mockPrismaService.cliente.findFirst.mockResolvedValue({
        ...existingClient,
        rut: '88888888-8',
      });
      mockPrismaService.cliente.findFirst.mockResolvedValueOnce(existingClient); // First call for client lookup
      mockPrismaService.cliente.findFirst.mockResolvedValueOnce({
        id: 'other-client',
        rut: '99999999-9',
      }); // Second call for RUT check

      await expect(
        clientsService.update('client-123', dtoWithNewRut, 'tenant-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when comunaId is invalid', async () => {
      const dtoWithComuna = { comunaId: 'invalid-comuna' };
      mockPrismaService.comuna.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.update('client-123', dtoWithComuna, 'tenant-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update esPersona when provided', async () => {
      const dtoWithPersonFlag = { esPersona: false };
      mockPrismaService.cliente.update.mockResolvedValue({
        ...mockUpdatedClient,
        esPersona: false,
      });

      await clientsService.update(
        'client-123',
        dtoWithPersonFlag,
        'tenant-123',
      );

      expect(prismaService.cliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            esPersona: false,
          }),
        }),
      );
    });

    it('should preserve existing esPersona when not provided', async () => {
      mockPrismaService.cliente.update.mockResolvedValue(mockUpdatedClient);

      await clientsService.update('client-123', updateClientDto, 'tenant-123');

      expect(prismaService.cliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            esPersona: true, // From existing client
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    const existingClient = {
      id: 'client-123',
      rut: '12345678-9',
      entidadId: 'entidad-123',
      tenantId: 'tenant-123',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.cliente.findFirst.mockResolvedValue(existingClient);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
    });

    it('should deactivate client and entidad successfully', async () => {
      const result = await clientsService.remove('client-123', 'tenant-123');

      expect(prismaService.cliente.findFirst).toHaveBeenCalledWith({
        where: { id: 'client-123', tenantId: 'tenant-123' },
        select: { id: true, entidadId: true, rut: true },
      });
      expect(prismaService.cliente.update).toHaveBeenCalledWith({
        where: { id: 'client-123' },
        data: { activo: false },
      });
      expect(prismaService.entidad.update).toHaveBeenCalledWith({
        where: { id: 'entidad-123' },
        data: { activo: false },
      });
      expect(result).toEqual({ message: 'Cliente desactivado exitosamente' });
    });

    it('should throw NotFoundException when client not found', async () => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(null);

      await expect(
        clientsService.remove('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle client without entidadId', async () => {
      const clientWithoutEntidad = {
        ...existingClient,
        entidadId: null,
      };
      mockPrismaService.cliente.findFirst.mockResolvedValue(
        clientWithoutEntidad,
      );

      await clientsService.remove('client-123', 'tenant-123');

      expect(prismaService.entidad.update).not.toHaveBeenCalled();
      expect(prismaService.cliente.update).toHaveBeenCalled();
    });
  });

  describe('findByRut', () => {
    const mockClient = {
      id: 'client-123',
      nombre: 'Test Client',
      rut: '12345678-9',
      contacto: 'Test Contact',
      email: 'test@example.com',
      telefono: '+56912345678',
      direccion: 'Test Address',
      comunaId: 'comuna-1',
      activo: true,
      esPersona: true,
      tipoEntidad: TipoEntidad.CLIENTE,
      tenantId: 'tenant-123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      comuna: { id: 'comuna-1' },
      entidad: { id: 'entidad-123' },
    };

    beforeEach(() => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(mockClient);
    });

    it('should return client when found by RUT', async () => {
      const result = await clientsService.findByRut('12345678-9', 'tenant-123');

      expect(prismaService.cliente.findFirst).toHaveBeenCalledWith({
        where: { rut: '12345678-9', tenantId: 'tenant-123' },
        include: clientsService['clienteInclude'],
      });
      expect(result).toBeInstanceOf(ClientResponseDto);
      expect(result?.rut).toBe('12345678-9');
    });

    it('should return null when client not found by RUT', async () => {
      mockPrismaService.cliente.findFirst.mockResolvedValue(null);

      const result = await clientsService.findByRut(
        'non-existent',
        'tenant-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    const mockStats = {
      total: 10,
      activos: 7,
      inactivos: 3,
    };

    beforeEach(() => {
      mockPrismaService.$transaction.mockResolvedValue([10, 7, 3]);
    });

    it('should return client statistics', async () => {
      const result = await clientsService.getStats('tenant-123');

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.cliente.count).toHaveBeenCalledTimes(3);
      expect(prismaService.cliente.count).toHaveBeenNthCalledWith(1, {
        where: { tenantId: 'tenant-123' },
      });
      expect(prismaService.cliente.count).toHaveBeenNthCalledWith(2, {
        where: { tenantId: 'tenant-123', activo: true },
      });
      expect(prismaService.cliente.count).toHaveBeenNthCalledWith(3, {
        where: { tenantId: 'tenant-123', activo: false },
      });

      // Now it should be an instance
      expect(result).toBeInstanceOf(ClientStatsDto);
      expect(result).toEqual(mockStats);
    });
  });

  describe('private methods', () => {
    describe('buildWhereClause', () => {
      it('should build where clause with search term', () => {
        const filter = { search: 'test' };
        const tenantId = 'tenant-123';

        const where = clientsService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          OR: [
            { nombre: { contains: 'test', mode: 'insensitive' } },
            { razonSocial: { contains: 'test', mode: 'insensitive' } },
            { rut: { contains: 'test', mode: 'insensitive' } },
            { contacto: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
          ],
        });
      });

      it('should build where clause with activo filter', () => {
        const filter = { activo: true };
        const tenantId = 'tenant-123';

        const where = clientsService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          activo: true,
        });
      });

      it('should build where clause with both search and activo', () => {
        const filter = { search: 'test', activo: false };
        const tenantId = 'tenant-123';

        const where = clientsService['buildWhereClause'](filter, tenantId);

        expect(where).toEqual({
          tenantId,
          OR: [
            { nombre: { contains: 'test', mode: 'insensitive' } },
            { razonSocial: { contains: 'test', mode: 'insensitive' } },
            { rut: { contains: 'test', mode: 'insensitive' } },
            { contacto: { contains: 'test', mode: 'insensitive' } },
            { email: { contains: 'test', mode: 'insensitive' } },
          ],
          activo: false,
        });
      });
    });

    describe('getSyncFields', () => {
      it('should extract sync fields from DTO', () => {
        const dto = {
          nombre: 'Test',
          rut: '12345678-9',
          contacto: 'Contact',
          email: 'test@example.com',
          telefono: '+56912345678',
          direccion: 'Address',
          comunaId: 'comuna-1',
          esPersona: true,
          activo: true,
          extraField: 'should be ignored',
        };

        const syncFields = clientsService['getSyncFields'](dto);

        expect(syncFields).toEqual({
          nombre: 'Test',
          rut: '12345678-9',
          contacto: 'Contact',
          email: 'test@example.com',
          telefono: '+56912345678',
          direccion: 'Address',
          comunaId: 'comuna-1',
          esPersona: true,
          activo: true,
        });
      });

      it('should handle partial DTO', () => {
        const dto = {
          nombre: 'Test',
          email: 'test@example.com',
        };

        const syncFields = clientsService['getSyncFields'](dto);

        expect(syncFields).toEqual({
          nombre: 'Test',
          email: 'test@example.com',
        });
      });
    });

    describe('determineNombreField', () => {
      it('should use nombre when esPersona is true', () => {
        const dto = { nombre: 'John', razonSocial: 'Corp', esPersona: true };

        const result = clientsService['determineNombreField'](dto);

        expect(result).toBe('John');
      });

      it('should use razonSocial when esPersona is false', () => {
        const dto = { nombre: 'John', razonSocial: 'Corp', esPersona: false };

        const result = clientsService['determineNombreField'](dto);

        expect(result).toBe('Corp');
      });

      it('should infer nombre when only nombre is provided', () => {
        const dto = { nombre: 'John' };

        const result = clientsService['determineNombreField'](dto);

        expect(result).toBe('John');
      });

      it('should infer razonSocial when only razonSocial is provided', () => {
        const dto = { razonSocial: 'Corp' };

        const result = clientsService['determineNombreField'](dto);

        expect(result).toBe('Corp');
      });

      it('should default to nombre when both are present and esPersona is undefined', () => {
        const dto = { nombre: 'John', razonSocial: 'Corp' };

        const result = clientsService['determineNombreField'](dto);

        expect(result).toBe('John');
      });
    });
  });
});
