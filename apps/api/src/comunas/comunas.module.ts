import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ComunasController } from './controllers/comunas.controller';

@Module({
  controllers: [ComunasController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class ComunasModule {}
