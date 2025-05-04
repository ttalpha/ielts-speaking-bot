import { useScrollToTop } from "@react-navigation/native";
import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";

import { Plus } from "@/components/Icons";
import { Text } from "@/components/ui/text";
import { useCreateSession, useLocalStorage } from "@/hooks";
import { useCallback } from "react";
import { Button } from "@/components/ui";

export default function Home() {
  return <ScreenContent />;
}

function ScreenContent() {
  const { getItem } = useLocalStorage();
  const { onContinue } = useCreateSession();
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const onNext = useCallback(async () => {
    const neverShowAgain = await getItem("neverShowAgain");
    if (!neverShowAgain || neverShowAgain === "false") {
      router.push("/session/start/confirm");
    } else {
      await onContinue();
    }
  }, [getItem, router, onContinue]);

  return (
    <View className="flex flex-col basis-full bg-background p-8">
      <View>
        <Text className="font-bold text-lg">Hi There 👋</Text>
        <Text className="text-sm">Welcome to IELTS Speaking Assistant</Text>
      </View>
      <View className="absolute bottom-10 right-8">
        <Button onPress={onNext} className="rounded-full" size="icon">
          <View className="bg-primary justify-center rounded-full h-[45px] w-[45px]">
            <Plus className="text-background self-center" />
          </View>
        </Button>
      </View>
    </View>
  );
}
