import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Planets } from "@/types/planets";
import { usePlanetDetails } from "../hooks/use-planet-details";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { palette } from "../theme";
import { PlanetAvatar } from "./planet-avatar";
import { Feedback } from "./feedback";
export const COLLAPSED_HEIGHT = 186;
type Props = {
  planet: Planets;
  height: number;
  expanded: boolean;
  onExpand: (value: boolean) => void;
  favorite: boolean;
  onFavorite: () => void;
};
export function PlanetSheet({
  planet,
  height,
  expanded,
  onExpand,
  favorite,
  onFavorite,
}: Props) {
  const fullHeight = Math.max(COLLAPSED_HEIGHT, height - 50);
  // é a distância entre o painel aberto e o painel recolhido.
  const travel = fullHeight - COLLAPSED_HEIGHT;
  const [translate] = useState(() => new Animated.Value(travel));
  const [fade] = useState(() => new Animated.Value(1));
  const reduced = useReducedMotion();
  const { details, error, retry } = usePlanetDetails(planet);
  // move o painel como uma mola suave; com movimento reduzido, muda de posição na hora.
  useEffect(() => {
    const animation = reduced
      ? Animated.timing(translate, {
          toValue: expanded ? 0 : travel,
          duration: 0,
          useNativeDriver: true,
        })
      : Animated.spring(translate, {
          toValue: expanded ? 0 : travel,
          damping: 25,
          stiffness: 210,
          mass: 1,
          useNativeDriver: true,
        });
    animation.start();
    return () => animation.stop();
  }, [expanded, travel, translate, reduced]);
  // ao trocar de mundo, o conteúdo começa mais transparente e aparece em 220 milissegundos.
  useEffect(() => {
    if (reduced) return;
    fade.setValue(0.35);
    const animation = Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [planet.id, reduced, fade]);
  useEffect(() => {
    if (!expanded) return;
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      onExpand(false);
      return true;
    });
    return () => listener.remove();
  }, [expanded, onExpand]);
  // faz o painel acompanhar o dedo enquanto a pessoa arrasta a alça.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) =>
          translate.setValue(
            Math.max(0, Math.min(travel, (expanded ? 0 : travel) + g.dy)),
          ),
        onPanResponderRelease: (_, g) => {
          // ao soltar, usa a direção e a velocidade do gesto para abrir ou recolher.
          const next =
            g.dy < -25 || g.vy < -0.4
              ? true
              : g.dy > 25 || g.vy > 0.4
                ? false
                : expanded;
          onExpand(next);
          if (reduced) {
            translate.setValue(next ? 0 : travel);
            return;
          }
          // termina o movimento encaixando o painel na posição escolhida.
          Animated.spring(translate, {
            toValue: next ? 0 : travel,
            damping: 25,
            stiffness: 210,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () =>
          Animated.spring(translate, {
            toValue: expanded ? 0 : travel,
            useNativeDriver: true,
          }).start(),
      }),
    [expanded, onExpand, translate, travel, reduced],
  );
  return (
    <Animated.View
      style={[
        styles.sheet,
        { height: fullHeight, transform: [{ translateY: translate }] },
      ]}
    >
      <View {...pan.panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? "Recolher painel do planeta"
              : "Expandir painel do planeta"
          }
          accessibilityState={{ expanded }}
          onPress={() => onExpand(!expanded)}
          style={styles.handleTouch}
        >
          <View style={styles.handle} />
        </Pressable>
        <Animated.View style={[styles.identity, { opacity: fade }]}>
          <PlanetAvatar />
          <View style={styles.nameBlock}>
            <Text numberOfLines={2} style={styles.name}>
              {planet.name}
            </Text>
            <Text numberOfLines={2} style={styles.meta}>
              {planet.type} •{" "}
              {planet.dimension === "unknown"
                ? "Dimensão desconhecida"
                : planet.dimension}
            </Text>
          </View>
        </Animated.View>
      </View>
      <View style={styles.summary}>
        <View style={styles.stat}>
          <Text style={styles.caption}>RESIDENTES</Text>
          <Text style={styles.value}>
            {String(planet.residents.length).padStart(2, "0")}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.caption}>EPISÓDIOS</Text>
          <Text style={styles.value}>
            {details
              ? String(details.episodeCount).padStart(2, "0")
              : error
                ? "—"
                : "…"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onExpand(!expanded)}
          style={({ pressed }) => [
            styles.details,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={styles.detailsLabel}>
            {expanded ? "Recolher" : "Ver detalhes"}
          </Text>
        </Pressable>
      </View>
      {expanded && (
        <ScrollView
          style={styles.more}
          contentContainerStyle={styles.moreContent}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorite
                ? `Remover ${planet.name} dos favoritos`
                : `Favoritar ${planet.name}`
            }
            accessibilityState={{ selected: favorite }}
            onPress={onFavorite}
            style={[styles.favorite, favorite && styles.saved]}
          >
            <Text style={styles.favoriteLabel}>
              {favorite
                ? "✓ Salvo nos favoritos"
                : "＋ Adicionar aos favoritos"}
            </Text>
          </Pressable>
          <Text style={styles.sectionTitle}>Moradores</Text>
          <Text style={styles.note}>
            Episódios em que os moradores aparecem.
          </Text>
          {error ? (
            <Feedback
              message={error}
              action="Tentar novamente"
              onAction={retry}
            />
          ) : !details ? (
            <Feedback loading message="Abrindo portal…" />
          ) : !details.residents.length ? (
            <Feedback message="Nenhum morador registrado neste planeta." />
          ) : (
            details.residents.map((resident) => (
              <View key={resident.id} style={styles.resident}>
                <Image
                  source={{ uri: resident.image }}
                  style={styles.avatar}
                  accessibilityLabel={resident.name}
                />
                <View style={styles.nameBlock}>
                  <Text style={styles.residentName}>{resident.name}</Text>
                  <Text style={styles.meta}>
                    {resident.species} •{" "}
                    {resident.status === "Alive"
                      ? "Vivo"
                      : resident.status === "Dead"
                        ? "Morto"
                        : "Status desconhecido"}
                  </Text>
                </View>
                <Text style={styles.episodes}>
                  {resident.episode.length} ep.
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  handleTouch: { height: 34, alignItems: "center", justifyContent: "center" },
  handle: {
    width: 62,
    height: 5,
    borderRadius: 4,
    backgroundColor: palette.border,
  },
  identity: {
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    minHeight: 76,
  },
  nameBlock: { flex: 1 },
  name: { color: palette.text, fontSize: 20, fontWeight: "700" },
  meta: { color: palette.secondary, fontSize: 14, marginTop: 5 },
  summary: {
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 14,
    minHeight: 41,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  caption: { color: palette.muted, fontSize: 9 },
  value: { color: palette.text, fontSize: 16, fontWeight: "600" },
  details: {
    marginLeft: 4,
    borderRadius: 24,
    backgroundColor: palette.green,
    paddingHorizontal: 14,
    minHeight: 42,
    justifyContent: "center",
  },
  detailsLabel: { color: "#07120C", fontWeight: "700", fontSize: 14 },
  more: { flex: 1, marginTop: 24 },
  moreContent: { paddingHorizontal: 24, paddingBottom: 30 },
  favorite: {
    minHeight: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  saved: { borderColor: palette.green },
  favoriteLabel: { color: palette.green, fontWeight: "600" },
  sectionTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 26,
  },
  note: {
    color: palette.secondary,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  resident: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomColor: palette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: palette.map,
  },
  residentName: { color: palette.text, fontWeight: "600", fontSize: 15 },
  episodes: { color: palette.secondary, fontSize: 12 },
});
