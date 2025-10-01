import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InternalJwtService, InternalJwtPayload } from './internal-jwt.service';
import { Auth0User } from '../interfaces/auth0-user.interface';
import { PrismaService } from 'prisma/prisma.service';
import { RolesService } from 'src/roles/services/roles.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private internalJwtService: InternalJwtService,
    private rolesService: RolesService,
  ) {
    this.logger.log('AuthService initialized');
  }

  async handleAuth0Login(auth0User: Auth0User) {
    this.logger.log(`Auth0 login attempt for: ${auth0User.email}`);

    // 1. Simple user lookup - just find by email for now
    let user = await this.prisma.usuario.findFirst({
      where: {
        correo: auth0User.email,
      },
      include: {
        perfil: {
          include: {
            tipo: true,
          },
        },
      },
    });

    // If user doesn't exist, create a basic one for testing
    if (!user) {
      this.logger.log(`Creating new user for: ${auth0User.email}`);

      // Get or create basic data for testing
      const activeStatus = await this.getOrCreateActiveStatus();
      const defaultUserType = await this.getOrCreateDefaultUserType();
      const defaultTenant = await this.getOrCreateDefaultTenant(
        activeStatus.id,
      );
      const defaultProfile = await this.getOrCreateDefaultProfile(
        defaultTenant.id,
        activeStatus.id,
      );

      user = await this.prisma.usuario.create({
        data: {
          correo: auth0User.email,
          nombre: auth0User.name || auth0User.email.split('@')[0],
          activo: true,
          tenantId: defaultTenant.id,
          perfilId: defaultProfile.id,
          estadoId: activeStatus.id,
          tipoId: defaultUserType.id,
          contacto: 'Test Contact',
          rut: '12345678-9',
          telefono: '+1234567890',
        },
        include: {
          perfil: {
            include: {
              tipo: true,
            },
          },
        },
      });
    }

    if (!user.activo) {
      throw new UnauthorizedException('User account is disabled');
    }

    // 2. Get basic permissions for testing
    const permissions = await this.getUserPermissions(user.id, user.tenantId);

    // Add logging here
    this.logger.debug('Permissions before JWT generation:');
    this.logger.debug(`Number of permissions: ${permissions.length}`);
    this.logger.debug(`First permission: ${permissions[0]}`);
    this.logger.debug(`All permissions: ${JSON.stringify(permissions)}`);

    // Check if we have UUIDs or names
    if (permissions.length > 0) {
      const firstPerm = permissions[0];
      const isUuid = firstPerm.includes('-') && firstPerm.length > 30;
      this.logger.debug(`First permission is UUID: ${isUuid}`);
    }

    // 3. Generate internal JWT with permissions
    const internalPayload: InternalJwtPayload = {
      sub: user.id,
      email: user.correo,
      tenant_id: user.tenantId,
      profile_id: user.perfilId,
      permissions: permissions, // This should be UUIDs
    };

    const accessToken =
      await this.internalJwtService.generateInternalToken(internalPayload);
    const refreshToken = await this.internalJwtService.generateRefreshToken(
      user.id,
    );

    this.logger.log(`Login successful for user: ${user.correo}`);

    const loginResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.correo,
        name: user.nombre,
        tenant_id: user.tenantId,
        profile_id: user.perfilId,
        profile_type: user.perfil?.tipo?.tipoPerfil || 'usuario',
        permissions: permissions,
      },
    };
    this.logger.debug(
      'Login response:',
      JSON.stringify(loginResponse, null, 2),
    );
    return loginResponse;
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
                      id: true, // UUID
                      codigo: true, // role code
                      nombre: true, // role name
                    },
                  },
                },
              },
            },
          },
        },
      });

      this.logger.debug(`User found: ${!!userWithProfile}`);

      if (userWithProfile?.perfil?.perfilesRoles) {
        this.logger.debug(
          `Found ${userWithProfile.perfil.perfilesRoles.length} profile-role relationships`,
        );

        // Log the first relationship to see what we're getting
        if (userWithProfile.perfil.perfilesRoles.length > 0) {
          const firstRelation = userWithProfile.perfil.perfilesRoles[0];
          this.logger.debug(
            `First relationship - Role ID: ${firstRelation.rol.id}, Name: ${firstRelation.rol.nombre}, Code: ${firstRelation.rol.codigo}`,
          );
        }

        // Extract role IDs (UUIDs)
        const roleIds = userWithProfile.perfil.perfilesRoles
          .map((pr) => {
            this.logger.debug(
              `Mapping - Role ID: ${pr.rol.id}, Name: ${pr.rol.nombre}`,
            );
            return pr.rol.id; // This should return UUIDs
          })
          .filter(Boolean);

        this.logger.debug(`Returning ${roleIds.length} role IDs`);
        this.logger.debug(`First returned ID: ${roleIds[0]}`);
        this.logger.debug(`All returned IDs: ${JSON.stringify(roleIds)}`);

        return roleIds;
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

  async getUserRolesWithDetails(roleIds: string[]): Promise<any[]> {
    try {
      return await this.rolesService.getRolesByIds(roleIds);
    } catch (error) {
      this.logger.warn(
        'Error fetching role details, returning basic info:',
        error,
      );
      // Fallback: return basic role info
      return roleIds.map((id) => ({
        id,
        codigo: 'rol_defecto',
        nombre: 'Rol básico',
      }));
    }
  }

  private async getOrCreateActiveStatus() {
    let status = await this.prisma.estadoRegistro.findFirst({
      where: { estado: 'activo' },
    });

    if (!status) {
      status = await this.prisma.estadoRegistro.create({
        data: {
          estado: 'activo',
          tenantId: null, // System-wide status
        },
      });
    }

    return status;
  }

  private async getOrCreateDefaultUserType() {
    let userType = await this.prisma.tipoUsuario.findFirst({
      where: { tipoUsuario: 'standard' },
    });

    if (!userType) {
      userType = await this.prisma.tipoUsuario.create({
        data: {
          tipoUsuario: 'standard',
          tenantId: null, // System-wide type
        },
      });
    }

    return userType;
  }

  private async getOrCreateDefaultTenant(activeStatusId: string) {
    let tenant = await this.prisma.tenant.findFirst({
      where: { nombre: 'Tenant de Desarrollo' },
    });

    if (!tenant) {
      const tenantType = await this.getOrCreateDefaultTenantType();

      tenant = await this.prisma.tenant.create({
        data: {
          nombre: 'Tenant de Desarrollo',
          contacto: 'dev@example.com',
          rut: '12345678-9',
          activo: true,
          estadoId: activeStatusId,
          tipoTenantId: tenantType.id,
        },
      });
    }

    return tenant;
  }

  private async getOrCreateDefaultTenantType() {
    let tenantType = await this.prisma.tipoTenant.findFirst({
      where: { tipoTenant: 'admin' },
    });

    if (!tenantType) {
      tenantType = await this.prisma.tipoTenant.create({
        data: {
          tipoTenant: 'admin',
          tenantId: null, // System-wide type
        },
      });
    }

    return tenantType;
  }

  private async getOrCreateDefaultProfile(
    tenantId: string,
    activeStatusId: string,
  ) {
    let profile = await this.prisma.perfil.findFirst({
      where: {
        nombre: 'Administrador',
        tenantId: tenantId,
      },
    });

    if (!profile) {
      const profileType = await this.getOrCreateDefaultProfileType();

      profile = await this.prisma.perfil.create({
        data: {
          nombre: 'Administrador',
          descripcion: 'Perfil administrativo con acceso completo',
          activo: true,
          estadoId: activeStatusId,
          tenantId: tenantId,
          tipoId: profileType.id,
          contacto: 'admin@tenant.com',
          rut: '98765432-1',
        },
      });

      // Create some basic roles for this profile
      await this.createDefaultRoles(tenantId, activeStatusId, profile.id);
    }

    return profile;
  }

  private async getOrCreateDefaultProfileType() {
    let profileType = await this.prisma.tipoPerfil.findFirst({
      where: { tipoPerfil: 'administrativo' },
    });

    if (!profileType) {
      profileType = await this.prisma.tipoPerfil.create({
        data: {
          tipoPerfil: 'administrativo',
          tenantId: null, // System-wide type
        },
      });
    }

    return profileType;
  }

  private async createDefaultRoles(
    tenantId: string,
    activeStatusId: string,
    profileId: string,
  ) {
    const actionType = await this.getOrCreateActionType();

    const defaultRoles = [
      { codigo: 'ver_dashboard', nombre: 'Ver Dashboard', modulo: 'usuarios' },
      { codigo: 'crear_ordenes', nombre: 'Crear Órdenes', modulo: 'ordenes' },
      { codigo: 'editar_perfil', nombre: 'Editar Perfil', modulo: 'usuarios' },
    ];

    for (const roleData of defaultRoles) {
      const role = await this.prisma.rol.create({
        data: {
          ...roleData,
          activo: true,
          estadoId: activeStatusId,
          tenantId: tenantId,
          tipoAccionId: actionType.id,
          visible: true,
          orden: 1,
        },
      });

      // Link role to profile
      await this.prisma.perfilRol.create({
        data: {
          perfilId: profileId,
          rolId: role.id,
          tenantId: tenantId,
        },
      });
    }
  }

  private async getOrCreateActionType() {
    let actionType = await this.prisma.tipoAccion.findFirst({
      where: { tipoAccion: 'ver' },
    });

    if (!actionType) {
      actionType = await this.prisma.tipoAccion.create({
        data: {
          tipoAccion: 'ver',
          tenantId: null, // System-wide type
        },
      });
    }

    return actionType;
  }
}
