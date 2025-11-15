import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ContactosFilterDto } from '../dto/contactos-filter.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { UpdateContactoDto } from '../dto/update-contacto.dto';
import { ContactoResponseDto } from '../dto/contacto-response.dto';

@Injectable()
export class ContactosService {
  private readonly logger = new Logger(ContactosService.name);

  constructor(private prisma: PrismaService) {}

  // Helper for consistent include pattern
  private getContactoInclude() {
    return {
      entidad: {
        select: {
          id: true,
          nombre: true,
          rut: true,
          tipoEntidad: true,
        },
      },
      comuna: {
        include: {
          provincia: {
            include: {
              region: true,
            },
          },
        },
      },
    };
  }

  // Helper to prepare contacto data for Prisma
  private prepareContactoData(
    createContactoDto: CreateContactoDto,
    tenantId: string,
  ) {
    return {
      nombre: createContactoDto.nombre,
      rut: createContactoDto.rut,
      email: createContactoDto.email || null,
      telefono: createContactoDto.telefono || null,
      direccion: createContactoDto.direccion || null,
      cargo: createContactoDto.cargo || null,
      contacto: createContactoDto.contacto,
      esPersonaNatural: createContactoDto.esPersonaNatural ?? true,
      activo: true,
      comunaId: createContactoDto.comunaId,
      entidadId: createContactoDto.entidadId,
      tenantId,
    };
  }

  // Helper to prepare update data for Prisma
  private prepareUpdateData(updateContactoDto: UpdateContactoDto) {
    const data: any = {};

    if (updateContactoDto.nombre !== undefined)
      data.nombre = updateContactoDto.nombre;
    if (updateContactoDto.rut !== undefined) data.rut = updateContactoDto.rut;
    if (updateContactoDto.email !== undefined)
      data.email = updateContactoDto.email;
    if (updateContactoDto.telefono !== undefined)
      data.telefono = updateContactoDto.telefono;
    if (updateContactoDto.direccion !== undefined)
      data.direccion = updateContactoDto.direccion;
    if (updateContactoDto.cargo !== undefined)
      data.cargo = updateContactoDto.cargo;
    if (updateContactoDto.contacto !== undefined)
      data.contacto = updateContactoDto.contacto;
    if (updateContactoDto.esPersonaNatural !== undefined)
      data.esPersonaNatural = updateContactoDto.esPersonaNatural;
    if (updateContactoDto.activo !== undefined)
      data.activo = updateContactoDto.activo;
    if (updateContactoDto.comunaId !== undefined)
      data.comunaId = updateContactoDto.comunaId;
    if (updateContactoDto.entidadId !== undefined)
      data.entidadId = updateContactoDto.entidadId;

    return data;
  }

  async findAll(
    filter: ContactosFilterDto,
    tenantId: string,
  ): Promise<{ contactos: ContactoResponseDto[]; total: number }> {
    try {
      const {
        search,
        activo,
        esPersonaNatural,
        entidadId,
        page = 1,
        limit = 10,
      } = filter;

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
          { rut: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { cargo: { contains: search, mode: 'insensitive' } },
          { contacto: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Active filter
      if (activo !== undefined) {
        where.activo = typeof activo === 'string' ? activo === 'true' : activo;
      }

      // Person type filter
      if (esPersonaNatural !== undefined) {
        where.esPersonaNatural =
          typeof esPersonaNatural === 'string'
            ? esPersonaNatural === 'true'
            : esPersonaNatural;
      }

      // Entidad filter
      if (entidadId) {
        where.entidadId = entidadId;
      }

      const [contactos, total] = await this.prisma.$transaction([
        this.prisma.contacto.findMany({
          where,
          include: this.getContactoInclude(),
          skip,
          take: limitNumber,
          orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
        }),
        this.prisma.contacto.count({ where }),
      ]);

      return {
        contactos: contactos.map(
          (contacto) => new ContactoResponseDto(contacto),
        ),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching contactos:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<ContactoResponseDto> {
    try {
      const contacto = await this.prisma.contacto.findFirst({
        where: {
          id,
          tenantId,
        },
        include: this.getContactoInclude(),
      });

      if (!contacto) {
        throw new NotFoundException('Contacto not found');
      }

      return new ContactoResponseDto(contacto);
    } catch (error) {
      this.logger.error(`Error fetching contacto ${id}:`, error);
      throw error;
    }
  }

  async create(
    createContactoDto: CreateContactoDto,
    tenantId: string,
  ): Promise<ContactoResponseDto> {
    try {
      // Check if RUT already exists for this tenant
      const existingContacto = await this.prisma.contacto.findFirst({
        where: {
          rut: createContactoDto.rut,
          tenantId,
        },
      });

      if (existingContacto) {
        throw new ConflictException('Contacto with this RUT already exists');
      }

      // Verify comuna exists
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: createContactoDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('Invalid comunaId');
      }

      // Verify entidad exists
      const entidad = await this.prisma.entidad.findFirst({
        where: {
          id: createContactoDto.entidadId,
          tenantId,
        },
      });

      if (!entidad) {
        throw new BadRequestException('Invalid entidadId');
      }

      const contactoData = this.prepareContactoData(
        createContactoDto,
        tenantId,
      );

      const contacto = await this.prisma.contacto.create({
        data: contactoData,
        include: this.getContactoInclude(),
      });

      this.logger.log(`Contacto created successfully: ${contacto.rut}`);
      return new ContactoResponseDto(contacto);
    } catch (error) {
      this.logger.error('Error creating contacto:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateContactoDto: UpdateContactoDto,
    tenantId: string,
  ): Promise<ContactoResponseDto> {
    try {
      // Verify contacto exists and belongs to tenant
      const existingContacto = await this.prisma.contacto.findFirst({
        where: { id, tenantId },
      });

      if (!existingContacto) {
        throw new NotFoundException('Contacto not found');
      }

      // Check for RUT conflict if RUT is being updated
      if (
        updateContactoDto.rut &&
        updateContactoDto.rut !== existingContacto.rut
      ) {
        const duplicateContacto = await this.prisma.contacto.findFirst({
          where: {
            rut: updateContactoDto.rut,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateContacto) {
          throw new ConflictException(
            'Another contacto with this RUT already exists',
          );
        }
      }

      // Verify comuna exists if comunaId is being updated
      if (updateContactoDto.comunaId) {
        const comuna = await this.prisma.comuna.findUnique({
          where: { id: updateContactoDto.comunaId },
        });

        if (!comuna) {
          throw new BadRequestException('Invalid comunaId');
        }
      }

      // Verify entidad exists if entidadId is being updated
      if (updateContactoDto.entidadId) {
        const entidad = await this.prisma.entidad.findFirst({
          where: {
            id: updateContactoDto.entidadId,
            tenantId,
          },
        });

        if (!entidad) {
          throw new BadRequestException('Invalid entidadId');
        }
      }

      const updateData = this.prepareUpdateData(updateContactoDto);

      const contacto = await this.prisma.contacto.update({
        where: { id },
        data: updateData,
        include: this.getContactoInclude(),
      });

      this.logger.log(`Contacto updated successfully: ${contacto.rut}`);
      return new ContactoResponseDto(contacto);
    } catch (error) {
      this.logger.error(`Error updating contacto ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    try {
      // Verify contacto exists and belongs to tenant
      const existingContacto = await this.prisma.contacto.findFirst({
        where: { id, tenantId },
      });

      if (!existingContacto) {
        throw new NotFoundException('Contacto not found');
      }

      // Check if contacto is used in retiros
      const retirosCount = await this.prisma.retiro.count({
        where: {
          contactoRetiroId: id,
        },
      });

      if (retirosCount > 0) {
        throw new BadRequestException(
          'Cannot deactivate contacto that is associated with retiros. Please update the retiros first.',
        );
      }

      // Soft delete by setting activo to false
      await this.prisma.contacto.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Contacto ${id} deactivated`);
      return { message: 'Contacto deactivated successfully' };
    } catch (error) {
      this.logger.error(`Error deactivating contacto ${id}:`, error);
      throw error;
    }
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<ContactoResponseDto | null> {
    try {
      const contacto = await this.prisma.contacto.findFirst({
        where: {
          rut,
          tenantId,
        },
        include: this.getContactoInclude(),
      });

      return contacto ? new ContactoResponseDto(contacto) : null;
    } catch (error) {
      this.logger.error(`Error finding contacto by RUT ${rut}:`, error);
      throw error;
    }
  }

  async findByEntidad(
    entidadId: string,
    tenantId: string,
  ): Promise<ContactoResponseDto[]> {
    try {
      const contactos = await this.prisma.contacto.findMany({
        where: {
          entidadId,
          tenantId,
          activo: true,
        },
        include: this.getContactoInclude(),
        orderBy: { nombre: 'asc' },
      });

      return contactos.map((contacto) => new ContactoResponseDto(contacto));
    } catch (error) {
      this.logger.error(
        `Error fetching contactos for entidad ${entidadId}:`,
        error,
      );
      throw error;
    }
  }
}
