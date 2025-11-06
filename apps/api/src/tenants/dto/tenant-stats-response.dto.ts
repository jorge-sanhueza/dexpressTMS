import { TipoTenant } from '@prisma/client';

export class TenantStatsResponseDto {
  tenant: {
    id: string;
    nombre: string;
    tipoTenant: TipoTenant;
    activo: boolean;
  };
  statistics: {
    totalUsers: number;
    activeUsers: number;
    totalProfiles: number;
    totalRoles: number;
  };

  constructor(stats: any) {
    this.tenant = stats.tenant;
    this.statistics = stats.statistics;
  }
}
