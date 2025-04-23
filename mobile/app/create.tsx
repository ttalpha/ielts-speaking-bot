import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormInput,
  FormRadioGroup,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const HabitCategories = [
  { value: "health", label: "Health And Wellness" },
  { value: "personal-development", label: "Personal Development" },
  { value: "social-and-relationshipts", label: "Social And Relationships" },
  { value: "productivity", label: "Productivity" },
  { value: "creativity", label: "Creativity" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "financial", label: "Financial" },
  { value: "leisure", label: "Leisure" },
];

const HabitDurations = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
];

export default function FormScreen() {
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const [selectTriggerWidth, setSelectTriggerWidth] = React.useState(0);
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      duration: 5,
      category: { value: "health", label: "Health And Wellness" },
      enableNotifications: false,
    },
  });

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  async function handleSubmit(values: any) {
    try {
      router.replace("/");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ScrollView
      contentContainerClassName="p-6 mx-auto w-full max-w-xl"
      showsVerticalScrollIndicator={true}
      className="bg-background"
      automaticallyAdjustContentInsets={false}
      contentInset={{ top: 12 }}
    >
      <Stack.Screen
        options={{
          title: "New Habit",
          headerShadowVisible: true,
          // headerRight: () => Platform.OS !== "web" && <Pressable onPress={() => router.dismiss()}><X /></Pressable>
        }}
      />

      <Form {...form}>
        <View className="gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInput
                label="Name"
                placeholder="Habit name"
                className="text-foreground"
                description="This will help you remind."
                autoCapitalize="none"
                {...field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormTextarea
                label="Description"
                placeholder="Habit for ..."
                description="habit description"
                {...field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormSelect
                label="Category"
                description="Select on of the habit description"
                {...field}
              >
                <SelectTrigger
                  onLayout={(ev) => {
                    setSelectTriggerWidth(ev.nativeEvent.layout.width);
                  }}
                >
                  <SelectValue
                    className={cn(
                      "text-sm native:text-lg",
                      field.value ? "text-foreground" : "text-muted-foreground"
                    )}
                    placeholder="Select a habit category"
                  />
                </SelectTrigger>
                <SelectContent
                  insets={contentInsets}
                  style={{ width: selectTriggerWidth }}
                >
                  <SelectGroup>
                    {HabitCategories.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        label={cat.label}
                        value={cat.value}
                      >
                        <Text>{cat.label}</Text>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </FormSelect>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => {
              function onLabelPress(value: number | string) {
                return () => {
                  form.setValue("duration", +value);
                };
              }
              return (
                <FormRadioGroup
                  label="Duration"
                  description="Select your duration."
                  className="gap-4"
                  {...field}
                  value={field.value.toString()}
                >
                  {HabitDurations.map((item) => {
                    return (
                      <View
                        key={item.value}
                        className={"flex-row gap-2 items-center"}
                      >
                        <RadioGroupItem
                          aria-labelledby={`label-for-${item.label}`}
                          value={item.value.toString()}
                        />
                        <Label
                          nativeID={`label-for-${item.label}`}
                          className="capitalize"
                          onPress={onLabelPress(item.value)}
                        >
                          {item.label}
                        </Label>
                      </View>
                    );
                  })}
                </FormRadioGroup>
              );
            }}
          />

          <FormField
            control={form.control}
            name="enableNotifications"
            render={({ field }) => (
              <FormSwitch
                label="Enable reminder"
                description="We will send you notification reminder."
                {...field}
                value={field.value as boolean}
              />
            )}
          />

          <Button onPress={form.handleSubmit(handleSubmit)}>
            <Text>Submit</Text>
          </Button>
          <View>
            <Button
              variant="ghost"
              onPress={() => {
                form.reset();
              }}
            >
              <Text>Clear</Text>
            </Button>
          </View>
        </View>
      </Form>
    </ScrollView>
  );
}
