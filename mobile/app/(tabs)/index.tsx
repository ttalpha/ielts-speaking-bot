import { View, Pressable } from "react-native";
import { useScrollToTop } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Link, Stack } from "expo-router";
import * as React from "react";

import { Text } from "@/components/ui/text";
import { Plus } from "@/components/Icons";
import { HabitCard } from "@/components/habit";
import type { Habit } from "@/lib/storage";

export default function Home() {
  return <ScreenContent />;
}

function ScreenContent() {
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const renderItem = React.useCallback(
    ({ item }: { item: Habit }) => <HabitCard {...item} />,
    []
  );

  return (
    <View className="flex flex-col basis-full bg-background p-8">
      <Stack.Screen
        options={{
          title: "Home",
        }}
      />
      <FlashList
        ref={ref}
        className="native:overflow-hidden rounded-t-lg"
        estimatedItemSize={49}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View>
            <Text className="text-lg">Hi There 👋</Text>
            <Text className="text-sm">Welcome to IELTS Speaking Assistant</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View className="p-2" />}
        data={[]}
        renderItem={renderItem}
        keyExtractor={(_, index) => `item-${index}`}
        ListFooterComponent={<View className="py-4" />}
      />
      <View className="absolute bottom-10 right-8">
        <Link href="/session/start/confirm" asChild>
          <Pressable>
            <View className="bg-primary justify-center rounded-full h-[45px] w-[45px]">
              <Plus className="text-background self-center" />
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
