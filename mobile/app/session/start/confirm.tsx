import { Button, Text } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCreateSession, useLocalStorage } from "@/hooks";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

export default function StartSpeakingSessionScreen() {
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const { setItem } = useLocalStorage();
  const { onContinue } = useCreateSession();
  const requirements = [
    "At least 15 minutes to complete the session without any interruption.",
    "Have stable Internet connection throughout the session.",
    "Turn on the sound and ensure your device is not in silent mode to hear the questions.",
    "Allow the app to access your device's microphone to start the session.",
    "Ensure you are in an environment free of noise and distraction.",
    "Speak clearly and loudly enough so we can generate accurate feedback.",
    "If you quit at the middle of the session, it won't be saved and you have to start a new one.",
    "Have a piece of paper and a pen/pencil next to you so you can take notes when you're told to do so.",
  ];

  const startSession = useCallback(async () => {
    await setItem("neverShowAgain", String(neverShowAgain));
    await onContinue();
  }, [setItem, onContinue, neverShowAgain]);

  return (
    <>
      <Stack.Screen options={{ title: "Start speaking session" }} />
      <View className="pr-3 bg-background pt-4">
        <Card className="p-0 border-0">
          <CardHeader>
            <CardTitle>Welcome to the IELTS Speaking Session</CardTitle>
            <CardDescription className="text-base">
              The IELTS speaking session is designed to simulate the real IELTS
              speaking test with AI-powered feedback after you finish the test.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="text-secondary-foreground mb-2">
              Before starting the IELTS speaking session, please ensure you meet
              the following conditions. This will help you have the best
              experience like in the real test environment:
            </Text>
            <View className="space-y-4">
              {requirements.map((requirement, index) => (
                <View key={index} className="flex flex-row items-start">
                  <Text className="text-secondary-foreground font-semibold mr-2">
                    {index + 1}.
                  </Text>
                  <Text className="text-secondary-foreground">
                    {requirement}
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
          <CardFooter className="flex-col items-start gap-y-3">
            <View className="flex flex-row items-center">
              <Checkbox
                onCheckedChange={setNeverShowAgain}
                checked={neverShowAgain}
              />
              <Label className="ml-2" nativeID="neverShowAgain">
                Don't show this again
              </Label>
            </View>
            <Button onPress={startSession}>
              <Text className="text-primary-foreground font-medium">
                Continue
              </Text>
            </Button>
          </CardFooter>
        </Card>
      </View>
    </>
  );
}
