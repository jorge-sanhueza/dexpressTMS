import React, { useState, useEffect, useCallback } from "react";
import { usersService } from "../../services/usersService";
import type { User, UsersFilter } from "../../types/user";
import { UserCreationModal } from "./UserCreationModal";

export const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UsersFilter>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getUsers(filter);
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading users");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        search: searchTerm || undefined,
        page: 1,
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (activo: boolean | undefined) => {
    setFilter((prev) => ({
      ...prev,
      activo: activo,
      page: 1,
    }));
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!window.confirm("¿Seguro de que desea desactivar este usuario?")) {
      return;
    }

    try {
      await usersService.deactivateUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deactivating user");
    }
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (activo: boolean) => {
    return activo ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactivo
      </span>
    );
  };

  const getProfileTypeBadge = (profileType?: string) => {
    const profileMap: { [key: string]: { color: string; text: string } } = {
      administrativo: {
        color: "bg-purple-100 text-purple-800",
        text: "Administrativo",
      },
      standard: { color: "bg-blue-100 text-blue-800", text: "Estándar" },
      operativo: { color: "bg-orange-100 text-orange-800", text: "Operativo" },
    };

    const profile =
      profileMap[profileType || "standard"] || profileMap.standard;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.color}`}
      >
        {profile.text}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#798283]">
              Gestión de Usuarios
            </h2>
            <p className="text-[#798283]/70 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#D42B22] hover:bg-[#B3251E] text-[#798283] px-4 py-2 rounded-lg transition-colors duration-200 font-semibold"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, email o contacto..."
              className="w-full px-4 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter(undefined)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                filter.activo === undefined
                  ? "bg-[#D42B22] text-[#D42B22]"
                  : "bg-[#EFF4F9] text-[#798283] hover:bg-[#E0E8F0]"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleStatusFilter(true)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                filter.activo === true
                  ? "bg-green-600 text-[#D42B22]"
                  : "bg-[#EFF4F9] text-[#798283] hover:bg-[#E0E8F0]"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => handleStatusFilter(false)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                filter.activo === false
                  ? "bg-red-600 text-[#D42B22]"
                  : "bg-[#EFF4F9] text-[#798283] hover:bg-[#E0E8F0]"
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#798283]/10">
            <thead className="bg-[#EFF4F9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#798283] uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#798283] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#798283]/10">
              {users.map((user) => {
                console.log('User data:', user)
                return(
                <tr
                  key={user.id}
                  className="hover:bg-[#EFF4F9]/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#798283]">
                        {user.nombre}
                      </div>
                      <div className="text-sm text-[#798283]/70">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#798283]">
                      {user.telefono || "No especificado"}
                    </div>
                    <div className="text-sm text-[#798283]/70">
                      {user.contacto || "Sin contacto"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getProfileTypeBadge(user.profile_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.activo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#798283]">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200">
                        Editar
                      </button>
                      {user.activo && (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-[#798283]/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-[#798283]">
              No se encontraron usuarios
            </h3>
            <p className="mt-1 text-sm text-[#798283]/70">
              {filter.search
                ? "Intenta con otros términos de búsqueda."
                : "No hay usuarios registrados en el sistema."}
            </p>
          </div>
        )}

        {/* Loading State for table rows */}
        {loading && users.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22]"></div>
          </div>
        )}
      </div>
      <UserCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};
