import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { usePlanets } from "../planets-provider";
import { palette } from "../theme";
import { normalize } from "../utils/map-layout";
import { PlanetHeader } from "../components/planet-header";
import { PlanetAvatar } from "../components/planet-avatar";
import { Feedback } from "../components/feedback";
export function CatalogScreen({
  favoritesOnly = false,
}: {
  favoritesOnly?: boolean;
}) {
  const {
    planets,
    favorites,
    toggleFavorite,
    select,
    loading,
    error,
    retry,
    storageError,
  } = usePlanets();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      planets.filter(
        (p) =>
          (!favoritesOnly || favorites.includes(p.id)) &&
          normalize(`${p.name} ${p.dimension}`).includes(normalize(query)),
      ),
    [planets, favorites, favoritesOnly, query],
  );
  return (
    <View style={styles.screen}>
      <PlanetHeader
        title={favoritesOnly ? "Seus favoritos" : "Lista de planetas"}
        subtitle={
          favoritesOnly
            ? "Seus mundos em um só lugar"
            : "Encontre seu próximo destino"
        }
        query={query}
        onQuery={setQuery}
      />
      {storageError ? (
        <Text accessibilityLiveRegion="polite" style={styles.warning}>
          {storageError}
        </Text>
      ) : null}
      {loading ? (
        <Feedback loading message="Localizando planetas…" />
      ) : error ? (
        <Feedback message={error} action="Tentar novamente" onAction={retry} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Feedback
              message={
                query
                  ? "Nenhum planeta encontrado."
                  : "Você ainda não tem favoritos. Salve um planeta na lista ou nos detalhes."
              }
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver ${item.name} no mapa`}
                onPress={() => {
                  select(item);
                  router.navigate("/");
                }}
                style={({ pressed }) => [
                  styles.planet,
                  pressed && { opacity: 0.65 },
                ]}
              >
                <PlanetAvatar size={44} />
                <View style={styles.description}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.dimension === "unknown"
                      ? "Dimensão desconhecida"
                      : item.dimension}
                  </Text>
                  <Text style={styles.count}>
                    {item.residents.length} moradores
                  </Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  favorites.includes(item.id)
                    ? `Remover ${item.name} dos favoritos`
                    : `Favoritar ${item.name}`
                }
                accessibilityState={{ selected: favorites.includes(item.id) }}
                onPress={() => toggleFavorite(item.id)}
                style={styles.favorite}
              >
                <Text
                  style={[
                    styles.star,
                    favorites.includes(item.id) && { color: palette.green },
                  ]}
                >
                  {favorites.includes(item.id) ? "★" : "☆"}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  row: {
    flexDirection: "row",
    borderRadius: 18,
    backgroundColor: palette.panel,
    marginBottom: 12,
    alignItems: "center",
  },
  planet: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  description: { flex: 1 },
  name: { color: palette.text, fontWeight: "700", fontSize: 17 },
  meta: { color: palette.secondary, fontSize: 13, marginTop: 5 },
  count: { color: palette.muted, marginTop: 6, fontSize: 12 },
  favorite: {
    minWidth: 44,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  star: { color: palette.secondary, fontSize: 28 },
  warning: { color: palette.danger, paddingHorizontal: 24, paddingBottom: 12 },
});
