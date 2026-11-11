import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "../theme";
import { MapIcon } from "./map-icon";
export function PlanetHeader({
  title,
  subtitle,
  query,
  onQuery,
}: {
  title: string;
  subtitle: string;
  query: string;
  onQuery: (text: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 24 }]}
    >
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.search}>
        <MapIcon name="search" color={palette.secondary} />
        <TextInput
          accessibilityLabel="Buscar mundo ou dimensão"
          placeholder="Buscar mundo ou dimensão"
          placeholderTextColor={palette.muted}
          value={query}
          onChangeText={onQuery}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
        />
        {!!query && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            onPress={() => onQuery("")}
            hitSlop={8}
          >
            <Text style={styles.clear}>×</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 27, paddingBottom: 22 },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  subtitle: { color: "#B8BAC5", fontSize: 16, marginTop: 3 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.panel,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 14,
    minHeight: 44,
    marginTop: 20,
    gap: 2,
  },
  input: { color: palette.text, fontSize: 14, flex: 1, paddingVertical: 11 },
  clear: { color: palette.secondary, fontSize: 24 },
});
