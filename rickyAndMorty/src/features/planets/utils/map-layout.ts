// The API has no coordinates. A seeded, jittered grid is a visual layout only.
// The full catalog determines positions, so filtering never moves a planet.
export function planetPosition(id: number, index: number, total: number) {
  const columns = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / columns);
  const random = (seed: number) => {
    const n = Math.sin(seed * 127.1) * 43758.5453;
    return n - Math.floor(n);
  };
  return {
    x: ((index % columns) + 0.25 + random(id) * 0.5) / columns,
    y: (Math.floor(index / columns) + 0.25 + random(id + 83) * 0.5) / rows,
  };
}
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
