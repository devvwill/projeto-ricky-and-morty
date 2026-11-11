import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getPlanets, getPlanetDetails } from "../src/services/planets.ts";
import {
  normalize,
  planetPosition,
} from "../src/features/planets/utils/map-layout.ts";
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const reply = (body) => ({ ok: true, json: async () => body });

test("loads every planet page in API order", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    const page = Number(new URL(url).searchParams.get("page") || 1);
    return reply({ info: { pages: 3 }, results: [{ id: page }] });
  };
  assert.deepEqual(
    (await getPlanets()).map((planet) => planet.id),
    [1, 2, 3],
  );
  assert.equal(calls.length, 3);
  assert.ok(
    calls.every((url) => new URL(url).searchParams.get("type") === "Planet"),
  );
});

test("counts unique episodes across all residents and caches successful details", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return reply([
      { id: 1, episode: ["ep/1", "ep/2"] },
      { id: 2, episode: ["ep/2", "ep/3"] },
    ]);
  };
  const planet = {
    id: 10001,
    residents: [
      "https://rickandmortyapi.com/api/character/1",
      "https://rickandmortyapi.com/api/character/2",
    ],
  };
  const details = await getPlanetDetails(planet);
  assert.equal(details.episodeCount, 3);
  assert.equal(details.residents.length, 2);
  assert.strictEqual(await getPlanetDetails(planet), details);
  assert.equal(calls, 1);
});

test("handles empty planets without fetching characters", async () => {
  globalThis.fetch = async () => {
    throw new Error("Must not fetch");
  };
  assert.deepEqual(await getPlanetDetails({ id: 10002, residents: [] }), {
    residents: [],
    episodeCount: 0,
  });
});

test("handles single-character API responses and splits large populations into batches", async () => {
  const batches = [];
  globalThis.fetch = async (url) => {
    const ids = url.split("/").pop().split(",").map(Number);
    batches.push(ids);
    const results = ids.map((id) => ({ id, episode: ["ep/1"] }));
    return reply(results.length === 1 ? results[0] : results);
  };
  const residents = Array.from(
    { length: 41 },
    (_, i) => `https://rickandmortyapi.com/api/character/${i + 1}`,
  );
  const result = await getPlanetDetails({ id: 10003, residents });
  assert.deepEqual(
    batches.map((batch) => batch.length),
    [20, 20, 1],
  );
  assert.equal(result.residents.length, 41);
  assert.equal(result.episodeCount, 1);
});

test("rejects API failures, supports cancellation, and retries failed details", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.ok(options.signal);
    return { ok: false };
  };
  await assert.rejects(getPlanets(new AbortController().signal), /conectar/);
  const planet = {
    id: 10004,
    residents: ["https://rickandmortyapi.com/api/character/1"],
  };
  await assert.rejects(getPlanetDetails(planet, new AbortController().signal));
  globalThis.fetch = async () => reply({ id: 1, episode: [] });
  assert.equal((await getPlanetDetails(planet)).residents.length, 1);
});

test("map layout is deterministic and stays inside bounds; search ignores accents and case", () => {
  for (let i = 0; i < 100; i++) {
    const position = planetPosition(i + 1, i, 100);
    assert.deepEqual(position, planetPosition(i + 1, i, 100));
    assert.ok(
      position.x > 0 && position.x < 1 && position.y > 0 && position.y < 1,
    );
  }
  assert.equal(normalize("  DIMENSÃO C-137  "), "dimensao c-137");
});
