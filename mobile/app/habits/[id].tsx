import { Button } from "@/components/ui/button";
import {
  Form,
  FormElement,
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
import { Text } from "@/components/ui/text";
import type { Habit } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

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
  const scrollRef = React.useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [habit, setHabit] = React.useState<Habit>();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectTriggerWidth, setSelectTriggerWidth] = React.useState(0);
  useFocusEffect(
    React.useCallback(() => {
      fetchHabitById();
    }, [])
  );
  const defaultValues = React.useMemo(() => {
    if (habit) {
      return {
        name: habit.name,
        description: habit.description,
        category: HabitCategories.find((cat) => cat.value === habit.category),
        duration: habit.duration,
        enableNotifications: habit?.enableNotifications,
      };
    }
    return {
      name: "",
      description: "",
      duration: {
        label: "",
        value: "",
      },
      category: {
        label: "",
        value: "",
      },
      enableNotifications: false,
    };
  }, [habit]);

  const form = useForm({});

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const fetchHabitById = async () => {
    const fetchedHabit = null;
    if (fetchedHabit) {
      setHabit(fetchedHabit[0]);
    }
  };

  // const handleArchiveHabit = async () => {
  //   try {
  //     await db?.update(habitTable).set({archived: true}).where(eq(habitTable.id, id)).execute();
  //     router.replace("/")
  //   } catch (error) {
  //     console.error(error)
  //   }

  // };

  async function handleSubmit(values: any) {
    try {
      router.replace("/");
    } catch (error) {
      console.error("error", error);
    }
  }
  return (
    <ScrollView
      ref={scrollRef}
      contentContainerClassName="p-6 mx-auto w-full max-w-xl"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
      contentInset={{ top: 12 }}
    >
      <Stack.Screen
        options={{
          title: "Habit",
        }}
      />
      <FormElement onSubmit={handleSubmit}>
        <Form {...form}>
          <View className="gap-7">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInput
                  label="Name"
                  className="text-foreground"
                  placeholder="habit name"
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
              render={({ field }) => {
                return (
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
                          field.value
                            ? "text-foreground"
                            : "text-muted-foreground"
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
                );
              }}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => {
                function onLabelPress(value: number) {
                  return () => {
                    form.setValue("duration", value);
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

            <Button
              disabled={!form.formState.isDirty}
              onPress={form.handleSubmit(handleSubmit)}
            >
              <Text>Update</Text>
            </Button>
          </View>
        </Form>
      </FormElement>
      {/* <AlertDialog>
        <AlertDialogTrigger asChild>

          <Button
            className="shadow shadow-foreground/5 my-4 bg-background"
          >
            <Text>Archive</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this habit ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction className="bg-foreground" onPress={handleArchiveHabit}>
              <Text>Archive</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </ScrollView>
  );
}
