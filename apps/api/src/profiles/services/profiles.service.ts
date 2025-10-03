import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    try {
      const profiles = await this.prisma.perfil.findMany({
        where: {
          tenantId,
          activo: true,
        },
        include: {
          tipo: true,
        },
        orderBy: {
          nombre: 'asc',
        },
      });

      return profiles.map(profile => ({
        id: profile.id,
        nombre: profile.nombre,
        tipo: profile.tipo?.tipoPerfil,
        descripcion: profile.descripcion,
      }));
    } catch (error) {
      this.logger.error('Error fetching profiles:', error);
      throw error;
    }
  }
}