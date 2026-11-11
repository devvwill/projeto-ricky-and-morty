import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { palette } from "../theme";
export function Feedback({
  loading,
  message,
  action,
  onAction,
}: {
  loading?: boolean;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrapper} accessibilityLiveRegion="polite">
      {loading && <ActivityIndicator color={palette.green} />}
      <Text style={styles.message}>{message}</Text>
      {action && onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.button}
        >
          <Text style={styles.label}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  message: { color: palette.secondary, textAlign: "center", lineHeight: 22 },
  button: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: palette.green,
    justifyContent: "center",
  },
  label: { color: palette.background, fontWeight: "700" },
});
