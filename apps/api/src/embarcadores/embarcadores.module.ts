import { Module } from '@nestjs/common';
import { EmbarcadoresController } from './controllers/embarcadores.controller';
import { EmbarcadoresService } from './services/embarcadores.service';

@Module({
  controllers: [EmbarcadoresController],
  providers: [EmbarcadoresService],
  exports: [EmbarcadoresService],
})
export class EmbarcadoresModule {}