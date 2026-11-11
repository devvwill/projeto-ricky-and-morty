import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
// lê a preferência de acessibilidade do aparelho para evitar movimentos desnecessários.
export function useReducedMotion() {
  // começa com os efeitos parados até saber qual é a preferência do usuário.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {});
    // atualiza a preferência se ela mudar enquanto o app estiver aberto.
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  return reduced;
}
