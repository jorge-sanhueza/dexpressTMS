import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ContactosService } from '../service/contactos.service';
import { ContactosFilterDto } from '../dto/contactos-filter.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { UpdateContactoDto } from '../dto/update-contacto.dto';
import { ContactoResponseDto } from '../dto/contacto-response.dto';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';

@Controller('api/contactos')
@UseGuards(JwtGuard)
export class ContactosController {
  private readonly logger = new Logger(ContactosController.name);

  constructor(private readonly contactosService: ContactosService) {}

  @Get()
  findAll(@Query() filter: ContactosFilterDto, @TenantId() tenantId: string) {
    this.logger.verbose(`findAll for tenant: ${tenantId}`);
    return this.contactosService.findAll(filter, tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<ContactoResponseDto> {
    return this.contactosService.findOne(id, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateContactoDto,
    @TenantId() tenantId: string,
  ): Promise<ContactoResponseDto> {
    this.logger.log(`Creating contacto for tenant: ${tenantId}`);
    return this.contactosService.create(dto, tenantId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactoDto,
    @TenantId() tenantId: string,
  ): Promise<ContactoResponseDto> {
    return this.contactosService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<{ message: string }> {
    this.logger.warn(`Deactivating contacto ${id}`);
    return this.contactosService.remove(id, tenantId);
  }

  @Get('rut/:rut')
  findByRut(
    @Param('rut') rut: string,
    @TenantId() tenantId: string,
  ): Promise<ContactoResponseDto | null> {
    return this.contactosService.findByRut(rut.trim(), tenantId);
  }

  @Get('entidad/:entidadId')
  findByEntidad(
    @Param('entidadId', ParseUUIDPipe) entidadId: string,
    @TenantId() tenantId: string,
  ): Promise<ContactoResponseDto[]> {
    return this.contactosService.findByEntidad(entidadId, tenantId);
  }
}
