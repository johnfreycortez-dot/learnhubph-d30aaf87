import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { gasCall } from "@/lib/api";

/**
 * Thin wrapper around gasCall + @tanstack/react-query.
 *
 * Replaces the old per-component `useAsync(() => gasCall(...))` pattern with
 * a cached, deduped, auto-retrying query. Same GAS `action` + `params` will
 * now share a cache entry across components instead of re-fetching on every
 * mount, and failed requests get a couple of automatic retries instead of
 * failing silently on a flaky connection.
 *
 * `params` is included in the query key so calls with different arguments
 * (e.g. a different lessonId) are cached separately.
 */
export function useGasQuery<T = any>(
  action: string,
  params: any[] = [],
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery<T>({
    queryKey: [action, ...params],
    queryFn: () => gasCall(action, ...params),
    ...options,
  });
}

/**
 * For gasCall actions that write data (admin*Save, adminDelete*, submit*,
 * etc). Wraps the call in useMutation and, when `invalidates` is given,
 * invalidates those query keys on success so any on-screen list refreshes
 * automatically instead of needing a manual refetch() call at every call site.
 */
export function useGasMutation<T = any>(
  action: string,
  options?: { invalidates?: string[] },
) {
  const queryClient = useQueryClient();
  return useMutation<T, unknown, any[]>({
    mutationFn: (params: any[] = []) => gasCall(action, ...params),
    onSuccess: () => {
      options?.invalidates?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
}
