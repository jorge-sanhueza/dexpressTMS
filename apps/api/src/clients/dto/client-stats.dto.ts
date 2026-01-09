export class ClientStatsDto {
  total: number;
  activos: number;
  inactivos: number;

  constructor(stats?: Partial<ClientStatsDto>) {
    this.total = stats?.total ?? 0;
    this.activos = stats?.activos ?? 0;
    this.inactivos = stats?.inactivos ?? 0;
  }
}
