import { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { usePlanets } from "../planets-provider";
import { palette } from "../theme";
import { normalize } from "../utils/map-layout";
import { Feedback } from "../components/feedback";
import { PlanetHeader } from "../components/planet-header";
import { PlanetMap } from "../components/planet-map";
import { COLLAPSED_HEIGHT, PlanetSheet } from "../components/planet-sheet";
export function MapScreen() {
  const {
    planets,
    loading,
    error,
    retry,
    selected,
    select,
    favorites,
    toggleFavorite,
  } = usePlanets();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState(0);
  const onExpand = useCallback((value: boolean) => setExpanded(value), []);
  const visibleIds = useMemo(
    () =>
      new Set(
        planets
          .filter((p) =>
            normalize(`${p.name} ${p.dimension}`).includes(normalize(query)),
          )
          .map((p) => p.id),
      ),
    [planets, query],
  );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <PlanetHeader
        title="Mapa de planetas"
        subtitle="Toque num ponto para explorar"
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setExpanded(false);
        }}
      />
      <View
        style={styles.body}
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      >
        {loading ? (
          <Feedback loading message="Localizando planetas…" />
        ) : error ? (
          <Feedback
            message={error}
            action="Tentar novamente"
            onAction={retry}
          />
        ) : (
          <>
            <View
              style={[
                styles.mapArea,
                { marginBottom: selected ? COLLAPSED_HEIGHT + 20 : 16 },
              ]}
            >
              <PlanetMap
                suspended={expanded}
                planets={planets}
                visibleIds={visibleIds}
                selected={selected?.id}
                onSelect={select}
              />
            </View>
            {selected && height > 0 && (
              <PlanetSheet
                planet={selected}
                height={height}
                expanded={expanded}
                onExpand={onExpand}
                favorite={favorites.includes(selected.id)}
                onFavorite={() => toggleFavorite(selected.id)}
              />
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  body: { flex: 1, overflow: "hidden" },
  mapArea: { flex: 1, minHeight: 100 },
});
