export type Planets = {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
};
export type Resident = {
  id: number;
  name: string;
  image: string;
  species: string;
  status: "Alive" | "Dead" | "unknown";
  episode: string[];
};
export type PlanetDetails = { residents: Resident[]; episodeCount: number };
