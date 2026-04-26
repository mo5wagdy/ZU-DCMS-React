import { useEffect, useRef, useState } from "react";

/**
 * Generic data-fetching hook.
 *
 * Wraps a single async call with three pieces of state (data/loading/error),
 * cancels late responses on unmount, and exposes a manual refetch handle.
 *
 * Removes the boilerplate `useEffect + isMounted` pattern duplicated across
 * almost every page. Single Responsibility: fetch + own its own lifecycle.
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // bumping this triggers a refetch via the deps array
  const [tick, setTick] = useState(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => {
        if (aliveRef.current) setData(d);
      })
      .catch((e) => {
        if (aliveRef.current) setError((e as Error).message);
      })
      .finally(() => {
        if (aliveRef.current) setLoading(false);
      });
    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return {
    data,
    loading,
    error,
    refetch: () => setTick((n) => n + 1),
    setData,
  };
}
