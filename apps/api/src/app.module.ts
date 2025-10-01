import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [AppConfigModule, PrismaModule, AuthModule, TenantsModule, RolesModule],
  controllers: [AppController],
})
export class AppModule {}
