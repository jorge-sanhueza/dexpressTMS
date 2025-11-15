import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { ContactosController } from './controller/contactos.controller';
import { ContactosService } from './service/contactos.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContactosController],
  providers: [ContactosService],
  exports: [ContactosService],
})
export class ContactosModule {}
