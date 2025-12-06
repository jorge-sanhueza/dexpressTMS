import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  User,
  Building,
  FileText,
  Globe,
  Map,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Contacto } from "@/types/contacto";
import { formatDate } from "@/lib/utils";

interface ContactoDetailsModalProps {
  contacto: Contacto;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactoDetailsModal: React.FC<ContactoDetailsModalProps> = ({
  contacto,
  isOpen,
  onClose,
}) => {
  const formatLocation = () => {
    if (!contacto.comuna) return "No especificada";

    const parts = [contacto.comuna.nombre];

    // Add provincia if it exists
    if (contacto.comuna.provincia?.nombre) {
      parts.push(contacto.comuna.provincia.nombre);
    }

    // Add region if it exists (through provincia)
    if (contacto.comuna.provincia?.region?.nombre) {
      parts.push(contacto.comuna.provincia.region.nombre);
    }

    return parts.join(", ") || "No especificada";
  };

  // Alternative: A safer approach with type checking
  const getLocationDetails = () => {
    if (!contacto.comuna) {
      return {
        comuna: null,
        provincia: null,
        region: null,
      };
    }

    return {
      comuna: contacto.comuna.nombre,
      provincia: contacto.comuna.provincia?.nombre,
      region: contacto.comuna.provincia?.region?.nombre,
    };
  };

  const location = getLocationDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl text-[#798283] flex items-center gap-2">
                <User className="h-6 w-6" />
                Detalles del Contacto
              </DialogTitle>
              <DialogDescription>
                Información completa de {contacto.nombre}
              </DialogDescription>
            </div>
            <Badge
              variant={contacto.activo ? "default" : "secondary"}
              className={
                contacto.activo
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {contacto.activo ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {contacto.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">
                    Nombre Completo
                  </p>
                  <p className="font-medium text-[#798283]">
                    {contacto.nombre}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">RUT</p>
                  <p className="font-medium text-[#798283]">{contacto.rut}</p>
                </div>

                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">
                    Contacto Principal
                  </p>
                  <p className="font-medium text-[#798283]">
                    {contacto.contacto || "No especificado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">Tipo</p>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                  >
                    {contacto.esPersonaNatural ? "Persona Natural" : "Empresa"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#798283]/70 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Correo Electrónico
                    </p>
                    <a
                      href={`mailto:${contacto.email}`}
                      className="font-medium text-[#798283] hover:text-[#D42B22] transition-colors"
                    >
                      {contacto.email || "No especificado"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#798283]/70 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">Teléfono</p>
                    <a
                      href={`tel:${contacto.telefono}`}
                      className="font-medium text-[#798283] hover:text-[#D42B22] transition-colors"
                    >
                      {contacto.telefono || "No especificado"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#798283]/70 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-[#798283]/70 mb-1">Dirección</p>
                    <p className="font-medium text-[#798283]">
                      {contacto.direccion || "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information Card */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4 flex items-center gap-2">
                <Map className="h-5 w-5" />
                Ubicación
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-[#798283]/70 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Ubicación Geográfica
                    </p>
                    <p className="font-medium text-[#798283]">
                      {formatLocation()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#798283]/70 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">Comuna ID</p>
                    <p className="font-medium text-[#798283]">
                      {contacto.comunaId || "No especificada"}
                    </p>
                  </div>
                </div>

                {/* Optional: Display individual location components */}
                {location.comuna && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="text-xs text-[#798283]/60 mb-1">Comuna</p>
                      <p className="text-sm font-medium text-[#798283]">
                        {location.comuna}
                      </p>
                    </div>
                    {location.provincia && (
                      <div>
                        <p className="text-xs text-[#798283]/60 mb-1">
                          Provincia
                        </p>
                        <p className="text-sm font-medium text-[#798283]">
                          {location.provincia}
                        </p>
                      </div>
                    )}
                    {location.region && (
                      <div>
                        <p className="text-xs text-[#798283]/60 mb-1">Región</p>
                        <p className="text-sm font-medium text-[#798283]">
                          {location.region}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Professional & Entity Information */}
          <div className="space-y-6">
            {/* Professional Information Card */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Información Profesional
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">Cargo</p>
                  <p className="font-medium text-[#798283]">
                    {contacto.cargo || "No especificado"}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-[#798283]/70 mb-1">
                    ID del Contacto
                  </p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#798283]/50" />
                    <code className="text-xs bg-white px-2 py-1 rounded border border-[#798283]/20 text-[#798283] font-mono">
                      {contacto.id}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Entity Information Card */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Entidad Asociada
              </h3>

              {contacto.entidad ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Nombre de la Entidad
                    </p>
                    <p className="font-medium text-[#798283]">
                      {contacto.entidad.nombre}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      RUT de la Entidad
                    </p>
                    <p className="font-medium text-[#798283]">
                      {contacto.entidad.rut}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Tipo de Entidad
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 hover:bg-purple-50"
                    >
                      {contacto.entidad.tipoEntidad || "No especificado"}
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-[#798283]/70 mb-1">
                      ID de la Entidad
                    </p>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#798283]/50" />
                      <code className="text-xs bg-white px-2 py-1 rounded border border-[#798283]/20 text-[#798283] font-mono truncate">
                        {contacto.entidad.id}
                      </code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Building className="h-10 w-10 text-[#798283]/30 mx-auto mb-2" />
                  <p className="text-[#798283]/70">No hay entidad asociada</p>
                </div>
              )}
            </div>

            {/* System Information Card */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Sistema
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">
                    ID del Tenant
                  </p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#798283]/50" />
                    <code className="text-xs bg-white px-2 py-1 rounded border border-[#798283]/20 text-[#798283] font-mono truncate">
                      {contacto.tenantId}
                    </code>
                  </div>
                </div>

                <Separator className="my-2" />

                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">
                    Fecha de Creación
                  </p>
                  <p className="font-medium text-[#798283]">
                    {contacto.createdAt
                      ? formatDate(contacto.createdAt)
                      : "No disponible"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#798283]/70 mb-1">
                    Última Actualización
                  </p>
                  <p className="font-medium text-[#798283]">
                    {contacto.updatedAt
                      ? formatDate(contacto.updatedAt)
                      : "No disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#798283]/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
          >
            Cerrar
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#D42B22]/30 text-[#D42B22] hover:bg-[#D42B22]/10"
          >
            Imprimir Detalles
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
