import { Home, Settings } from "@/components/Icons";

import { Tabs } from "expo-router";
export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontSize: 16,
          fontFamily: "Geist-Medium",
          color: "#111827",
          textAlign: "center", // Center the title
        },
        headerTitleAlign: "center", // Ensure title alignment is centered
        headerTitleContainerStyle: {
          paddingHorizontal: 10, // Lower the padding
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => <Home className="text-foreground" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: () => <Settings className="text-foreground" />,
        }}
      />
    </Tabs>
  );
}
