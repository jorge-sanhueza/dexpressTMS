import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Logger,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ContactosService } from '../service/contactos.service';
import { ContactosFilterDto } from '../dto/contactos-filter.dto';
import { ContactoResponseDto } from '../dto/contacto-response.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { UpdateContactoDto } from '../dto/update-contacto.dto';

@Controller('api/contactos')
@UseGuards(JwtGuard)
export class ContactosController {
  private readonly logger = new Logger(ContactosController.name);

  constructor(private readonly contactosService: ContactosService) {}

  private getTenantId(req: any): string {
    const tenantId =
      req.user?.tenant_id || req.user?.tenantId || req.user?.tenant?.id;

    this.logger.debug(`Extracted tenantId: ${tenantId}`);

    if (!tenantId) {
      throw new Error('Tenant ID not found in user object');
    }

    return tenantId;
  }

  @Get()
  async findAll(@Query() filter: ContactosFilterDto, @Request() req: any) {
    const tenantId = this.getTenantId(req);
    return this.contactosService.findAll(filter, tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<ContactoResponseDto> {
    const tenantId = this.getTenantId(req);
    return this.contactosService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createContactoDto: CreateContactoDto,
    @Request() req: any,
  ): Promise<ContactoResponseDto> {
    const tenantId = this.getTenantId(req);
    return this.contactosService.create(createContactoDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactoDto: UpdateContactoDto,
    @Request() req: any,
  ): Promise<ContactoResponseDto> {
    const tenantId = this.getTenantId(req);
    return this.contactosService.update(id, updateContactoDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    return this.contactosService.remove(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @Request() req: any,
  ): Promise<ContactoResponseDto | null> {
    const tenantId = this.getTenantId(req);
    return this.contactosService.findByRut(rut, tenantId);
  }

  @Get('entidad/:entidadId')
  async findByEntidad(
    @Param('entidadId', ParseUUIDPipe) entidadId: string,
    @Request() req: any,
  ): Promise<ContactoResponseDto[]> {
    const tenantId = this.getTenantId(req);
    return this.contactosService.findByEntidad(entidadId, tenantId);
  }
}
