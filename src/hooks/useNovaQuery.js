import { useQuery } from '@tanstack/react-query';
import { useApi } from '../components/nova/AuthContext';

/**
 * Thin wrapper around React Query's useQuery that uses apiFetch.
 * @param {string|string[]} key  - Query key (string or array)
 * @param {string} path          - API path, e.g. '/portfolio'
 * @param {object} options       - Extra useQuery options (staleTime, refetchInterval, enabled, etc.)
 */
export default function useNovaQuery(key, path, options = {}) {
  const apiFetch = useApi();
  const queryKey = Array.isArray(key) ? key : [key];

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => apiFetch(path, { signal }),
    ...options,
  });
}
