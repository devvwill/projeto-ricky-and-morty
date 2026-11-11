import { useEffect, useId, useRef } from "react";
import type { Container } from "@tsparticles/engine";
import { createParticleOptions } from "../utils/particle-options";
import { NativeParticleField } from "./native-particle-field";
import type { ParticleFieldProps } from "./particle-field.types";

let enginePromise:
  Promise<typeof import("@tsparticles/engine").tsParticles> | undefined;
function getEngine() {
  // carrega o motor de partículas só no navegador e reaproveita o mesmo carregamento.
  enginePromise ??= Promise.all([
    import("@tsparticles/engine"),
    import("@tsparticles/slim"),
  ])
    .then(async ([{ tsParticles }, { loadSlim }]) => {
      await loadSlim(tsParticles);
      return tsParticles;
    })
    .catch((error) => {
      enginePromise = undefined;
      throw error;
    });
  return enginePromise;
}
export function ParticleField(props: ParticleFieldProps) {
  const { width, height, anchors, active, reduced } = props;
  const host = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const element = host.current;
    // só cria o efeito quando o mapa tem tamanho, mundos visíveis e está ativo.
    if (!element || !width || !height || !anchors.length || !active) return;
    let disposed = false;
    let container: Container | undefined;
    getEngine()
      .then(async (engine) => {
        if (disposed) return;
        const loaded = await engine.load({
          id,
          element,
          options: createParticleOptions(reduced),
        });
        if (!loaded) return;
        if (disposed) {
          loaded.destroy();
          return;
        }
        container = loaded;
        // usa a posição de cada mundo para colocar a poeira ao redor dele.
        for (const anchor of anchors) {
          // o mundo selecionado recebe mais partículas para chamar atenção.
          const count = anchor.selected ? 8 : 2;
          for (let index = 0; index < count; index++) {
            // espalha os pontinhos em um círculo ao redor do mundo.
            const angle = (index / count) * Math.PI * 2 + anchor.id;
            const radius = anchor.selected ? 19 : 10;
            const x = (anchor.x / width) * loaded.canvas.size.width;
            const y = (anchor.y / height) * loaded.canvas.size.height;
            loaded.particles.addParticle(
              {
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
              },
              {
                size: { value: anchor.selected ? 1.5 : 0.8 },
                opacity: {
                  value: { min: 0.15, max: anchor.selected ? 0.8 : 0.4 },
                },
                // deixa a poeira andar devagar, sem se afastar muito do mundo.
                move: {
                  enable: !reduced,
                  speed: 0.15,
                  distance: { horizontal: 5, vertical: 5 },
                  outModes: "bounce",
                },
              },
            );
          }
        }
        // se o usuário prefere menos movimento, desenha o efeito parado.
        if (reduced) {
          loaded.pause();
          loaded.draw(true);
        }
      })
      .catch(() => {
        // se o motor falhar, as estrelas mais simples continuam aparecendo por baixo.
      });
    // apaga o efeito antigo ao trocar a busca, a seleção ou sair da tela.
    return () => {
      disposed = true;
      container?.destroy();
    };
  }, [id, width, height, anchors, active, reduced]);
  return (
    <>
      <NativeParticleField {...props} />
      <div
        ref={host}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </>
  );
}
