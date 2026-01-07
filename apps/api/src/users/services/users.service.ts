import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserResponseDto } from '../dto/user-response.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UsersFilterDto,
} from '../interfaces/user.interface';
import { EstadoUsuario } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: UsersFilterDto,
    tenantId: string,
  ): Promise<{ users: User[]; total: number }> {
    try {
      const { search, activo, perfilId, page = 1, limit = 10 } = filter;

      const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNumber =
        typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {
        tenantId,
      };

      // Search filter
      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { correo: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Active filter
      if (activo !== undefined) {
        where.activo = typeof activo === 'string' ? activo === 'true' : activo;
      }

      // Profile filter
      if (perfilId) {
        where.perfilId = perfilId;
      }

      const [users, total] = await this.prisma.$transaction([
        this.prisma.usuario.findMany({
          where,
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
          skip,
          take: limitNumber,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.usuario.count({ where }),
      ]);

      return {
        users: users.map((user) => {
          return new UserResponseDto(user);
        }),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching users:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    try {
      const user = await this.prisma.usuario.findFirst({
        where: {
          id,
          tenantId,
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
        throw new NotFoundException('User not found');
      }

      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.usuario.findUnique({
        where: { correo: createUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Verify profile exists and belongs to the same tenant
      const profile = await this.prisma.perfil.findFirst({
        where: {
          id: createUserDto.perfilId,
          tenantId: createUserDto.tenantId,
          activo: true,
        },
      });

      if (!profile) {
        throw new BadRequestException('Invalid profile or profile not found');
      }

      const user = await this.prisma.usuario.create({
        data: {
          correo: createUserDto.email,
          nombre: createUserDto.nombre,
          rut: createUserDto.rut || null,
          telefono: createUserDto.telefono || null,
          tenantId: createUserDto.tenantId,
          perfilId: createUserDto.perfilId,
          estado: EstadoUsuario.ACTIVO, // Using enum directly
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

      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    tenantId: string,
  ): Promise<User> {
    try {
      // Verify user exists and belongs to tenant
      const existingUser = await this.prisma.usuario.findFirst({
        where: { id, tenantId },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // If updating profile, verify it exists and belongs to same tenant
      if (
        updateUserDto.perfilId &&
        updateUserDto.perfilId !== existingUser.perfilId
      ) {
        const profile = await this.prisma.perfil.findFirst({
          where: {
            id: updateUserDto.perfilId,
            tenantId: tenantId,
            activo: true,
          },
        });

        if (!profile) {
          throw new BadRequestException('Invalid profile or profile not found');
        }
      }

      // If updating email, check for duplicates
      if (updateUserDto.email && updateUserDto.email !== existingUser.correo) {
        const emailExists = await this.prisma.usuario.findFirst({
          where: {
            correo: updateUserDto.email,
            id: { not: id },
          },
        });

        if (emailExists) {
          throw new BadRequestException('Email already exists');
        }
      }

      const user = await this.prisma.usuario.update({
        where: { id },
        data: {
          correo: updateUserDto.email,
          nombre: updateUserDto.nombre,
          rut: updateUserDto.rut,
          telefono: updateUserDto.telefono,
          perfilId: updateUserDto.perfilId,
          activo: updateUserDto.activo,
          estado: updateUserDto.estado,
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

      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    try {
      // Verify user exists and belongs to tenant
      const existingUser = await this.prisma.usuario.findFirst({
        where: { id, tenantId },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Soft delete by setting activo to false
      await this.prisma.usuario.update({
        where: { id },
        data: {
          activo: false,
          estado: EstadoUsuario.INACTIVO,
        },
      });

      this.logger.log(`User ${id} deactivated`);
    } catch (error) {
      this.logger.error(`Error deactivating user ${id}:`, error);
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id: userId },
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
        throw new NotFoundException('User not found');
      }

      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(`Error fetching current user ${userId}:`, error);
      throw error;
    }
  }

  async updateCurrentUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.prisma.usuario.update({
        where: { id: userId },
        data: {
          nombre: updateUserDto.nombre,
          rut: updateUserDto.rut,
          telefono: updateUserDto.telefono,
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

      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(`Error updating current user ${userId}:`, error);
      throw error;
    }
  }

  // New method to get user statistics
  async getUserStats(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byProfile: Array<{ perfil: string; count: number }>;
  }> {
    try {
      const total = await this.prisma.usuario.count({
        where: { tenantId },
      });

      const active = await this.prisma.usuario.count({
        where: {
          tenantId,
          activo: true,
          estado: EstadoUsuario.ACTIVO,
        },
      });

      const inactive = await this.prisma.usuario.count({
        where: {
          tenantId,
          OR: [{ activo: false }, { estado: EstadoUsuario.INACTIVO }],
        },
      });

      const usersByProfile = await this.prisma.usuario.groupBy({
        by: ['perfilId'],
        where: { tenantId },
        _count: {
          id: true,
        },
      });

      // Get profile names
      const profileCounts = await Promise.all(
        usersByProfile.map(async (group) => {
          const profile = await this.prisma.perfil.findUnique({
            where: { id: group.perfilId },
            select: { nombre: true },
          });
          return {
            perfil: profile?.nombre || 'Unknown',
            count: group._count.id,
          };
        }),
      );

      return {
        total,
        active,
        inactive,
        byProfile: profileCounts,
      };
    } catch (error) {
      this.logger.error('Error fetching user stats:', error);
      throw error;
    }
  }
}
