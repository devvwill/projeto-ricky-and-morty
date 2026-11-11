import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Planets } from "@/types/planets";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { palette } from "../theme";
import { planetPosition } from "../utils/map-layout";
import { Feedback } from "./feedback";
import { ParticleField } from "./particle-field";
import { PlanetMarker } from "./planet-marker";
import { useMapMotion } from "../hooks/use-map-motion";
type Props = {
  suspended?: boolean;
  planets: Planets[];
  visibleIds: Set<number>;
  selected: number | undefined;
  onSelect: (planet: Planets) => void;
};
export function PlanetMap({
  planets,
  visibleIds,
  selected,
  onSelect,
  suspended = false,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const reduced = useReducedMotion();
  const { phase, active } = useMapMotion(
    reduced,
    suspended || visibleIds.size === 0,
  );
  const anchors = useMemo(
    () =>
      planets.flatMap((planet, index) => {
        if (!visibleIds.has(planet.id)) return [];
        const position = planetPosition(planet.id, index, planets.length);
        return [
          {
            id: planet.id,
            x: position.x * (size.width - 40) + 20,
            y: position.y * (size.height - 40) + 20,
            selected: selected === planet.id,
          },
        ];
      }),
    [planets, visibleIds, selected, size],
  );
  // separa o tamanho animado do mapa da distância que ele foi arrastado.
  const [zoomScale] = useState(() => new Animated.Value(1));
  const [offset] = useState(() => new Animated.ValueXY());
  const [previous, setPrevious] = useState({ x: 0, y: 0 });
  // limita o arraste para o mapa não sumir para fora da área visível.
  const bounds = useMemo(
    () => ({
      x: (size.width * (zoom - 1)) / 2,
      y: (size.height * (zoom - 1)) / 2,
    }),
    [size, zoom],
  );
  const clamp = (n: number, max: number) => Math.max(-max, Math.min(max, n));
  // depois de ampliar, o mapa acompanha o dedo e guarda onde o arraste terminou.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          zoom > 1 && (Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6),
        onPanResponderMove: (_, gesture) =>
          offset.setValue({
            x: clamp(previous.x + gesture.dx, bounds.x),
            y: clamp(previous.y + gesture.dy, bounds.y),
          }),
        onPanResponderRelease: (_, gesture) => {
          setPrevious({
            x: clamp(previous.x + gesture.dx, bounds.x),
            y: clamp(previous.y + gesture.dy, bounds.y),
          });
        },
        onPanResponderTerminate: () => {
          offset.setValue(previous);
        },
      }),
    [zoom, bounds, offset, previous],
  );
  // muda o zoom em 240 milissegundos, desacelerando no final para não dar um salto.
  useEffect(() => {
    const animation = Animated.timing(zoomScale, {
      toValue: zoom,
      duration: reduced ? 0 : 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [zoom, reduced, zoomScale]);
  // aumenta ou diminui o zoom e devolve o mapa ao centro.
  const changeZoom = (amount: number) => {
    setZoom((value) => Math.max(1, Math.min(3, value + amount)));
    setPrevious({ x: 0, y: 0 });
    offset.setValue({ x: 0, y: 0 });
  };
  return (
    <View
      style={styles.map}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
    >
      <Animated.View
        {...pan.panHandlers}
        style={[
          StyleSheet.absoluteFill,
          { transform: offset.getTranslateTransform() },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ scale: zoomScale }] },
          ]}
        >
          <ParticleField
            width={size.width}
            height={size.height}
            anchors={anchors}
            phase={phase}
            active={active}
            reduced={reduced}
          />
          {planets.map((planet, index) => {
            if (!visibleIds.has(planet.id)) return null;
            const position = planetPosition(planet.id, index, planets.length);
            const active = selected === planet.id;
            return (
              <Pressable
                key={planet.id}
                accessibilityRole="button"
                accessibilityLabel={`Explorar ${planet.name}, ${planet.dimension}`}
                accessibilityState={{ selected: active }}
                onPress={() => {
                  Keyboard.dismiss();
                  onSelect(planet);
                }}
                style={[
                  styles.target,
                  {
                    left: position.x * (size.width - 40),
                    top: position.y * (size.height - 40),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.marker,
                    // compensa o zoom para o desenho do mundo continuar do mesmo tamanho.
                    { transform: [{ scale: Animated.divide(1, zoomScale) }] },
                  ]}
                >
                  <PlanetMarker
                    id={planet.id}
                    selected={active}
                    phase={phase}
                  />
                </Animated.View>
              </Pressable>
            );
          })}
        </Animated.View>
      </Animated.View>
      {!visibleIds.size && (
        <Feedback message="Nenhum planeta encontrado. Tente outro mundo ou dimensão." />
      )}
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aumentar zoom"
          accessibilityState={{ disabled: zoom === 3 }}
          disabled={zoom === 3}
          onPress={() => changeZoom(0.5)}
          style={[styles.control, zoom === 3 && styles.disabled]}
        >
          <Text style={styles.symbol}>＋</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Diminuir zoom"
          accessibilityState={{ disabled: zoom === 1 }}
          disabled={zoom === 1}
          onPress={() => changeZoom(-0.5)}
          style={[styles.control, zoom === 1 && styles.disabled]}
        >
          <Text style={styles.symbol}>−</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: palette.map,
    borderRadius: 11,
    overflow: "hidden",
    marginHorizontal: 7,
  },
  target: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: { position: "absolute", right: 8, bottom: 16, gap: 8 },
  control: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 3px 3px #00000080",
  },
  symbol: {
    color: palette.text,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "300",
  },
  disabled: { opacity: 0.5 },
});
