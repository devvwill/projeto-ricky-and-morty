import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import type { Planets } from "@/types/planets";

interface PlanetParticlesProps {
  planets: Planets[];
}

export default function PlanetParticles({ planets }: PlanetParticlesProps) {
  const html = useMemo(() => {
    const planetData = JSON.stringify(
      planets.map((planet) => ({
        id: planet.id,
        name: planet.name,
        dimension: planet.dimension,
        type: planet.type,
      })),
    ).replace(/</g, "\\u003c");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #080b16;
            }

            #tsparticles {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>

        <body>
          <div id="tsparticles"></div>

          <script src="https://cdn.jsdelivr.net/npm/@tsparticles/slim@3/tsparticles.slim.bundle.min.js"></script>

          <script>
            const planets = ${planetData};

            async function initialize() {
              if (!window.tsParticles || planets.length === 0) {
                return;
              }

              const colors = [
                "#8b5cf6",
                "#06b6d4",
                "#22c55e",
                "#f97316",
                "#ec4899",
                "#eab308",
                "#6366f1"
              ];

              await window.tsParticles.load({
                id: "tsparticles",

                options: {
                  fullScreen: {
                    enable: false
                  },

                  background: {
                    color: "#080b16"
                  },

                  fpsLimit: 60,

                  particles: {
                    number: {
                      value: planets.length,
                      limit: planets.length,
                      density: {
                        enable: false
                      }
                    },

                    color: {
                      value: colors
                    },

                    shape: {
                      type: "circle"
                    },

                    opacity: {
                      value: {
                        min: 0.5,
                        max: 1
                      }
                    },

                    size: {
                      value: {
                        min: 4,
                        max: 9
                      }
                    },

                    move: {
                      enable: true,
                      speed: {
                        min: 0.5,
                        max: 2
                      },
                      direction: "none",
                      random: true,
                      straight: false,
                      outModes: {
                        default: "bounce"
                      }
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
                    events: {
                      onHover: {
                        enable: true,
                        mode: "grab"
                      }
                    },

                    modes: {
                      grab: {
                        distance: 150,
                        links: {
                          opacity: 0.5
                        }
                      }
                    }
                  },

                  detectRetina: true
                }
              });
            }

            initialize();
          </script>
        </body>
      </html>
    `;
  }, [planets]);

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080b16",
  },

  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
