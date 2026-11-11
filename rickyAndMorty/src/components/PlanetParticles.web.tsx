import { useEffect, useRef, useState } from "react";
import { tsParticles, type Container } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

import type { Planets } from "@/types/planets";

interface PlanetParticlesProps {
  planets: Planets[];
}

const particlesEngineReady = loadSlim(tsParticles);

export default function PlanetParticles({ planets }: PlanetParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<Planets | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || planets.length === 0) return;

    let ativo = true;
    let instance: Container | undefined;
    let removeListeners: (() => void) | undefined;

    const initializeParticles = async () => {
      try {
        await particlesEngineReady;
        if (!ativo) return;

        const loaded = await tsParticles.load({
          id: "planet-particles",
          element,
          options: {
            fullScreen: { enable: false },
            background: { color: "#080b16" },
            fpsLimit: 60,
            particles: {
              number: {
                value: planets.length,
                limit: { value: planets.length },
                density: { enable: false },
              },
              color: { value: "#22c55e" },
              shape: { type: "circle" },
              opacity: { value: { min: 0.6, max: 1 } },
              size: { value: { min: 5, max: 10 } },
              move: {
                enable: true,
                speed: { min: 0.5, max: 2 },
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "bounce" },
              },
              links: {
                enable: true,
                distance: 130,
                color: "#22c55e",
                opacity: 0.2,
                width: 1,
              },
            },
            interactivity: {
              events: { onHover: { enable: true, mode: "grab" } },
              modes: { grab: { distance: 150, links: { opacity: 0.5 } } },
            },
            detectRetina: true,
          },
        });

        if (!loaded) return;

        if (!ativo) {
          loaded.destroy();
          return;
        }

        instance = loaded;

        const findPlanetAt = (event: PointerEvent): Planets | null => {
          const canvas = element.querySelector("canvas");
          if (!canvas || !instance) return null;

          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const ratio = instance.retina.pixelRatio || 1;

          let closest: Planets | null = null;
          let closestDistance = Infinity;

          for (let i = 0; i < instance.particles.count; i += 1) {
            const particle = instance.particles.get(i);
            const planet = planets[i];
            if (!particle || !planet) continue;

            const px = particle.position.x / ratio;
            const py = particle.position.y / ratio;
            const radius = particle.getRadius() / ratio;

            const distance = Math.hypot(px - x, py - y);
            const hitArea = Math.max(radius + 12, 24); // área de toque generosa

            if (distance < hitArea && distance < closestDistance) {
              closestDistance = distance;
              closest = planet;
            }
          }

          return closest;
        };

        const handleClick = (event: PointerEvent) => {
          if (event.button !== 0) return;
          const planet = findPlanetAt(event);
          if (planet) setSelectedPlanet(planet);
        };

        const handleMove = (event: PointerEvent) => {
          element.style.cursor = findPlanetAt(event) ? "pointer" : "default";
        };

        element.addEventListener("pointerdown", handleClick);
        element.addEventListener("pointermove", handleMove);

        removeListeners = () => {
          element.removeEventListener("pointerdown", handleClick);
          element.removeEventListener("pointermove", handleMove);
        };
      } catch (error) {
        if (ativo) console.error("Erro ao carregar planetas:", error);
      }
    };

    void initializeParticles();

    return () => {
      ativo = false;
      removeListeners?.();
      instance?.destroy();
    };
  }, [planets]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#080b16",
      }}
    >
      {/* só o tsParticles mexe aqui dentro */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {selectedPlanet && (
        <div
          onClick={() => setSelectedPlanet(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              padding: 24,
              borderRadius: 20,
              backgroundColor: "#111827",
              border: "1px solid #22c55e",
              color: "#ffffff",
              boxShadow: "0 0 40px rgba(34, 197, 94, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  color: "#22c55e",
                  fontSize: 12,
                  fontWeight: "bold",
                  letterSpacing: 2,
                }}
              >
                PLANET DETAILS
              </span>
              <button
                onClick={() => setSelectedPlanet(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <h2 style={{ fontSize: 25, margin: "0 0 8px", color: "#22c55e" }}>
              {selectedPlanet.name}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>
              ID #{selectedPlanet.id}
            </p>

            {[
              ["Type", selectedPlanet.type],
              ["Dimension", selectedPlanet.dimension],
              ["Residents", selectedPlanet.residents.length],
              [
                "Created",
                new Date(selectedPlanet.created).toLocaleDateString("pt-BR"),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "13px 0",
                  borderBottom: "1px solid #273449",
                }}
              >
                <span style={{ color: "#94a3b8" }}>{label}</span>
                <span
                  style={{
                    color: "#ffffff",
                    textAlign: "right",
                    maxWidth: "65%",
                    overflowWrap: "anywhere",
                  }}
                >
                  {value ?? "Unknown"}
                </span>
              </div>
            ))}

            <p
              style={{
                color: "#64748b",
                fontSize: 11,
                marginTop: 24,
                textAlign: "center",
              }}
            >
              RICK AND MORTY MULTIVERSE DATABASE
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
