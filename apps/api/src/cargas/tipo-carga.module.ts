import { Module } from '@nestjs/common';
import { TipoCargaController } from './controllers/tipo-carga.controller';
import { TipoCargaService } from './services/tipo-carga.service';

@Module({
  controllers: [TipoCargaController],
  providers: [TipoCargaService],
})
export class TipoCargaModule {}
