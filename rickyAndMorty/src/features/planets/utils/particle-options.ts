import type { ISourceOptions } from "@tsparticles/engine";

export function createParticleOptions(reduced: boolean): ISourceOptions {
  return {
    // mantém as partículas dentro do mapa, sem cobrir o resto da tela.
    fullScreen: { enable: false },
    autoPlay: !reduced,
    detectRetina: false,
    // limita a 30 quadros por segundo para gastar menos processamento.
    fpsLimit: 30,
    // pausa quando a página perde o foco ou o mapa sai da área visível.
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    background: { color: { value: "transparent" } },
    particles: {
      // são 26 partículas de fundo; a poeira de cada mundo é adicionada separadamente.
      number: { value: 26, density: { enable: false } },
      paint: { color: { value: ["#79FF62", "#A6EAC9", "#55EFC4"] } },
      shape: { type: "circle" },
      size: { value: { min: 0.5, max: 1.4 } },
      // varia a transparência para criar um brilho suave.
      opacity: {
        value: { min: 0.12, max: 0.45 },
        animation: { enable: !reduced, speed: 0.35, sync: false },
      },
      // movimento lento, em várias direções, desligado quando o usuário reduz movimento.
      move: {
        enable: !reduced,
        speed: 0.12,
        direction: "none",
        outModes: "out",
      },
      links: { enable: false },
    },
    // o efeito não reage a cliques: os botões dos mundos cuidam da seleção.
    interactivity: {
      events: { onClick: { enable: false }, onHover: { enable: false } },
    },
  };
}
