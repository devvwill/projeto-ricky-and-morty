import { useEffect, useState } from "react";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getPlanets } from "@/services/rickyAndMorttService";
import type { Planets } from "@/types/planets";

type Destination = "map" | "list" | "favorites";

const colors = {
  background: "#090D1C",
  surface: "#151B39",
  surfaceRaised: "#10162E",
  border: "#29325A",
  text: "#F5F7FF",
  muted: "#8E98B8",
  accent: "#65F66B",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function TelaInicial() {
  const insets = useSafeAreaInsets();
  const [planets, setPlanets] = useState<Planets[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPlanetId, setSelectedPlanetId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [destination, setDestination] = useState<Destination>("map");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let ativo = true;

    async function loadPlanets() {
      try {
        const dados = await getPlanets();

        if (ativo) {
          setPlanets(dados);
          setSelectedPlanetId(dados[0]?.id ?? null);
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os planetas.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    loadPlanets();

    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.text}>Carregando planetas...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{erro}</Text>
      </View>
    );
  }

  const normalizedSearch = normalize(search.trim());
  const visiblePlanets = planets.filter((planet) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      normalize(`${planet.name} ${planet.dimension}`).includes(normalizedSearch);
    const matchesDestination =
      destination !== "favorites" || favoriteIds.has(planet.id);

    return matchesSearch && matchesDestination;
  });
  const selectedPlanet =
    visiblePlanets.find((planet) => planet.id === selectedPlanetId) ??
    visiblePlanets[0] ??
    null;

  function selectPlanet(planet: Planets) {
    setSelectedPlanetId(planet.id);
    setDestination("map");
    setExpanded(false);
  }

  function toggleFavorite(planetId: number) {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(planetId)) {
        next.delete(planetId);
      } else {
        next.add(planetId);
      }
      return next;
    });
  }

  function updateSearch(value: string) {
    setSearch(value);
    const query = normalize(value.trim());
    const firstMatch = planets.find((planet) =>
      normalize(`${planet.name} ${planet.dimension}`).includes(query),
    );
    setSelectedPlanetId(firstMatch?.id ?? null);
    setExpanded(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de planetas</Text>
        <Text style={styles.subtitle}>Toque num ponto para explorar</Text>
        <View style={styles.searchBox}>
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
            size={18}
            tintColor={colors.muted}
          />
          <TextInput
            accessibilityLabel="Buscar mundo ou dimensão"
            placeholder="Buscar mundo ou dimensão"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={updateSearch}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityLabel="Limpar busca"
              onPress={() => updateSearch("")}
              hitSlop={10}
            >
              <SymbolView
                name={{ ios: "xmark.circle.fill", android: "cancel", web: "cancel" }}
                size={18}
                tintColor={colors.muted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {destination === "map" ? (
        <View style={styles.mapFrame}>
          <View style={styles.mapCanvas}>
            <View style={[styles.mapContents, { transform: [{ scale: zoom }] }]}>
              {visiblePlanets.map((planet, index) => {
                const angle = index * Math.PI * (3 - Math.sqrt(5));
                const distance = Math.sqrt((index + 0.5) / visiblePlanets.length) * 43;
                const isSelected = planet.id === selectedPlanet?.id;

                return (
                  <Pressable
                    key={planet.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Planeta ${planet.name}`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => selectPlanet(planet)}
                    style={[
                      styles.planetPoint,
                      {
                        left: `${50 + Math.cos(angle) * distance}%`,
                        top: `${50 + Math.sin(angle) * distance}%`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.planetDot,
                        isSelected && styles.planetDotSelected,
                      ]}
                    />
                  </Pressable>
                );
              })}
              {visiblePlanets.length === 0 && (
                <Text style={styles.emptyMapText}>Nenhum planeta encontrado</Text>
              )}
            </View>
            <View style={styles.zoomControls}>
              <Pressable
                accessibilityLabel="Aumentar zoom"
                onPress={() => setZoom((current) => Math.min(current + 0.15, 1.6))}
                style={styles.zoomButton}
              >
                <SymbolView
                  name={{ ios: "plus", android: "add", web: "add" }}
                  size={19}
                  tintColor={colors.text}
                />
              </Pressable>
              <Pressable
                accessibilityLabel="Diminuir zoom"
                onPress={() => setZoom((current) => Math.max(current - 0.15, 0.7))}
                style={styles.zoomButton}
              >
                <SymbolView
                  name={{ ios: "minus", android: "remove", web: "remove" }}
                  size={19}
                  tintColor={colors.text}
                />
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.results}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
        >
          {visiblePlanets.length === 0 ? (
            <Text style={styles.emptyListText}>
              {destination === "favorites"
                ? "Seus planetas favoritos aparecerão aqui."
                : "Nenhum planeta encontrado."}
            </Text>
          ) : (
            visiblePlanets.map((planet) => (
              <Pressable
                key={planet.id}
                onPress={() => selectPlanet(planet)}
                style={styles.listRow}
              >
                <View style={styles.listPlanetMark} />
                <View style={styles.listPlanetText}>
                  <Text numberOfLines={1} style={styles.listPlanetName}>
                    {planet.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.listPlanetMeta}>
                    {planet.type} · {planet.dimension}
                  </Text>
                </View>
                <SymbolView
                  name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
                  size={17}
                  tintColor={colors.muted}
                />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      {destination === "map" && selectedPlanet && (
        <View style={[styles.detailSheet, expanded && styles.detailSheetExpanded]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? "Recolher detalhes" : "Expandir detalhes"}
            onPress={() => setExpanded((current) => !current)}
            style={styles.sheetHandleArea}
          >
            <View style={styles.sheetHandle} />
          </Pressable>
          <View style={styles.planetSummary}>
            <View style={styles.planetAvatar}>
              <View style={styles.avatarMarkLarge} />
              <View style={styles.avatarMarkSmall} />
            </View>
            <View style={styles.summaryText}>
              <Text numberOfLines={1} style={styles.planetName}>
                {selectedPlanet.name}
              </Text>
              <Text numberOfLines={1} style={styles.planetMeta}>
                {selectedPlanet.type} · {selectedPlanet.dimension}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                favoriteIds.has(selectedPlanet.id)
                  ? "Remover dos favoritos"
                  : "Adicionar aos favoritos"
              }
              onPress={() => toggleFavorite(selectedPlanet.id)}
              hitSlop={8}
              style={styles.favoriteButton}
            >
              <SymbolView
                name={{
                  ios: favoriteIds.has(selectedPlanet.id) ? "star.fill" : "star",
                  android: favoriteIds.has(selectedPlanet.id) ? "star" : "star_outline",
                  web: favoriteIds.has(selectedPlanet.id) ? "star" : "star_outline",
                }}
                size={19}
                tintColor={favoriteIds.has(selectedPlanet.id) ? colors.accent : colors.muted}
              />
            </Pressable>
          </View>
          <View style={styles.summaryActions}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RESIDENTES</Text>
              <Text style={styles.statValue}>
                {String(selectedPlanet.residents.length).padStart(2, "0")}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ID</Text>
              <Text style={styles.statValue}>
                {String(selectedPlanet.id).padStart(2, "0")}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(true)}
              style={styles.detailsButton}
            >
              <Text style={styles.detailsButtonText}>Ver detalhes</Text>
            </Pressable>
          </View>
          {expanded && (
            <View style={styles.expandedDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dimensão</Text>
                <Text numberOfLines={2} style={styles.detailValue}>
                  {selectedPlanet.dimension || "Desconhecida"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Criado em</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedPlanet.created).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {([
          ["map", "Mapa", "map"],
          ["list", "Lista", "list"],
          ["favorites", "Favoritos", "star"],
        ] as const).map(([key, label, icon]) => {
          const active = destination === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setDestination(key);
                setExpanded(false);
              }}
              style={styles.tabButton}
            >
              <SymbolView
                name={{
                  ios:
                    icon === "map"
                      ? "globe.americas"
                      : icon === "list"
                        ? "list.bullet"
                        : "star",
                  android: icon === "map" ? "public" : icon,
                  web: icon === "map" ? "public" : icon,
                }}
                size={19}
                tintColor={active ? colors.accent : colors.muted}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  searchBox: {
    height: 44,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 13,
    padding: 0,
  },
  mapFrame: {
    flex: 1,
    minHeight: 180,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  mapCanvas: {
    flex: 1,
  },
  mapContents: {
    ...StyleSheet.absoluteFill,
  },
  planetPoint: {
    position: "absolute",
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    alignItems: "center",
    justifyContent: "center",
  },
  planetDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.75,
    shadowRadius: 5,
  },
  planetDotSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#D3FFD5",
  },
  emptyMapText: {
    position: "absolute",
    top: "48%",
    alignSelf: "center",
    color: colors.muted,
    fontSize: 13,
  },
  zoomControls: {
    position: "absolute",
    right: 10,
    bottom: 10,
    gap: 6,
  },
  zoomButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  results: {
    flex: 1,
    marginTop: 8,
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  listRow: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listPlanetMark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  listPlanetText: {
    flex: 1,
    gap: 4,
  },
  listPlanetName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  listPlanetMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  emptyListText: {
    padding: 24,
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  detailSheet: {
    height: 142,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  detailSheetExpanded: {
    height: "46%",
    minHeight: 300,
  },
  sheetHandleArea: {
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#35416E",
  },
  planetSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
  },
  planetAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMarkLarge: {
    position: "absolute",
    left: 9,
    top: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#28C953",
  },
  avatarMarkSmall: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#28C953",
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  planetName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  planetMeta: {
    color: colors.muted,
    fontSize: 11,
  },
  favoriteButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statBox: {
    minWidth: 62,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 8,
  },
  statValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  detailsButton: {
    minHeight: 34,
    flex: 1,
    paddingHorizontal: 9,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsButtonText: {
    color: "#102319",
    fontSize: 11,
    fontWeight: "700",
  },
  expandedDetails: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    minHeight: 42,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  detailValue: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 12,
    textAlign: "right",
  },
  bottomBar: {
    minHeight: 58,
    paddingTop: 7,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#202746",
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabButton: {
    minWidth: 76,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 10,
  },
  tabLabelActive: {
    color: colors.accent,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
});
