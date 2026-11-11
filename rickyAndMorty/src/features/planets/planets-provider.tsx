import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getPlanets } from "@/services/planets";
import type { Planets } from "@/types/planets";
const KEY = "@planet-map/favorites-v1";
type State = {
  planets: Planets[];
  loading: boolean;
  error: string;
  retry: () => void;
  selected: Planets | null;
  select: (planet: Planets) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  storageError: string;
};
const Context = createContext<State | null>(null);
export function PlanetsProvider({ children }: PropsWithChildren) {
  const [planets, setPlanets] = useState<Planets[]>([]);
  const [selected, select] = useState<Planets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    getPlanets(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setPlanets(data);
        select((previous) => previous ?? data[0] ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "Não foi possível carregar os planetas. Verifique sua conexão.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed))
          setFavorites(
            parsed.filter((id): id is number => Number.isInteger(id)),
          );
      })
      .catch(() =>
        setStorageError("Não foi possível recuperar os favoritos salvos."),
      )
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(KEY, JSON.stringify(favorites)).catch(() =>
        setStorageError(
          "Favoritos disponíveis nesta sessão; não foi possível salvá-los.",
        ),
      );
  }, [favorites, ready]);
  const retry = useCallback(() => {
    setLoading(true);
    setError("");
    setAttempt((n) => n + 1);
  }, []);
  const toggleFavorite = useCallback(
    (id: number) =>
      setFavorites((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      ),
    [],
  );
  const value = useMemo(
    () => ({
      planets,
      loading,
      error,
      retry,
      selected,
      select,
      favorites,
      toggleFavorite,
      storageError,
    }),
    [
      planets,
      loading,
      error,
      retry,
      selected,
      favorites,
      toggleFavorite,
      storageError,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePlanets() {
  const value = useContext(Context);
  if (!value) throw new Error("usePlanets requires PlanetsProvider");
  return value;
}
