import { Home, Settings } from "@/components/Icons";

import { Tabs } from "expo-router";
export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  return (
    <Tabs>
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
