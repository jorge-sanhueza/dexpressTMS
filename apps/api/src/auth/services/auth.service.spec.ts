import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EstadoUsuario } from '@prisma/client';
import { InternalJwtService } from './internal-jwt.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let internalJwtService: InternalJwtService;

  // Mock Prisma Service
  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    tenant: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    perfil: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    rol: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    perfilRol: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  // Mock Internal JWT Service
  const mockInternalJwtService = {
    generateInternalToken: jest.fn().mockResolvedValue('fake-access-token'),
    generateRefreshToken: jest.fn().mockResolvedValue('fake-refresh-token'),
    verifyInternalToken: jest.fn().mockReturnValue({ sub: 'user-123' }),
  };

  // Mock bcrypt
  jest.mock('bcrypt', () => ({
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashed-password'),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: InternalJwtService, useValue: mockInternalJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    internalJwtService = module.get<InternalJwtService>(InternalJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('emailPasswordLogin', () => {
    const mockUser = {
      id: 'user-123',
      correo: 'test@example.com',
      nombre: 'Test User',
      activo: true,
      password: 'hashed-password',
      tenantId: 'tenant-123',
      perfilId: 'profile-123',
      perfil: {
        nombre: 'Administrador',
        perfilesRoles: [
          {
            rol: { codigo: 'ver_dashboard' },
          },
          {
            rol: { codigo: 'crear_ordenes' },
          },
        ],
      },
      tenant: { nombre: 'Test Tenant' },
    };

    beforeEach(() => {
      mockPrismaService.usuario.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it('should successfully login with valid credentials', async () => {
      const result = await authService.emailPasswordLogin(
        'test@example.com',
        'password123',
      );

      expect(prismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          correo: 'test@example.com',
          activo: true,
        },
        include: expect.objectContaining({
          perfil: expect.any(Object),
          tenant: true,
        }),
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );

      expect(internalJwtService.generateInternalToken).toHaveBeenCalled();
      expect(internalJwtService.generateRefreshToken).toHaveBeenCalled();

      expect(result).toHaveProperty('access_token', 'fake-access-token');
      expect(result).toHaveProperty('refresh_token', 'fake-refresh-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.permissions).toEqual([
        'ver_dashboard',
        'crear_ordenes',
      ]);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.emailPasswordLogin('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = {
        ...mockUser,
        activo: false,
      };

      // The query looks for activo: true, so it won't find inactive user
      mockPrismaService.usuario.findFirst.mockResolvedValueOnce(null);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await expect(
        authService.emailPasswordLogin('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);

      // Verify the query was looking for active user
      expect(prismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          correo: 'test@example.com',
          activo: true,
        },
        include: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.usuario.findFirst.mockResolvedValueOnce(null);

      await expect(
        authService.emailPasswordLogin(
          'nonexistent@example.com',
          'password123',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('handleAuth0Login', () => {
    const mockAuth0User = {
      email: 'auth0@example.com',
      name: 'Auth0 User',
      sub: 'auth0|123456',
      email_verified: true,
      tenant_id: 'tenant-123',
    };

    it('should handle Auth0 login for existing user', async () => {
      const existingUser = {
        id: 'user-456',
        correo: 'auth0@example.com',
        nombre: 'Auth0 User',
        activo: true,
        tenantId: 'tenant-123',
        perfilId: 'profile-456',
        perfil: {
          perfilesRoles: [{ rol: { codigo: 'ver_dashboard' } }],
        },
        tenant: { nombre: 'Auth0 Tenant' },
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(existingUser);

      const result = await authService.handleAuth0Login(mockAuth0User);

      expect(prismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: { correo: 'auth0@example.com' },
        include: expect.any(Object),
      });

      expect(result.user.email).toBe('auth0@example.com');
      expect(result).toHaveProperty('access_token');
    });

    it('should create new user for Auth0 login if not exists', async () => {
      mockPrismaService.usuario.findFirst.mockResolvedValue(null);
      mockPrismaService.tenant.findFirst.mockResolvedValue({
        id: 'default-tenant',
        nombre: 'Tenant Administrativo',
      });
      mockPrismaService.perfil.findFirst.mockResolvedValue({
        id: 'default-profile',
        nombre: 'Administrador',
      });

      const createdUser = {
        id: 'new-user-123',
        correo: 'auth0@example.com',
        nombre: 'Auth0 User',
        activo: true,
        tenantId: 'default-tenant',
        perfilId: 'default-profile',
        perfil: {
          nombre: 'Administrador',
          perfilesRoles: [],
        },
        tenant: { nombre: 'Tenant Administrativo' },
      };

      mockPrismaService.usuario.create.mockResolvedValue(createdUser);
      mockPrismaService.usuario.findUnique.mockResolvedValue(createdUser);

      const result = await authService.handleAuth0Login(mockAuth0User);

      expect(prismaService.usuario.create).toHaveBeenCalled();
      expect(result.user.email).toBe('auth0@example.com');
    });
  });

  describe('setupInitialPassword', () => {
    it('should setup initial password successfully', async () => {
      mockPrismaService.usuario.update.mockResolvedValue({});

      await authService.setupInitialPassword('user-123', 'validPassword123');

      expect(prismaService.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          password: expect.any(String),
          estado: EstadoUsuario.ACTIVO,
        },
      });
    });

    it('should throw BadRequestException for short password', async () => {
      await expect(
        authService.setupInitialPassword('user-123', '123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePassword', () => {
    const mockUser = {
      id: 'user-123',
      correo: 'test@example.com',
      password: 'current-hashed-password',
    };

    beforeEach(() => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
    });

    it('should update password successfully', async () => {
      await authService.updatePassword(
        'user-123',
        'current-password',
        'new-password-123',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'current-password',
        'current-hashed-password',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('new-password-123', 10);
      expect(prismaService.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'new-hashed-password' },
      });
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.updatePassword(
          'user-123',
          'wrong-password',
          'new-password',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for short new password', async () => {
      await expect(
        authService.updatePassword('user-123', 'current-password', '123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockUser = {
        id: 'user-123',
        correo: 'test@example.com',
        nombre: 'Test User',
        activo: true,
        tenantId: 'tenant-123',
        perfilId: 'profile-123',
        perfil: {
          nombre: 'Admin',
          perfilesRoles: [{ rol: { codigo: 'ver_dashboard' } }],
        },
        tenant: { nombre: 'Test Tenant' },
      };

      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await authService.refreshTokens('valid-refresh-token');

      expect(internalJwtService.verifyInternalToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: expect.any(Object),
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockInternalJwtService.verifyInternalToken.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
