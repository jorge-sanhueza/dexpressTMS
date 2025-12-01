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
import { EmbarcadoresModule } from './embarcadores/embarcadores.module';
import { ComunasModule } from './comunas/comunas.module';
import { CarriersModule } from './carriers/carriers.module';
import { DireccionesModule } from './direcciones/direcciones.module';
import { ContactosModule } from './contactos/contactos.module';
import { EntidadesModule } from './entidades/entidades.module';
import { TipoCargaModule } from './cargas/tipo-carga.module';
import { TipoServicioModule } from './servicios/tipo-servicio.module';

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
    ClientsModule,
    EmbarcadoresModule,
    CarriersModule,
    ComunasModule,
    DireccionesModule,
    ContactosModule,
    EntidadesModule,
    TipoCargaModule,
    TipoServicioModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
