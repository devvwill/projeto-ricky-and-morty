import { Animated, StyleSheet, View } from "react-native";
import type { ParticleFieldProps } from "./particle-field.types";

// cria 26 estrelas em posições fixas para elas não pularem de lugar ao atualizar a tela.
const STARS = Array.from({ length: 26 }, (_, index) => ({
  x: ((index * 73 + 17) % 97) / 100,
  y: ((index * 43 + 11) % 97) / 100,
  size: index % 5 === 0 ? 2 : 1,
}));
export function NativeParticleField({
  width,
  height,
  phase,
  anchors,
}: ParticleFieldProps) {
  if (!anchors.length) return null;
  return (
    <View
      // as estrelas são enfeites e deixam o toque chegar aos mundos.
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {STARS.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: star.x * width,
              top: star.y * height,
              width: star.size,
              height: star.size,
              // alterna o brilho das estrelas; algumas clareiam enquanto outras escurecem.
              opacity: phase.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: index % 2 ? [0.15, 0.5, 0.15] : [0.45, 0.12, 0.45],
              }),
              // move poucos pixels para os lados e para cima e baixo, voltando ao começo.
              transform: [
                {
                  translateX: phase.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, index % 2 ? 5 : -5, 0],
                  }),
                },
                {
                  translateY: phase.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: [0, -3, 0, 3, 0],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  star: { position: "absolute", borderRadius: 3, backgroundColor: "#A6EAC9" },
});
