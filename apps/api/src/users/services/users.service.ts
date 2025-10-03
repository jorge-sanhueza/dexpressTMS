import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserResponseDto } from '../dto/user-response.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UsersFilterDto,
  UserWithDetails,
  UserWithFullDetails,
} from '../interfaces/user.interface';

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
          { contacto: { contains: search, mode: 'insensitive' } },
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

      const [users, total] = await Promise.all([
        this.prisma.usuario.findMany({
          where,
          include: {
            perfil: {
              include: {
                tipo: true,
              },
            },
            tipo: true,
            estado: true,
          },
          skip,
          take: limitNumber,
          orderBy: { createdAt: 'desc' },
        }) as unknown as UserWithDetails[],
        this.prisma.usuario.count({ where }),
      ]);

      return {
        users: users.map((user) => {
          const profileType = user.perfil?.tipo?.tipoPerfil;
          return new UserResponseDto(user, profileType);
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
      const user = (await this.prisma.usuario.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          perfil: {
            include: {
              tipo: true,
            },
          },
          tipo: true,
          estado: true,
        },
      })) as unknown as UserWithDetails;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const profileType = user.perfil?.tipo?.tipoPerfil;
      return new UserResponseDto(user, profileType);
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

      // Get active status
      const activeStatus = await this.prisma.estadoRegistro.findFirst({
        where: { estado: 'activo' },
      });

      if (!activeStatus) {
        throw new NotFoundException('Active status not found');
      }

      // Get default user type if not provided
      let tipoId = createUserDto.tipoId;
      if (!tipoId) {
        const defaultType = await this.prisma.tipoUsuario.findFirst({
          where: { tipoUsuario: 'standard' },
        });
        if (!defaultType) {
          throw new NotFoundException('Default user type not found');
        }
        tipoId = defaultType.id;
      }

      const user = (await this.prisma.usuario.create({
        data: {
          correo: createUserDto.email,
          nombre: createUserDto.nombre,
          contacto: createUserDto.contacto || null,
          rut: createUserDto.rut || null,
          telefono: createUserDto.telefono || null,
          tenantId: createUserDto.tenantId,
          perfilId: createUserDto.perfilId,
          estadoId: activeStatus.id,
          tipoId: tipoId,
          activo: true,
        },
        include: {
          perfil: {
            include: {
              tipo: true,
            },
          },
          tipo: true,
          estado: true,
        },
      })) as unknown as UserWithDetails;

      const profileType = user.perfil?.tipo?.tipoPerfil;
      return new UserResponseDto(user, profileType);
    } catch (error) {
      this.logger.error('Error creating user:', error);
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

      const user = (await this.prisma.usuario.update({
        where: { id },
        data: {
          nombre: updateUserDto.nombre,
          contacto: updateUserDto.contacto,
          rut: updateUserDto.rut,
          telefono: updateUserDto.telefono,
          perfilId: updateUserDto.perfilId,
          activo: updateUserDto.activo,
          tipoId: updateUserDto.tipoId,
        },
        include: {
          perfil: {
            include: {
              tipo: true,
            },
          },
          tipo: true,
          estado: true,
        },
      })) as unknown as UserWithDetails;

      const profileType = user.perfil?.tipo?.tipoPerfil;
      return new UserResponseDto(user, profileType);
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
        data: { activo: false },
      });

      this.logger.log(`User ${id} deactivated`);
    } catch (error) {
      this.logger.error(`Error deactivating user ${id}:`, error);
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    try {
      const user = (await this.prisma.usuario.findUnique({
        where: { id: userId },
        include: {
          perfil: {
            include: {
              tipo: true,
            },
          },
          tipo: true,
          estado: true,
          tenant: true,
        },
      })) as unknown as UserWithFullDetails;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const profileType = user.perfil?.tipo?.tipoPerfil;
      return new UserResponseDto(user, profileType);
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
      const user = (await this.prisma.usuario.update({
        where: { id: userId },
        data: {
          nombre: updateUserDto.nombre,
          contacto: updateUserDto.contacto,
          rut: updateUserDto.rut,
          telefono: updateUserDto.telefono,
        },
        include: {
          perfil: {
            include: {
              tipo: true,
            },
          },
          tipo: true,
          estado: true,
          tenant: true,
        },
      })) as unknown as UserWithFullDetails;

      const profileType = user.perfil?.tipo?.tipoPerfil;
      return new UserResponseDto(user, profileType);
    } catch (error) {
      this.logger.error(`Error updating current user ${userId}:`, error);
      throw error;
    }
  }
}
