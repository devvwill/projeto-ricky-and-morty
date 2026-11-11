import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

// faz o conteúdo aparecer aos poucos, vindo um pouco de baixo, em 320 milissegundos.
// cada item espera mais 45 milissegundos, criando uma entrada em sequência.
// respeita a opção do aparelho de reduzir movimento.
const entrances = Array.from({ length: 7 }, (_, i) =>
  FadeInDown.duration(320).delay(i * 45).reduceMotion(ReduceMotion.System),
);

export function FadeInView({ children, index = 0, ...props }: PropsWithChildren<ViewProps & { index?: number }>) {
  return <Animated.View entering={entrances[Math.min(Math.max(index, 0), 6)]} {...props}>{children}</Animated.View>;
}
