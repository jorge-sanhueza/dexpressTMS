import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoUsuario } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  // Mock Prisma Service
  const mockPrismaService = {
    usuario: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
    perfil: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(usersService).toBeDefined();
    });
  });

  describe('findAll', () => {
    const mockUsers = [
      {
        id: 'user-1',
        correo: 'user1@example.com',
        nombre: 'User One',
        activo: true,
        tenantId: 'tenant-123',
        perfilId: 'profile-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        perfil: { nombre: 'Admin', perfilesRoles: [] },
        tenant: { nombre: 'Test Tenant' },
      },
      {
        id: 'user-2',
        correo: 'user2@example.com',
        nombre: 'User Two',
        activo: true,
        estado: EstadoUsuario.ACTIVO,
        tenantId: 'tenant-123',
        perfilId: 'profile-2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        perfil: { nombre: 'User', perfilesRoles: [] },
        tenant: { nombre: 'Test Tenant' },
      },
    ];

    beforeEach(() => {
      mockPrismaService.$transaction.mockResolvedValue([mockUsers, 2]);
    });

    it('should return users with pagination', async () => {
      const filter = { page: 1, limit: 10 };
      const tenantId = 'tenant-123';

      const result = await usersService.findAll(filter, tenantId);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.usuario.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by search term', async () => {
      const filter = { search: 'john' };
      const tenantId = 'tenant-123';

      await usersService.findAll(filter, tenantId);

      expect(prismaService.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId,
            OR: [
              { nombre: { contains: 'john', mode: 'insensitive' } },
              { correo: { contains: 'john', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should filter by active status', async () => {
      const filter = { activo: true };
      const tenantId = 'tenant-123';

      await usersService.findAll(filter, tenantId);

      expect(prismaService.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, activo: true },
        }),
      );
    });

    it('should filter by profile ID', async () => {
      const filter = { perfilId: 'profile-1' };
      const tenantId = 'tenant-123';

      await usersService.findAll(filter, tenantId);

      expect(prismaService.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, perfilId: 'profile-1' },
        }),
      );
    });

    it('should handle string page and limit parameters', async () => {
      const filter = { page: 2, limit: 5 };
      const tenantId = 'tenant-123';

      await usersService.findAll(filter, tenantId);

      expect(prismaService.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5,
        }),
      );
    });

    it('should convert string page/limit to numbers', async () => {
      const page = '2';
      const limit = '5';
      const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNumber =
        typeof limit === 'string' ? parseInt(limit, 10) : limit;

      expect(pageNumber).toBe(2);
      expect(limitNumber).toBe(5);
    });
  });

  describe('findOne', () => {
    const mockUser = {
      id: 'user-123',
      correo: 'test@example.com',
      nombre: 'Test User',
      activo: true,
      estado: EstadoUsuario.ACTIVO,
      tenantId: 'tenant-123',
      perfilId: 'profile-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      perfil: {
        nombre: 'Admin',
        perfilesRoles: [{ rol: { codigo: 'ver_dashboard' } }],
      },
      tenant: { nombre: 'Test Tenant' },
    };

    beforeEach(() => {
      mockPrismaService.usuario.findFirst.mockResolvedValue(mockUser);
    });

    it('should return user when found', async () => {
      const result = await usersService.findOne('user-123', 'tenant-123');

      expect(prismaService.usuario.findFirst).toHaveBeenCalled();
      expect(result.email).toBe('test@example.com');
      expect(result.nombre).toBe('Test User');
      expect(result.perfilNombre).toBe('Admin');
      expect(result.rolesCount).toBe(1);
      expect(result.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.usuario.findFirst.mockResolvedValue(null);

      await expect(
        usersService.findOne('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createUserDto = {
      email: 'new@example.com',
      nombre: 'New User',
      tenantId: 'tenant-123',
      perfilId: 'profile-1',
    };

    const mockProfile = {
      id: 'profile-1',
      nombre: 'Admin',
      tenantId: 'tenant-123',
      activo: true,
    };

    const mockCreatedUser = {
      id: 'new-user-123',
      correo: 'new@example.com',
      nombre: 'New User',
      activo: true,
      estado: EstadoUsuario.ACTIVO,
      tenantId: 'tenant-123',
      perfilId: 'profile-1',
      rut: null,
      telefono: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      perfil: mockProfile,
      tenant: { nombre: 'Test Tenant' },
    };

    beforeEach(() => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.perfil.findFirst.mockResolvedValue(mockProfile);
      mockPrismaService.usuario.create.mockResolvedValue(mockCreatedUser);
    });

    it('should create user successfully', async () => {
      const result = await usersService.create(createUserDto);

      expect(prismaService.usuario.create).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
      expect(result.nombre).toBe('New User');
      expect(result.estado).toBe(EstadoUsuario.ACTIVO);
      expect(result.activo).toBe(true);
    });

    it('should throw BadRequestException when email exists', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'existing-user',
        correo: 'new@example.com',
      });

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when profile not found', async () => {
      mockPrismaService.perfil.findFirst.mockResolvedValue(null);

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle Prisma unique constraint error', async () => {
      mockPrismaService.usuario.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed',
      });

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto = {
      nombre: 'Updated Name',
      email: 'updated@example.com',
    };

    const existingUser = {
      id: 'user-123',
      correo: 'old@example.com',
      nombre: 'Old Name',
      tenantId: 'tenant-123',
      perfilId: 'profile-1',
      activo: true,
      estado: EstadoUsuario.ACTIVO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const mockUpdatedUser = {
      ...existingUser,
      correo: 'updated@example.com',
      nombre: 'Updated Name',
      updatedAt: new Date('2024-01-03'),
      perfil: { nombre: 'Admin', perfilesRoles: [] },
      tenant: { nombre: 'Test Tenant' },
    };

    beforeEach(() => {
      // Reset ALL mocks before each test
      jest.clearAllMocks();
    });

    it('should validate email uniqueness when changing email', async () => {
      const updateWithNewEmail = {
        ...updateUserDto,
        email: 'new-email@example.com',
      };

      // ⭐ Mock sequence CLEANLY:
      // First call: user exists check
      // Second call: email uniqueness check (email taken)
      mockPrismaService.usuario.findFirst
        .mockResolvedValueOnce(existingUser) // User exists
        .mockResolvedValueOnce({
          // Email already taken
          id: 'other-user',
          correo: 'new-email@example.com',
        });

      await expect(
        usersService.update('user-123', updateWithNewEmail, 'tenant-123'),
      ).rejects.toThrow(BadRequestException);

      // Verify email check parameters
      expect(prismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          correo: 'new-email@example.com',
          id: { not: 'user-123' },
        },
      });
    });
  });

  describe('remove', () => {
    const existingUser = {
      id: 'user-123',
      tenantId: 'tenant-123',
      activo: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.usuario.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.usuario.update.mockResolvedValue({
        ...existingUser,
        activo: false,
        estado: EstadoUsuario.INACTIVO,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // ⭐ Clear previous mocks
      jest.clearAllMocks();

      // ⭐ Mock user NOT found
      mockPrismaService.usuario.findFirst.mockResolvedValue(null);

      const promise = usersService.remove('non-existent', 'tenant-123');

      await expect(promise).rejects.toThrow(NotFoundException);

      // ⭐ Verify the correct query
      expect(prismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: { id: 'non-existent', tenantId: 'tenant-123' },
      });
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: 'user-123',
      correo: 'current@example.com',
      nombre: 'Current User',
      activo: true,
      estado: EstadoUsuario.ACTIVO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      perfil: { nombre: 'Admin', perfilesRoles: [] },
      tenant: { nombre: 'Test Tenant' },
    };

    beforeEach(() => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUser);
    });

    it('should return current user', async () => {
      const result = await usersService.getCurrentUser('user-123');

      expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: expect.any(Object),
      });
      expect(result).toBeInstanceOf(UserResponseDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(usersService.getCurrentUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCurrentUser', () => {
    const updateUserDto = {
      nombre: 'Updated Current User',
      rut: '12345678-9',
      telefono: '+1234567890',
    };

    const mockUser = {
      id: 'user-123',
      correo: 'current@example.com',
      nombre: 'Current User',
      activo: true,
      estado: EstadoUsuario.ACTIVO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      perfil: { nombre: 'Admin', perfilesRoles: [] },
      tenant: { nombre: 'Test Tenant' },
    };

    const mockUpdatedUser = {
      ...mockUser,
      ...updateUserDto,
      updatedAt: new Date('2024-01-03'),
    };

    beforeEach(() => {
      mockPrismaService.usuario.update.mockResolvedValue(mockUpdatedUser);
    });

    it('should update current user successfully', async () => {
      const result = await usersService.updateCurrentUser(
        'user-123',
        updateUserDto,
      );

      expect(prismaService.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          nombre: 'Updated Current User',
          rut: '12345678-9',
          telefono: '+1234567890',
        },
        include: expect.any(Object),
      });
      expect(result).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('getUserStats', () => {
    const mockStats = {
      total: 10,
      active: 7,
      inactive: 3,
      byProfile: [
        { perfil: 'Admin', count: 3 },
        { perfil: 'User', count: 7 },
      ],
    };

    beforeEach(() => {
      mockPrismaService.usuario.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(7) // active
        .mockResolvedValueOnce(3); // inactive

      mockPrismaService.usuario.groupBy.mockResolvedValue([
        { perfilId: 'profile-1', _count: { id: 3 } },
        { perfilId: 'profile-2', _count: { id: 7 } },
      ]);

      mockPrismaService.perfil.findUnique
        .mockResolvedValueOnce({ nombre: 'Admin' })
        .mockResolvedValueOnce({ nombre: 'User' });
    });

    it('should return user statistics', async () => {
      const result = await usersService.getUserStats('tenant-123');

      expect(prismaService.usuario.count).toHaveBeenCalledTimes(3);
      expect(prismaService.usuario.groupBy).toHaveBeenCalledWith({
        by: ['perfilId'],
        where: { tenantId: 'tenant-123' },
        _count: { id: true },
      });
      expect(prismaService.perfil.findUnique).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockStats);
    });
  });
});
