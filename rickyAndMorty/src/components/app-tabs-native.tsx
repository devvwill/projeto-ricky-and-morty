import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { MapIcon } from "@/features/planets/components/map-icon";
import { palette } from "@/features/planets/theme";
export default function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarActiveTintColor: palette.green,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
          height: 72 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(10, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 11, marginTop: 3 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => <MapIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Lista",
          tabBarIcon: ({ color }) => <MapIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color }) => <MapIcon name="favorites" color={color} />,
        }}
      />
    </Tabs>
  );
}
