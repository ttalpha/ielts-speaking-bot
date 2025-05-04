import "./global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { type Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@/components/primitives/portal";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { Platform } from "react-native";
import { ToastProvider } from "../components/ui/toast";
import { useLocalStorage } from "../hooks";
import { generateId } from "../lib/utils";

const NAV_FONT_FAMILY = "Geist";
const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "500",
    },
    bold: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "800",
    },
  },
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "500",
    },
    bold: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "800",
    },
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Geist: require("../assets/fonts/Geist-Regular.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
    "Geist-Medium": require("../assets/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("../assets/fonts/Geist-SemiBold.ttf"),
    "Geist-ExtraBold": require("../assets/fonts/Geist-ExtraBold.ttf"),
  });
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const { getItem, setItem } = useLocalStorage();

  React.useEffect(() => {
    (async () => {
      const userId = await getItem("userId");
      console.log("userId", userId);
      if (!userId) {
        await setItem("userId", generateId());
        console.log("set userId", generateId());
      }
    })();
  }, [getItem, setItem]);

  React.useEffect(() => {
    (async () => {
      const theme = await getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        setAndroidNavigationBar(colorScheme);
        await setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      setAndroidNavigationBar(colorTheme);
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      if (fontsLoaded && !error) SplashScreen.hideAsync();
    });
  }, [fontsLoaded, error]);

  if (!isColorSchemeLoaded || !fontsLoaded) {
    return null;
  }
  console.log({ fontsLoaded, error });

  return (
    <>
      <ToastProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </ToastProvider>

      <PortalHost />
    </>
  );
}
