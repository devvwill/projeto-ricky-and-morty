import { DarkTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppTabs from "@/components/app-tabs";
import { PlanetsProvider } from "@/features/planets/planets-provider";
import { palette } from "@/features/planets/theme";
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <PlanetsProvider>
          <StatusBar style="light" />
          <View style={styles.background}>
            <View style={styles.app}>
              <AppTabs />
            </View>
          </View>
        </PlanetsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#080B16", alignItems: "center" },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    backgroundColor: palette.background,
  },
});
