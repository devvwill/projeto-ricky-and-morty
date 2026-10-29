import { Planets } from "@/types/planets";

type PlanetsResponse = {
  results: Planets[];
};

export async function getPlanets(): Promise<Planets[]> {
  const response = await fetch(
   "https://rickandmortyapi.com/api/location?type=Planet"
  );

  if (!response.ok) {
    throw new Error("Não foi possível buscar os planetas.");
  }

  const dados: PlanetsResponse = await response.json();


  return dados.results;
}