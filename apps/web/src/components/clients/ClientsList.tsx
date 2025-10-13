import React, { useState, useEffect } from "react";
import { Layout } from "../layout/Layout";
import { clientsService } from "../../services/clientsService";
import type { Client, ClientsFilter } from "../../types/client";
import { useAuthStore } from "../../store/authStore";

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientsFilter>({});
  const [total, setTotal] = useState(0);
  const { hasPermission } = useAuthStore();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const result = await clientsService.getClients(filter);
      setClients(result.clients);
      setTotal(result.total);
      console.log(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [filter]);

  const handleSearch = (searchTerm: string) => {
    setFilter((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (activo: boolean | undefined) => {
    setFilter((prev) => ({ ...prev, activo, page: 1 }));
  };

  const handleDeactivate = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea desactivar este cliente?")) {
      try {
        await clientsService.deactivateClient(id);
        await fetchClients(); // Refresh the list
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error deactivating client"
        );
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await clientsService.activateClient(id);
      await fetchClients(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error activating client");
    }
  };

  const canManageClients = hasPermission("admin_access");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#798283]">Clientes</h2>
            <p className="text-[#798283]/70 mt-1">
              Gestiona los clientes de tu organización
            </p>
          </div>
          {canManageClients && (
            <button className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Nuevo Cliente
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar clientes por nombre, RUT o contacto..."
                className="w-full px-4 py-3 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter(undefined)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  filter.activo === undefined
                    ? "bg-[#798283] text-[#798283] border-[#798283]"
                    : "bg-[#798283] text-[#798283] border-[#798283]/30 hover:bg-[#EFF4F9]"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handleStatusFilter(true)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  filter.activo === true
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-green-600 border-green-600 hover:bg-green-50"
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => handleStatusFilter(false)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  filter.activo === false
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                }`}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#798283]/10">
              <thead className="bg-[#EFF4F9]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#798283]/10">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#EFF4F9] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[#798283]">
                          {client.nombre}
                        </div>
                        <div className="text-sm text-[#798283]/70">
                          {client.rut}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#798283]">
                        {client.contacto}
                      </div>
                      <div className="text-sm text-[#798283]/70">
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          client.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {client.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          Ver
                        </button>
                        {canManageClients && (
                          <>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              Editar
                            </button>
                            {client.activo ? (
                              <button
                                onClick={() => handleDeactivate(client.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(client.id)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                              >
                                Activar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-[#798283]/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-[#798283]">
                No se encontraron clientes
              </h3>
              <p className="mt-2 text-sm text-[#798283]/70">
                {filter.search || filter.activo !== undefined
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Comienza agregando tu primer cliente."}
              </p>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22]"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};
