import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  useEmbarcadores,
  useCreateEmbarcador,
  useUpdateEmbarcador,
  useDeleteEmbarcador,
} from "../../hooks/useEmbarcadores";
import type {
  Embarcador,
  CreateEmbarcadorDto,
} from "../../services/embarcadoresService";
import { WideLayout } from "../layout/WideLayout";
import { EmbarcadoresTable } from "./EmbarcadoresTable";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const EmbarcadoresList: React.FC = () => {
  const { tenant } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingEmbarcador, setEditingEmbarcador] = useState<Embarcador | null>(
    null
  );
  const [formData, setFormData] = useState<CreateEmbarcadorDto>({
    nombre: "",
    razonSocial: "",
    rut: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: "",
    comunaId: "",
    tipo: "exportador",
  });

  // We'll fetch comunas from the API - for now using mock data
  const [comunas, setComunas] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch comunas
    const mockComunas = [
      { id: "1", nombre: "Santiago" },
      { id: "2", nombre: "Providencia" },
      { id: "3", nombre: "Las Condes" },
      { id: "4", nombre: "Ñuñoa" },
      { id: "5", nombre: "Maipú" },
      { id: "6", nombre: "Puente Alto" },
    ];
    setComunas(mockComunas);
  }, []);

  // TanStack Query hooks
  const {
    data: embarcadoresData,
    isLoading,
    error,
  } = useEmbarcadores(tenant?.id || "");
  const embarcadores = embarcadoresData?.embarcadores || [];

  const createEmbarcadorMutation = useCreateEmbarcador();
  const updateEmbarcadorMutation = useUpdateEmbarcador();
  const deleteEmbarcadorMutation = useDeleteEmbarcador();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEmbarcador) {
        await updateEmbarcadorMutation.mutateAsync({
          id: editingEmbarcador.id,
          embarcadorData: formData,
        });
      } else {
        await createEmbarcadorMutation.mutateAsync(formData);
      }

      setShowForm(false);
      setEditingEmbarcador(null);
      setFormData({
        nombre: "",
        razonSocial: "",
        rut: "",
        contacto: "",
        email: "",
        telefono: "",
        direccion: "",
        comunaId: "",
        tipo: "exportador",
      });
    } catch (err) {
      console.error("Failed to save embarcador:", err);
    }
  };

  const navigate = useNavigate();

  const handleView = (embarcadorId: string) => {
    navigate(`/embarcadores/${embarcadorId}`);
  };

  const handleEdit = (embarcador: Embarcador) => {
    setEditingEmbarcador(embarcador);
    setFormData({
      nombre: embarcador.nombre,
      razonSocial: embarcador.razonSocial,
      rut: embarcador.rut,
      contacto: embarcador.contacto,
      email: embarcador.email,
      telefono: embarcador.telefono,
      direccion: embarcador.direccion,
      comunaId: embarcador.comunaId,
      tipo: embarcador.tipo,
    });
    setShowForm(true);
  };

  const handleDelete = async (embarcadorId: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este embarcador?")
    ) {
      try {
        await deleteEmbarcadorMutation.mutateAsync(embarcadorId);
      } catch (err) {
        console.error("Failed to delete embarcador:", err);
      }
    }
  };

  const isInitialLoad = isLoading && embarcadores.length === 0;

  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando embarcadores...</div>
      </div>
    );
  }

  return (
    <WideLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">
                Gestión de Embarcadores
              </h2>
              <p className="text-[#798283]/70">
                Crear y administrar embarcadores{" "}
                {tenant && `- ${tenant.nombre}`}
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
            >
              + Nuevo Embarcador
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {(error ||
          createEmbarcadorMutation.error ||
          updateEmbarcadorMutation.error ||
          deleteEmbarcadorMutation.error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">
              {error?.message ||
                createEmbarcadorMutation.error?.message ||
                updateEmbarcadorMutation.error?.message ||
                deleteEmbarcadorMutation.error?.message}
            </div>
          </div>
        )}

        {/* Embarcador Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
            <h3 className="text-lg font-semibold text-[#798283] mb-4">
              {editingEmbarcador
                ? "Editar Embarcador"
                : "Crear Nuevo Embarcador"}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Form fields remain the same */}
              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="Nombre del embarcador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) =>
                    setFormData({ ...formData, razonSocial: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="Razón social"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  RUT *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rut}
                  onChange={(e) =>
                    setFormData({ ...formData, rut: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, contacto: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="Persona de contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="email@empresa.cl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="+56912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Comuna *
                </label>
                <select
                  required
                  value={formData.comunaId}
                  onChange={(e) =>
                    setFormData({ ...formData, comunaId: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                >
                  <option value="">Seleccionar comuna</option>
                  {comunas.map((comuna) => (
                    <option key={comuna.id} value={comuna.id}>
                      {comuna.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Tipo *
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="w-full px-2 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22] disabled:opacity-50"
                >
                  <option value="exportador">Exportador</option>
                  <option value="importador">Importador</option>
                  <option value="nacional">Nacional</option>
                </select>
              </div>

              <div className="md:col-span-2 flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                >
                  {createEmbarcadorMutation.isPending ||
                  updateEmbarcadorMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingEmbarcador ? "Actualizando..." : "Creando..."}
                    </div>
                  ) : editingEmbarcador ? (
                    "Actualizar Embarcador"
                  ) : (
                    "Crear Embarcador"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmbarcador(null);
                    setFormData({
                      nombre: "",
                      razonSocial: "",
                      rut: "",
                      contacto: "",
                      email: "",
                      telefono: "",
                      direccion: "",
                      comunaId: "",
                      tipo: "exportador",
                    });
                  }}
                  disabled={
                    createEmbarcadorMutation.isPending ||
                    updateEmbarcadorMutation.isPending
                  }
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10 p-6">
            <EmbarcadoresTable
              data={embarcadores}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </WideLayout>
  );
};
