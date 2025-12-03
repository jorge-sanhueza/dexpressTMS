import { useOrderStats } from "./useOrders";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";

interface EntityStats {
  clients: number;
  addresses: number;
  carriers: number;
  shippers: number;
}

export const useDashboardStats = () => {
  const orderStats = useOrderStats();
  const { tenant } = useAuthStore();

  const { data: entityStats, isLoading: entityStatsLoading } =
    useQuery<EntityStats>({
      queryKey: ["dashboard-entity-stats", tenant?.id],
      queryFn: async (): Promise<EntityStats> => {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token");
        }

        const fetchStat = async (url: string): Promise<number> => {
          try {
            const response = await fetch(`http://localhost:3000${url}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              console.warn(`⚠️ ${url}: ${response.status}`);
              return 0;
            }

            const data = await response.json();
            return data?.total || 0;
          } catch (error) {
            console.error(`❌ ${url} error:`, error);
            return 0;
          }
        };

        // Fetch all stats in parallel
        const [clients, addresses, carriers, shippers] = await Promise.all([
          fetchStat("/api/clients/stats"),
          fetchStat("/api/direcciones/stats"),
          fetchStat("/api/carriers/stats"),
          fetchStat("/api/embarcadores/stats"),
        ]);

        const result = { clients, addresses, carriers, shippers };
        return result;
      },
      enabled: !!tenant,
      retry: 1,
    });

  return {
    orderStats: orderStats.data,
    orderStatsLoading: orderStats.isLoading,
    entityStats,
    entityStatsLoading,
    isLoading: orderStats.isLoading || entityStatsLoading,
  };
};
