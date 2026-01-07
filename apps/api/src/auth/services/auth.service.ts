import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InternalJwtService, InternalJwtPayload } from './internal-jwt.service';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { EstadoUsuario, TipoTenant, TipoAccion } from '@prisma/client';
import { LoginResponse } from '../interfaces/login-response.interface';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  constructor(
    private prisma: PrismaService,
    private internalJwtService: InternalJwtService,
  ) {
    this.logger.log('AuthService initialized');
  }

  // Add this method to your AuthService class:

  async emailPasswordLogin(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    this.logger.log(`Email/password login attempt for: ${email}`);

    // 1. Validate email/password
    const user = await this.validateEmailPassword(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Create Auth0User-like object
    const auth0User: Auth0User = {
      sub: user.id,
      email: user.correo,
      email_verified: true,
      name: user.nombre,
      tenant_id: user.tenantId,
    };

    // 3. Use existing handleAuth0Login method
    return await this.handleAuth0Login(auth0User);
  }

  private async validateEmailPassword(email: string, password: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        correo: email,
        activo: true,
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
        tenant: true,
      },
    });

    if (!user) {
      this.logger.warn(`No active user found for email: ${email}`);
      return null;
    }

    const isValidPassword = await this.validateUserPassword(user, password);

    if (!isValidPassword) {
      this.logger.warn(`Invalid password for user: ${email}`);
      return null;
    }

    return user;
  }

  private async validateUserPassword(
    user: any,
    password: string,
  ): Promise<boolean> {
    try {
      // Check if user has a stored password
      if (!user.password) {
        this.logger.warn(`No password set for user: ${user.correo}`);
        return false;
      }

      // Compare provided password with stored hash
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      this.logger.error('Error validating password:', error);
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async setupInitialPassword(userId: string, password: string): Promise<void> {
    try {
      if (!password || password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      const hashedPassword = await this.hashPassword(password);

      await this.prisma.usuario.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          estado: EstadoUsuario.ACTIVO, // Ensure user is active
        },
      });

      this.logger.log(`Initial password setup completed for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error setting up password:', error);
      throw new BadRequestException('Failed to set up password');
    }
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // Get user with password
      const user = await this.prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true, correo: true, password: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.password) {
        throw new BadRequestException('No password set for this user');
      }

      // Verify current password
      const isValidCurrent = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isValidCurrent) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        throw new BadRequestException(
          'New password must be at least 6 characters long',
        );
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      this.logger.log(`Password updated for user: ${user.correo}`);
    } catch (error) {
      this.logger.error('Error updating password:', error);
      throw error; // Re-throw for controller to handle
    }
  }

  // Seed default passwords for existing users (for migration)
  async seedDefaultPasswords(
    defaultPassword: string = 'demo123',
  ): Promise<{ usersAffected: number }> {
    try {
      this.logger.log('Seeding default passwords for existing users');

      // Validate default password
      if (!defaultPassword || defaultPassword.length < 6) {
        throw new BadRequestException(
          'Default password must be at least 6 characters long',
        );
      }

      const hashedPassword = await this.hashPassword(defaultPassword);

      // Get all users without passwords
      const users = await this.prisma.usuario.findMany({
        where: {
          OR: [{ password: null }, { password: '' }],
        },
      });

      this.logger.log(`Found ${users.length} users without passwords`);

      // Update all users with the hashed password
      const result = await this.prisma.usuario.updateMany({
        where: {
          OR: [{ password: null }, { password: '' }],
        },
        data: {
          password: hashedPassword,
          estado: EstadoUsuario.ACTIVO,
        },
      });

      this.logger.log(`Passwords seeded for ${result.count} users`);

      return { usersAffected: result.count };
    } catch (error) {
      this.logger.error('Password seeding failed:', error);
      throw error;
    }
  }

  async handleAuth0Login(auth0User: Auth0User): Promise<LoginResponse> {
    this.logger.log(`Auth0 login attempt for: ${auth0User.email}`);

    // 1. Simple user lookup - just find by email for now
    let user = await this.prisma.usuario.findFirst({
      where: {
        correo: auth0User.email,
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
        tenant: true,
      },
    });

    // If user doesn't exist, create a basic one for testing
    if (!user) {
      this.logger.log(`Creating new user for: ${auth0User.email}`);
      user = await this.createNewUser(auth0User);
    }

    // Now user should not be null, but let's double-check
    if (!user) {
      throw new UnauthorizedException('Failed to create or find user');
    }

    if (!user.activo) {
      throw new UnauthorizedException('User account is disabled');
    }

    // 2. Get permissions using role codes instead of IDs
    const permissions = await this.getUserPermissions(user.id, user.tenantId);

    // Add logging here
    this.logger.debug('Permissions before JWT generation:');
    this.logger.debug(`Number of permissions: ${permissions.length}`);
    if (permissions.length > 0) {
      this.logger.debug(`First permission: ${permissions[0]}`);
      this.logger.debug(`All permissions: ${JSON.stringify(permissions)}`);
    }

    // 3. Generate internal JWT with permissions
    const internalPayload: InternalJwtPayload = {
      sub: user.id,
      email: user.correo,
      tenant_id: user.tenantId,
      profile_id: user.perfilId,
      permissions: permissions,
    };

    const accessToken =
      await this.internalJwtService.generateInternalToken(internalPayload);
    const refreshToken = await this.internalJwtService.generateRefreshToken(
      user.id,
    );

    this.logger.log(`Login successful for user: ${user.correo}`);

    const loginResponse: LoginResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.correo,
        name: user.nombre,
        tenant_id: user.tenantId,
        profile_id: user.perfilId,
        profile_name: user.perfil?.nombre || 'Usuario',
        permissions: permissions,
      },
    };

    this.logger.debug(
      'Login response:',
      JSON.stringify(loginResponse, null, 2),
    );
    return loginResponse;
  }

  private async createNewUser(auth0User: Auth0User) {
    // Get or create basic data for testing
    const defaultTenant = await this.getOrCreateDefaultTenant();
    const defaultProfile = await this.getOrCreateDefaultProfile(
      defaultTenant.id,
    );

    // Create the user
    const newUser = await this.prisma.usuario.create({
      data: {
        correo: auth0User.email,
        nombre: auth0User.name || auth0User.email.split('@')[0],
        activo: true,
        estado: EstadoUsuario.ACTIVO,
        tenantId: defaultTenant.id,
        perfilId: defaultProfile.id,
        rut: '12345678-9',
        telefono: '+1234567890',
        password: await this.hashPassword('demo123'), // Set default password
      },
    });

    // Fetch the user with relations
    const userWithRelations = await this.prisma.usuario.findUnique({
      where: { id: newUser.id },
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
        tenant: true,
      },
    });

    if (!userWithRelations) {
      throw new NotFoundException('Failed to create user with relations');
    }

    return userWithRelations;
  }

  private async getUserPermissions(
    userId: string,
    tenantId: string,
  ): Promise<string[]> {
    this.logger.log(`Getting permissions for user: ${userId}`);

    try {
      const userWithProfile = await this.prisma.usuario.findUnique({
        where: { id: userId },
        include: {
          perfil: {
            include: {
              perfilesRoles: {
                include: {
                  rol: {
                    select: {
                      codigo: true, // Use role code instead of ID for permissions
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userWithProfile) {
        this.logger.warn(`User ${userId} not found`);
        return [];
      }

      this.logger.debug(`User found: ${!!userWithProfile}`);

      if (userWithProfile.perfil?.perfilesRoles) {
        this.logger.debug(
          `Found ${userWithProfile.perfil.perfilesRoles.length} profile-role relationships`,
        );

        // Extract role CODES instead of IDs for permissions
        const roleCodes = userWithProfile.perfil.perfilesRoles
          .map((pr) => {
            const roleCode = pr.rol.codigo;
            this.logger.debug(
              `Mapping - Role Code: ${roleCode}, Name: ${pr.rol.nombre}`,
            );
            return roleCode;
          })
          .filter(Boolean);

        this.logger.debug(`Returning ${roleCodes.length} role codes`);
        if (roleCodes.length > 0) {
          this.logger.debug(`First returned code: ${roleCodes[0]}`);
          this.logger.debug(`All returned codes: ${JSON.stringify(roleCodes)}`);
        }

        return roleCodes;
      } else {
        this.logger.warn('No roles found for user profile');
      }

      this.logger.warn('No roles found for user, returning empty array');
      return [];
    } catch (error) {
      this.logger.error('Error getting permissions:', error);
      return [];
    }
  }

  private async getOrCreateDefaultTenant() {
    let tenant = await this.prisma.tenant.findFirst({
      where: { nombre: 'Tenant Administrativo' },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          nombre: 'Tenant Administrativo',
          contacto: 'admin@demo.cl',
          rut: '12345678-9',
          activo: true,
          tipoTenant: TipoTenant.ADMIN,
        },
      });
    }

    if (!tenant) {
      throw new Error('Failed to create or find default tenant');
    }

    return tenant;
  }

  private async getOrCreateDefaultProfile(tenantId: string) {
    let profile = await this.prisma.perfil.findFirst({
      where: {
        nombre: 'Administrador',
        tenantId: tenantId,
      },
      include: {
        perfilesRoles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!profile) {
      const newProfile = await this.prisma.perfil.create({
        data: {
          nombre: 'Administrador',
          descripcion: 'Perfil administrativo con acceso completo',
          activo: true,
          tenantId: tenantId,
        },
      });

      // Create some basic roles for this profile
      await this.createDefaultRoles(tenantId, newProfile.id);

      // Refetch the profile with relations
      profile = await this.prisma.perfil.findUnique({
        where: { id: newProfile.id },
        include: {
          perfilesRoles: {
            include: {
              rol: true,
            },
          },
        },
      });
    }

    if (!profile) {
      throw new Error('Failed to create or find default profile');
    }

    return profile;
  }

  private async createDefaultRoles(
    tenantId: string,
    profileId: string,
  ): Promise<void> {
    const defaultRoles = [
      {
        codigo: 'ver_dashboard',
        nombre: 'Ver Dashboard',
        modulo: 'dashboard',
        tipoAccion: TipoAccion.VER,
      },
      {
        codigo: 'crear_ordenes',
        nombre: 'Crear Órdenes',
        modulo: 'ordenes',
        tipoAccion: TipoAccion.CREAR,
      },
      {
        codigo: 'editar_perfil',
        nombre: 'Editar Perfil',
        modulo: 'usuarios',
        tipoAccion: TipoAccion.EDITAR,
      },
    ];

    for (const roleData of defaultRoles) {
      try {
        // Check if role already exists
        const existingRole = await this.prisma.rol.findFirst({
          where: {
            codigo: roleData.codigo,
            tenantId: tenantId,
          },
        });

        let role;

        if (existingRole) {
          // Role already exists, use it
          role = existingRole;
          this.logger.log(
            `Role ${roleData.codigo} already exists, using existing role`,
          );
        } else {
          // Create new role
          role = await this.prisma.rol.create({
            data: {
              ...roleData,
              activo: true,
              tenantId: tenantId,
              visible: true,
              orden: 1,
            },
          });
          this.logger.log(`Created role: ${role.codigo}`);
        }

        // Check if profile-role relationship already exists
        const existingProfileRole = await this.prisma.perfilRol.findFirst({
          where: {
            perfilId: profileId,
            rolId: role.id,
            tenantId: tenantId,
          },
        });

        if (!existingProfileRole) {
          // Link role to profile
          await this.prisma.perfilRol.create({
            data: {
              perfilId: profileId,
              rolId: role.id,
              tenantId: tenantId,
            },
          });
          this.logger.log(`Linked role ${role.codigo} to profile`);
        } else {
          this.logger.log(`Role ${role.codigo} already linked to profile`);
        }
      } catch (error) {
        this.logger.error(`Error processing role ${roleData.codigo}:`, error);
        // Continue with next role even if one fails
        continue;
      }
    }
  }

  // Optional: Method to validate refresh token
  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = this.internalJwtService.verifyInternalToken(refreshToken);
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
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
          tenant: true,
        },
      });

      if (!user || !user.activo) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Optional: Method to refresh tokens
  async refreshTokens(refreshToken: string): Promise<LoginResponse> {
    const user = await this.validateRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = await this.getUserPermissions(user.id, user.tenantId);

    const internalPayload: InternalJwtPayload = {
      sub: user.id,
      email: user.correo,
      tenant_id: user.tenantId,
      profile_id: user.perfilId,
      permissions: permissions,
    };

    const accessToken =
      await this.internalJwtService.generateInternalToken(internalPayload);
    const newRefreshToken = await this.internalJwtService.generateRefreshToken(
      user.id,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      user: {
        id: user.id,
        email: user.correo,
        name: user.nombre,
        tenant_id: user.tenantId,
        profile_id: user.perfilId,
        profile_name: user.perfil?.nombre || 'Usuario',
        permissions: permissions,
      },
    };
  }
}
