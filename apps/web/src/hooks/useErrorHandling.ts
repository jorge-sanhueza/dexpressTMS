import { useMemo } from "react";
import {
  getFirstErrorMessage,
  getOperationErrorMessage,
  type ErrorCollection,
} from "@/lib/error-handling";

export const useErrorHandling = () => {
  const getErrorMessage = useMemo(() => getOperationErrorMessage, []);
  const getFirstError = useMemo(() => getFirstErrorMessage, []);

  return {
    getErrorMessage,
    getFirstError,
  };
};

// Hook specifically for handling multiple mutations and queries
export const useCompositeError = (
  errors: ErrorCollection[]
): { message: string | null; hasError: boolean } => {
  return useMemo(() => {
    const message = getFirstErrorMessage(errors);
    return {
      message,
      hasError: !!message,
    };
  }, [errors]);
};

// Hook for form/mutation error handling
export const useMutationError = (
  mutation: { error?: unknown },
  operation: string = "save"
) => {
  return useMemo(() => {
    if (!mutation.error) return null;
    return getOperationErrorMessage(operation, mutation.error);
  }, [mutation.error, operation]);
};
