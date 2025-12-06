export const validateCoordinates = (
  latitud?: number,
  longitud?: number
): { valid: boolean; message?: string } => {
  if (latitud === undefined || longitud === undefined) {
    return { valid: false, message: "Ambas coordenadas son requeridas" };
  }

  if (latitud < -90 || latitud > 90) {
    return {
      valid: false,
      message: "Latitud debe estar entre -90 y 90 grados",
    };
  }

  if (longitud < -180 || longitud > 180) {
    return {
      valid: false,
      message: "Longitud debe estar entre -180 y 180 grados",
    };
  }

  return { valid: true };
};

export const formatCoordinates = (
  latitud?: number,
  longitud?: number
): string => {
  if (!latitud || !longitud) return "Sin coordenadas";

  const latDir = latitud >= 0 ? "N" : "S";
  const lngDir = longitud >= 0 ? "E" : "O";

  return `${Math.abs(latitud).toFixed(6)}° ${latDir}, ${Math.abs(
    longitud
  ).toFixed(6)}° ${lngDir}`;
};

export const generateGoogleMapsLink = (
  latitud?: number,
  longitud?: number
): string | null => {
  if (!latitud || !longitud) return null;
  return `https://www.google.com/maps?q=${latitud},${longitud}`;
};

export const generateStaticMapUrl = (
  latitud: number,
  longitud: number,
  apiKey: string,
  width = 400,
  height = 300,
  zoom = 15
): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitud},${longitud}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitud},${longitud}&key=${apiKey}`;
};
