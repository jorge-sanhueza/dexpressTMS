import { Module } from '@nestjs/common';
import { CarriersController } from './controllers/carriers.controller';
import { CarriersService } from './services/carriers.service';

@Module({
  controllers: [CarriersController],
  providers: [CarriersService],
  exports: [CarriersService],
})
export class CarriersModule {}
