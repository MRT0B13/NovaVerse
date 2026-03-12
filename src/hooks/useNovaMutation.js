import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../components/nova/AuthContext';
import { toast } from 'sonner';

/**
 * Thin wrapper around React Query's useMutation that uses apiFetch.
 * @param {string} path           - API path, e.g. '/launches/123'
 * @param {object} options         - { method, invalidateKeys, successMessage, onSuccess, ... }
 */
export default function useNovaMutation(path, options = {}) {
  const apiFetch = useApi();
  const queryClient = useQueryClient();
  const { method = 'POST', invalidateKeys, successMessage, ...rest } = options;

  return useMutation({
    mutationFn: (body) =>
      apiFetch(path, {
        method,
        body: body != null ? JSON.stringify(body) : undefined,
      }),
    onSuccess: (data, variables, context) => {
      if (successMessage) toast.success(successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((k) =>
          queryClient.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] })
        );
      }
      rest.onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}
