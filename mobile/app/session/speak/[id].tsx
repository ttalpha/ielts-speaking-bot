import { useAudio, useLocalStorage, useMicrophone, useTimer } from "@/hooks";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "@/components/ui";
import { AnswerQuestionResponse, CueCard } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const PREPARATION_TIME = 60;
const PART2_SPEAKING_TIME = 120;

export default function SpeakingSession() {
  const { toast } = useToast();
  const { id: sessionId } = useLocalSearchParams();
  const { getItem } = useLocalStorage();
  const { recording, startRecording, stopRecording, askRecordingPermission } =
    useMicrophone();
  const { playSound, loadSound, unloadSound } = useAudio();
  const [preparationTime, startPreparationTime] = useTimer(PREPARATION_TIME, 0);
  const [part2SpeakingTime, startPart2SpeakingTime] = useTimer(
    PART2_SPEAKING_TIME,
    0
  );

  const [cueCard, setCueCard] = useState<CueCard | null>(null);
  const [currentPart, setCurrentPart] = useState(1);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await askRecordingPermission();
    if (status === Audio.PermissionStatus.DENIED) {
      router.navigate("/");
    } else {
      await introduction();
      console.log("Start first question");
    }
  };

  const getSession = async () => {
    const userId = await getItem("userId");
    if (!userId) return;
    try {
      const response = await fetch(
        `http://10.0.2.2:5000/u/${userId}/s/${sessionId}`
      );
      const session = await response.json();

      return session.start_audio_id;
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const introduction = async () => {
    try {
      await loadSound(
        require("../../../assets/audio/intro.mp3"),
        { shouldPlay: true },
        async (playbackStatus) => {
          if ((playbackStatus as AVPlaybackStatusSuccess)?.didJustFinish) {
            await unloadSound();
            const startAudioId = await getSession();
            await askQuestion(startAudioId);
          }
        }
      );
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  const askQuestion = async (audioId: string) => {
    try {
      const userId = await getItem("userId");
      if (!userId) return;
      await loadSound(
        {
          uri: `http://10.0.2.2:5000/u/${userId}/s/${sessionId}/audio/${audioId}`,
        },
        { shouldPlay: true },
        async (playbackStatus) => {
          if ((playbackStatus as AVPlaybackStatusSuccess)?.didJustFinish) {
            await unloadSound();
            await startRecording();
          }
        }
      );
      await playSound();
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  const sendRecording = async (uri: string) => {
    const userId = await getItem("userId");
    if (!userId) return;
    const formData = new FormData();
    // @ts-ignore
    formData.append("audio", {
      uri,
      name: "recording.mp3",
      type: "audio/m4a",
    });
    try {
      const response = await fetch(
        `http://10.0.2.2:5000/u/${userId}/s/${sessionId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );
      const data: AnswerQuestionResponse = await response.json();
      console.log({ data });
      return data;
    } catch (error) {
      console.error("Error sending recording:", error);
    }
  };

  const nextQuestion = useCallback(
    async (currentRecording: Audio.Recording, currentPart: number) => {
      const uri = await stopRecording(currentRecording);

      const response = await sendRecording(uri!);

      if (!response) return;
      console.log({ currentPart, nextPart: response.current_part });
      if (response.is_last) {
        if (response.ended_at) {
          await endSession();
          return;
        }
        console.log(`Starting part ${currentPart + 1}...`);
        setCurrentPart(response.current_part);
        if (response.current_part === 2 && currentPart === 1) {
          await startPartTwo();
          return;
        }
      }
      await askQuestion(response.audio_id);
    },
    []
  );

  const endSession = useCallback(async () => {
    try {
      await loadSound(
        require("../../../assets/audio/end.mp3"),
        { shouldPlay: true },
        async (playbackStatus) => {
          if ((playbackStatus as AVPlaybackStatusSuccess)?.didJustFinish) {
            await unloadSound();
            toast("Session ended. Generating feedback...", "info");
            router.navigate(`/session/feedback/${sessionId}`);
          }
        }
      );
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  }, [sessionId]);

  const fetchCueCard = async () => {
    const userId = await getItem("userId");
    if (!userId) return;
    try {
      const response = await fetch(
        `http://10.0.2.2:5000/u/${userId}/s/${sessionId}/cue_card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data.cue_card as CueCard;
    } catch (error) {
      console.error("Error fetching cue card data:", error);
    }
  };

  const startPartTwo = useCallback(async () => {
    await loadSound(
      require("../../../assets/audio/part2_prepare.mp3"),
      { shouldPlay: true },
      async (playbackStatus) => {
        if ((playbackStatus as AVPlaybackStatusSuccess)?.didJustFinish) {
          await unloadSound();
          const cueCardData = await fetchCueCard();
          if (!cueCardData) return;
          setCueCard(cueCardData);
          startPreparationTime(() => promptPart2Speaking(currentPart));
        }
      }
    );
  }, [currentPart]);

  const promptPart2Speaking = useCallback(async (currentPart: number) => {
    await loadSound(
      require("../../../assets/audio/part2_speak.mp3"),
      { shouldPlay: true },
      async (playbackStatus) => {
        if ((playbackStatus as AVPlaybackStatusSuccess)?.didJustFinish) {
          await unloadSound();
          const newRecording = await startRecording();
          if (!newRecording) return;

          startPart2SpeakingTime(async () => {
            await nextQuestion(newRecording, currentPart);
            setCueCard(null);
          });
        }
      }
    );
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 font-bold">Part {currentPart}</Text>
        {cueCard && (
          <Card className="w-full mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{cueCard.question}</CardTitle>
              <CardDescription className="text-base">
                You should say:
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cueCard.bullet_points.map((point, index) => (
                <Text key={index} className="text-secondary-foreground">
                  {point}
                </Text>
              ))}
            </CardContent>
          </Card>
        )}
        {preparationTime > 0 && preparationTime < PREPARATION_TIME && (
          <Text className="text-muted-foreground">
            {preparationTime} seconds to take notes...
          </Text>
        )}
        {part2SpeakingTime > 0 && part2SpeakingTime < PART2_SPEAKING_TIME && (
          <Text className="text-muted-foreground">
            {part2SpeakingTime} seconds to speak...
          </Text>
        )}
        {recording && (
          <Text className="text-muted-foreground">
            Recording your answer...
          </Text>
        )}
        <View className="mt-4 w-32 h-32 rounded-full bg-primary items-center justify-center" />
        {recording && (
          <Button
            className="mt-6"
            onPress={() => nextQuestion(recording, currentPart)}
          >
            <Text className="font-medium">Next</Text>
          </Button>
        )}
      </View>
    </>
  );
}
