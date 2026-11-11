import type { Planets, Resident, PlanetDetails } from "@/types/planets";
const BASE = "https://rickandmortyapi.com/api";
type Page = { info: { pages: number }; results: Planets[] };
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE}/${path}`, { signal });
  if (!response.ok)
    throw new Error("Não foi possível conectar à API. Tente novamente.");
  return response.json();
}
export async function getPlanets(signal?: AbortSignal): Promise<Planets[]> {
  const first = await request<Page>("location?type=Planet", signal);
  const pages = await Promise.all(
    Array.from({ length: first.info.pages - 1 }, (_, i) =>
      request<Page>(`location?type=Planet&page=${i + 2}`, signal),
    ),
  );
  return [first, ...pages].flatMap((page) => page.results);
}
const detailsCache = new Map<number, PlanetDetails>();
export async function getPlanetDetails(
  planet: Planets,
  signal?: AbortSignal,
): Promise<PlanetDetails> {
  const cached = detailsCache.get(planet.id);
  if (cached) return cached;
  const ids = planet.residents
    .map((url) => url.split("/").pop())
    .filter((id) => /^\d+$/.test(id ?? ""));
  const residents: Resident[] = [];
  // Small batches avoid oversized requests on heavily populated planets.
  for (let i = 0; i < ids.length; i += 20) {
    const batch = await request<Resident | Resident[]>(
      `character/${ids.slice(i, i + 20).join(",")}`,
      signal,
    );
    residents.push(...(Array.isArray(batch) ? batch : [batch]));
  }
  const details = {
    residents,
    episodeCount: new Set(residents.flatMap((resident) => resident.episode))
      .size,
  };
  detailsCache.set(planet.id, details);
  return details;
}
