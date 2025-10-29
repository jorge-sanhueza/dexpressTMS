import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProfiles } from "@/hooks/useUsers";
import type { Profile } from "@/types/profile";
import { Loader2 } from "lucide-react";

interface ProfileSelectProps {
  onProfileSelect: (profile: Profile | null) => void;
  selectedProfile?: Profile | null;
  disabled?: boolean;
  required?: boolean;
}

export const ProfileSelect: React.FC<ProfileSelectProps> = ({
  onProfileSelect,
  selectedProfile,
  disabled = false,
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // This should return Profile[] directly based on your interfaces
  const { data: profiles, isLoading } = useProfiles({
    search: searchTerm || undefined,
    activo: true,
    limit: 20,
  });

  // Safe handling of profiles data
  const filteredProfiles: Profile[] = useMemo(() => {
    if (!profiles || !Array.isArray(profiles)) {
      console.warn("Profiles data is not an array:", profiles);
      return [];
    }
    return profiles;
  }, [profiles]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!isOpen) setIsOpen(true);
  };

  const handleProfileSelect = (profile: Profile) => {
    onProfileSelect(profile);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onProfileSelect(null);
    setSearchTerm("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const displayValue = selectedProfile ? selectedProfile.nombre : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Label htmlFor="profile-search" className="text-[#798283]">
        Perfil {required && "*"}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="profile-search"
          type="text"
          placeholder="Buscar perfil..."
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          className="pr-10 border-[#798283]/20 focus:ring-[#D42B22] focus:border-[#D42B22]"
        />
        {selectedProfile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[#798283]/60 hover:text-[#D42B22]"
          >
            ×
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#798283]/20 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[#798283]/70">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Buscando perfiles...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-4 text-center text-[#798283]/70">
              {searchTerm
                ? "No se encontraron perfiles"
                : "Escribe para buscar perfiles"}
            </div>
          ) : (
            filteredProfiles.map((profile: Profile) => (
              <button
                key={profile.id}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-[#EFF4F9] focus:bg-[#EFF4F9] focus:outline-none border-b border-[#798283]/10 last:border-b-0 transition-colors duration-150"
                onClick={() => handleProfileSelect(profile)}
              >
                <div className="font-medium text-[#798283]">
                  {profile.nombre}
                </div>
                {profile.descripcion && (
                  <div className="text-sm text-[#798283]/70 mt-1 line-clamp-2">
                    {profile.descripcion}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      profile.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile.activo ? "Activo" : "Inactivo"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      profile.tipo?.toLowerCase().includes("administrativo")
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {profile.tipo}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
