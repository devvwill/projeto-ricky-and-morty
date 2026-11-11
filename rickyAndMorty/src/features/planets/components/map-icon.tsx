import { StyleSheet, View, type ColorValue } from "react-native";
export function MapIcon({
  name,
  color,
}: {
  name: "map" | "list" | "favorites" | "search";
  color: ColorValue;
}) {
  if (name === "favorites")
    return (
      <View style={styles.box}>
        <View style={[styles.triangle, { borderBottomColor: color }]} />
        <View style={styles.triangleInner} />
      </View>
    );
  return (
    <View style={styles.box}>
      <View
        style={[
          styles.circle,
          { borderColor: color },
          name === "search" && { width: 16, height: 16, left: 2, top: 2 },
          name === "list" && { width: 19, height: 17, left: 5, top: 2 },
        ]}
      />
      {name === "map" && (
        <>
          <View style={[styles.meridian, { borderColor: color }]} />
          <View style={[styles.equator, { backgroundColor: color }]} />
        </>
      )}
      {name === "search" && (
        <View style={[styles.searchStem, { backgroundColor: color }]} />
      )}
      {name === "list" && (
        <View style={[styles.orbit, { borderColor: color }]} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  box: { width: 28, height: 28 },
  circle: {
    position: "absolute",
    width: 23,
    height: 23,
    borderRadius: 20,
    borderWidth: 1.7,
    left: 2,
    top: 2,
  },
  meridian: {
    position: "absolute",
    left: 8,
    top: 2,
    width: 11,
    height: 23,
    borderRadius: 20,
    borderWidth: 1.4,
  },
  equator: { position: "absolute", left: 3, top: 13, height: 1.5, width: 21 },
  searchStem: {
    position: "absolute",
    width: 10,
    height: 1.8,
    left: 16,
    top: 20,
    transform: [{ rotate: "48deg" }],
  },
  orbit: {
    position: "absolute",
    top: 14,
    left: 0,
    width: 28,
    height: 12,
    borderRadius: 20,
    borderTopWidth: 1.7,
    transform: [{ rotate: "-8deg" }],
  },
  triangle: {
    position: "absolute",
    top: 3,
    left: 1,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 21,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  triangleInner: {
    position: "absolute",
    top: 7,
    left: 5,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#0B0F1F",
  },
});
