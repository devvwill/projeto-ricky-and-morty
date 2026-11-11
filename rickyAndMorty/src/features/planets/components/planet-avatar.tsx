import { StyleSheet, View } from "react-native";
import { palette } from "../theme";
export function PlanetAvatar({ size = 60 }: { size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.green,
      }}
    >
      <View
        style={[
          styles.crater,
          {
            width: size * 0.24,
            height: size * 0.24,
            left: size * 0.22,
            top: size * 0.24,
          },
        ]}
      />
      <View
        style={[
          styles.crater,
          {
            width: size * 0.17,
            height: size * 0.17,
            right: size * 0.25,
            bottom: size * 0.24,
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  crater: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: palette.crater,
  },
});
