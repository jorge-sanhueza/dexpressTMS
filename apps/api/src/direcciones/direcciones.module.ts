import { Module } from '@nestjs/common';
import { DireccionesController } from './controllers/direcciones.controller';
import { DireccionesService } from './services/direcciones.service';

@Module({
  controllers: [DireccionesController],
  providers: [DireccionesService],
  exports: [DireccionesService],
})
export class DireccionesModule {}
