import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { OrdersModule } from './orders/orders.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    TenantsModule,
    RolesModule,
    UsersModule,
    ProfilesModule,
    OrdersModule,
    ClientsModule
  ],
  controllers: [AppController],
})
export class AppModule {}
