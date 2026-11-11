import type { Animated } from "react-native";
export type ParticleAnchor = {
  id: number;
  x: number;
  y: number;
  selected: boolean;
};
export type ParticleFieldProps = {
  width: number;
  height: number;
  anchors: ParticleAnchor[];
  phase: Animated.Value;
  active: boolean;
  reduced: boolean;
};
