import { useEffect, useState } from "react";
import { AppState, Animated, Easing } from "react-native";
import { useIsFocused } from "expo-router";

// um único relógio controla os mundos e as estrelas para deixar o mapa mais leve.
export function useMapMotion(reduced: boolean, suspended: boolean) {
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(
    AppState.currentState === "active",
  );
  // este valor vai de 0 a 1 e indica em que parte da animação estamos.
  const [phase] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setForeground(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  // só anima quando a aba está aberta, o app está em uso e o painel não está expandido.
  const active = focused && foreground && !suspended;
  useEffect(() => {
    // deixa os efeitos parados quando o usuário reduz movimento ou não está vendo o mapa.
    if (reduced || !active) {
      phase.setValue(0);
      return;
    }
    // repete um ciclo de 14 segundos, sempre na mesma velocidade.
    const animation = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        // no celular, o sistema cuida dos movimentos sem redesenhar os componentes a cada quadro.
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    animation.start();
    // para o ciclo ao sair da tela ou mudar as condições acima.
    return () => animation.stop();
  }, [phase, reduced, active]);
  return { phase, active };
}
