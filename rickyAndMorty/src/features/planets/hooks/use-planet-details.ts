import { useCallback, useEffect, useState } from "react";
import { getPlanetDetails } from "@/services/planets";
import type { Planets, PlanetDetails } from "@/types/planets";
export function usePlanetDetails(planet: Planets | null) {
  const [state, setState] = useState<{
    id: number;
    attempt: number;
    data?: PlanetDetails;
    error?: string;
  }>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!planet) return;
    const controller = new AbortController();
    getPlanetDetails(planet, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ id: planet.id, attempt, data });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({
            id: planet.id,
            attempt,
            error: "Não foi possível carregar os moradores.",
          });
      });
    return () => controller.abort();
  }, [planet, attempt]);
  const current =
    state?.id === planet?.id && state?.attempt === attempt ? state : undefined;
  return {
    details: current?.data,
    error: current?.error,
    retry: useCallback(() => setAttempt((n) => n + 1), []),
  };
}
