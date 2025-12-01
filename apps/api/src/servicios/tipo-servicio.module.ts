// backend: app.module.ts or relevant module
import { Module } from '@nestjs/common';
import { TipoServicioController } from './controllers/tipo-servicio.controller';
import { TipoServicioService } from './services/tipo-servicio.service';

@Module({
  controllers: [TipoServicioController],
  providers: [TipoServicioService],
})
export class TipoServicioModule {}
