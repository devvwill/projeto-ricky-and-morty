import { Animated, StyleSheet, View } from "react-native";
import { palette } from "../theme";
type Props = { id: number; selected: boolean; phase: Animated.Value };
const WORLD_COLORS = ["#79FF62", "#38EB8C", "#A6F96C", "#55EFC4"];

// este componente desenha o mundo; o botão ao redor dele cuida do toque.
export function PlanetMarker({ id, selected, phase }: Props) {
  const color = WORLD_COLORS[id % WORLD_COLORS.length];
  // o mundo selecionado fica maior e sempre ganha uma órbita.
  const size = selected ? 12 : 7 + (id % 4);
  const hasOrbit = selected || id % 4 === 0;
  // cada mundo começa em um ângulo diferente para as órbitas não ficarem iguais.
  const angle = (id * 47) % 360;
  return (
    <View pointerEvents="none" style={styles.marker}>
      {/* o brilho aumenta e diminui devagar, como uma respiração. */}
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: color,
            // transforma o avanço do ciclo em brilho fraco, forte e fraco novamente.
            opacity: phase.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: selected ? [0.16, 0.32, 0.16] : [0.05, 0.12, 0.05],
            }),
            transform: [
              {
                scale: phase.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [
                    selected ? 1.2 : 0.65,
                    selected ? 1.5 : 0.9,
                    selected ? 1.2 : 0.65,
                  ],
                }),
              },
            ],
          },
        ]}
      />
      {/* o anel gira uma volta completa e leva os pontinhos junto com ele. */}
      {hasOrbit && (
        <Animated.View
          style={[
            styles.orbit,
            {
              borderColor: selected ? "#79FF6266" : "#79FF622B",
              transform: [
                {
                  rotate: phase.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`${angle}deg`, `${angle + 360}deg`],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.satellite, { backgroundColor: color }]} />
          {selected && <View style={styles.secondSatellite} />}
        </Animated.View>
      )}
      {/* as crateras e o reflexo são desenhos fixos; quem se move é o brilho e a órbita. */}
      <View
        style={[
          styles.world,
          {
            width: size,
            height: size,
            borderRadius: size,
            backgroundColor: color,
            boxShadow: `0px 0px ${selected ? 12 : 5}px ${color}88`,
          },
        ]}
      >
        <View
          style={[
            styles.crater,
            {
              width: size * 0.3,
              height: size * 0.3,
              top: size * 0.2,
              left: size * 0.18,
            },
          ]}
        />
        <View
          style={[
            styles.crater,
            {
              width: size * 0.2,
              height: size * 0.2,
              bottom: size * 0.18,
              right: size * 0.17,
            },
          ]}
        />
        <View style={styles.highlight} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: { position: "absolute", width: 30, height: 30, borderRadius: 20 },
  world: { overflow: "hidden" },
  crater: {
    position: "absolute",
    borderRadius: 10,
    backgroundColor: "#0B533C",
    opacity: 0.45,
  },
  highlight: {
    position: "absolute",
    top: 1,
    left: 2,
    width: 3,
    height: 2,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    opacity: 0.4,
  },
  orbit: {
    position: "absolute",
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 18,
  },
  satellite: {
    position: "absolute",
    top: -2,
    left: 11,
    width: 3,
    height: 3,
    borderRadius: 3,
  },
  secondSatellite: {
    position: "absolute",
    bottom: -2,
    right: 10,
    width: 2,
    height: 2,
    borderRadius: 3,
    backgroundColor: palette.text,
  },
});
