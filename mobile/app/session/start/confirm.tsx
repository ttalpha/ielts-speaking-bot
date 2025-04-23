import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useMicrophone } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, Text } from "@/components/ui";

export default function StartSpeakingSessionScreen() {
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const { askRecordingPermission } = useMicrophone();

  useEffect(() => {
    askRecordingPermission();
  }, []);

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
              experience and simulate the real test environment:
            </Text>
            <View className="space-y-4">
              <View className="flex flex-row items-start">
                <Text className="text-secondary-foreground font-bold mr-2">
                  1.
                </Text>
                <Text className="text-secondary-foreground">
                  Please ensure you are in a quiet and comfortable environment
                  to avoid noise and distractions.
                </Text>
              </View>
              <View className="flex flex-row items-start">
                <Text className="text-secondary-foreground font-bold mr-2">
                  2.
                </Text>
                <Text className="text-secondary-foreground">
                  Be aware that once the session begins, retakes are not
                  allowed, so take your time to prepare.
                </Text>
              </View>
              <View className="flex flex-row items-start">
                <Text className="text-secondary-foreground font-bold mr-2">
                  3.
                </Text>
                <Text className="text-secondary-foreground">
                  Once you close the app, the session will be terminated, and
                  you will need to start a new session.
                </Text>
              </View>
              <View className="flex flex-row items-start">
                <Text className="text-secondary-foreground font-bold mr-2">
                  4.
                </Text>
                <Text className="text-secondary-foreground">
                  Allow the app access to your device's microphone to start the
                  session.
                </Text>
              </View>
            </View>
          </CardContent>
          <CardFooter className="flex-col items-start gap-y-3">
            <View className="flex flex-row items-center">
              <Checkbox
                onCheckedChange={setNeverShowAgain}
                checked={neverShowAgain}
              />
              <Label className="ml-2" nativeID="agreed">
                Don't show this again
              </Label>
            </View>
            <Button>
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
