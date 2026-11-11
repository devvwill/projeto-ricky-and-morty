import { useSyncExternalStore } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;
/** Keep the server snapshot stable until client hydration finishes. */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const colorScheme = useRNColorScheme();
  return hasHydrated ? colorScheme : "light";
}
