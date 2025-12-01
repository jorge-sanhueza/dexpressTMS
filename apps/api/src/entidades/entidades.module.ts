import { Module } from '@nestjs/common';
import { EntidadesService } from './services/entidades.service';
import { EntidadesController } from './controller/entidades.controller';

@Module({
  controllers: [EntidadesController],
  providers: [EntidadesService],
  exports: [EntidadesService],
})
export class EntidadesModule {}
