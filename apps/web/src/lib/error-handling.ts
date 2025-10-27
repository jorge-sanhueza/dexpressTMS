// ========== ERROR TYPES ==========

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface BackendError extends ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface ErrorDisplayProps {
  message: string;
  title?: string;
  variant?: "default" | "destructive" | "success";
  className?: string;
}

// ========== TYPE GUARDS ==========

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}

export function isBackendError(error: unknown): error is BackendError {
  return isApiError(error) && "statusCode" in error && "error" in error;
}

export function isNetworkError(error: unknown): error is { message: string } {
  if (!isApiError(error)) return false;

  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("internet") ||
    errorMessage.includes("connection")
  );
}

// ========== ERROR MESSAGE HANDLERS ==========

export const getErrorMessage = (error: unknown): string => {
  if (!error) return "Ha ocurrido un error inesperado";

  // Backend errors with status codes
  if (isBackendError(error)) {
    switch (error.statusCode) {
      case 400:
        return (
          error.message ||
          "Solicitud incorrecta. Verifica los datos ingresados."
        );

      case 401:
        return "No autorizado. Tu sesión puede haber expirado.";

      case 403:
        return "No tienes permisos para realizar esta acción.";

      case 404:
        return "Recurso no encontrado. Puede haber sido eliminado o no existir.";

      case 409:
        return "Conflicto: El recurso ya existe o hay datos duplicados.";

      case 500:
        return "Error interno del servidor. Por favor, intenta nuevamente más tarde.";

      default:
        return error.message || `Error del servidor (${error.statusCode})`;
    }
  }

  // API errors without specific status codes
  if (isApiError(error)) {
    if (error.message.includes("RUT")) {
      return "Ya existe un registro con este RUT. Por favor, verifica el RUT ingresado.";
    }
    return error.message;
  }

  // Network errors
  if (isNetworkError(error)) {
    return "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.";
  }

  // Generic errors
  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.";
};

export const getOperationErrorMessage = (
  operation: string,
  error: unknown
): string => {
  const baseMessage = getErrorMessage(error);

  const operationMessages: Record<string, string> = {
    create: `Error al crear: ${baseMessage}`,
    update: `Error al actualizar: ${baseMessage}`,
    deactivate: `Error al desactivar: ${baseMessage}`,
    activate: `Error al activar: ${baseMessage}`,
    delete: `Error al eliminar: ${baseMessage}`,
    fetch: `Error al cargar los datos: ${baseMessage}`,
    save: `Error al guardar: ${baseMessage}`,
    load: `Error al cargar: ${baseMessage}`,
  };

  return operationMessages[operation] || baseMessage;
};

// ========== ERROR EXTRACTION UTILITIES ==========

export interface ErrorCollection {
  error?: unknown;
  operation?: string;
}

export const getFirstErrorMessage = (
  errors: ErrorCollection[]
): string | null => {
  const firstError = errors.find(({ error }) => error);
  if (!firstError) return null;

  return getOperationErrorMessage(
    firstError.operation || "fetch",
    firstError.error
  );
};

export const extractMutationErrors = (
  mutations: Array<{ error?: unknown }>
): ErrorCollection[] => {
  return mutations.map((mutation) => ({
    error: mutation.error,
    operation: "save",
  }));
};
