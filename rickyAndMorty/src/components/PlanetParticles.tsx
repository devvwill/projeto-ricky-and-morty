import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import type { Planets } from "@/types/planets";

interface PlanetParticlesProps {
  planets: Planets[];
}

type PlanetInfo = {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: number;
  created: string;
};

export default function PlanetParticles({ planets }: PlanetParticlesProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);

  const html = useMemo(() => {
    const planetData = JSON.stringify(
      planets.map((planet) => ({
        id: planet.id,
        name: planet.name,
        type: planet.type,
        dimension: planet.dimension,
        residents: planet.residents.length,
        created: planet.created,
      })),
    ).replace(/</g, "\\u003c");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100%; height: 100%;
              overflow: hidden; background: #080b16;
            }
            #tsparticles { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="tsparticles"></div>

          <script src="https://cdn.jsdelivr.net/npm/@tsparticles/slim@3/tsparticles.slim.bundle.min.js"></script>

          <script>
            const planets = ${planetData};

            async function initialize() {
              if (!window.tsParticles || planets.length === 0) return;

              const colors = ["#8b5cf6","#06b6d4","#22c55e","#f97316","#ec4899","#eab308","#6366f1"];

              const container = await window.tsParticles.load({
                id: "tsparticles",
                options: {
                  fullScreen: { enable: false },
                  background: { color: "#080b16" },
                  fpsLimit: 60,
                  particles: {
                    number: {
                      value: planets.length,
                      limit: planets.length,
                      density: { enable: false }
                    },
                    color: { value: colors },
                    shape: { type: "circle" },
                    opacity: { value: { min: 0.5, max: 1 } },
                    size: { value: { min: 5, max: 10 } },
                    move: {
                      enable: true,
                      speed: { min: 0.5, max: 2 },
                      direction: "none",
                      random: true,
                      straight: false,
                      outModes: { default: "bounce" }
                    },
                    links: {
                      enable: true,
                      distance: 130,
                      color: "#64748b",
                      opacity: 0.2,
                      width: 1
                    }
                  },
                  interactivity: {
                    events: { onHover: { enable: true, mode: "grab" } },
                    modes: { grab: { distance: 150, links: { opacity: 0.5 } } }
                  },
                  detectRetina: true
                }
              });

              if (!container) return;

              const element = document.getElementById("tsparticles");

              element.addEventListener("pointerdown", (event) => {
                const rect = element.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const ratio = container.retina.pixelRatio || 1;

                let closest = null;
                let closestDistance = Infinity;

                for (let i = 0; i < container.particles.count; i++) {
                  const particle = container.particles.get(i);
                  const planet = planets[i];
                  if (!particle || !planet) continue;

                  const px = particle.position.x / ratio;
                  const py = particle.position.y / ratio;
                  const radius = particle.getRadius() / ratio;

                  const distance = Math.hypot(px - x, py - y);
                  const hitArea = Math.max(radius + 14, 28);

                  if (distance < hitArea && distance < closestDistance) {
                    closestDistance = distance;
                    closest = planet;
                  }
                }

                if (closest && window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify(closest));
                }
              });
            }

            initialize();
          </script>
        </body>
      </html>
    `;
  }, [planets]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      setSelectedPlanet(JSON.parse(event.nativeEvent.data) as PlanetInfo);
    } catch {
      ("");
    }
  };

  const rows: [string, string | number][] = selectedPlanet
    ? [
        ["Type", selectedPlanet.type],
        ["Dimension", selectedPlanet.dimension],
        ["Residents", selectedPlanet.residents],
        [
          "Created",
          new Date(selectedPlanet.created).toLocaleDateString("pt-BR"),
        ],
      ]
    : [];

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={handleMessage}
        style={styles.webview}
      />

      <Modal
        visible={selectedPlanet !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPlanet(null)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setSelectedPlanet(null)}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>PLANET DETAILS</Text>
              <Pressable onPress={() => setSelectedPlanet(null)} hitSlop={12}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.name}>{selectedPlanet?.name}</Text>
            <Text style={styles.id}>ID #{selectedPlanet?.id}</Text>

            {rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value || "Unknown"}</Text>
              </View>
            ))}

            <Text style={styles.footer}>
              RICK AND MORTY MULTIVERSE DATABASE
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080b16" },
  webview: { flex: 1, backgroundColor: "transparent" },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardLabel: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  close: { color: "#94a3b8", fontSize: 28, lineHeight: 28 },
  name: { color: "#22c55e", fontSize: 25, fontWeight: "bold", marginBottom: 8 },
  id: { color: "#94a3b8", fontSize: 13, marginBottom: 24 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#273449",
  },
  rowLabel: { color: "#94a3b8" },
  rowValue: { color: "#ffffff", textAlign: "right", flexShrink: 1 },
  footer: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 24,
    textAlign: "center",
  },
});
