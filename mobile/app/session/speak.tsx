import { useAudio, useMicrophone } from "@/hooks";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "@/components/ui";

const audioIds = [
  "dcc37dd4-7354-4473-8460-21bce2251950",
  "01e64d93-6cef-4659-963f-d589373fa796",
  "4b124112-f634-4c0a-87a1-dca5e2d26ea7",
  "cc8980de-0022-43d3-ba90-8df78e9e31b4",
  "fccf08d4-67d8-48ff-9fa8-d1654e4ac68e",
  "181b9fea-f0dd-4743-bbd6-f20106a1f716",
  "254a390d-47e3-4b1d-b15d-33119efd36a5",
  "f7e4410b-c3c8-4b2b-b37d-da98f3efefb6",
  "18230e5f-6b82-473c-971c-8a03866190d7",
  "26337abc-1ecf-4266-a6af-d7ff4b016505",
  "3fdea383-6959-46bb-9eda-bfbd0dd1fe05",
  "4e545047-ef3a-4adc-9fb8-e835b08ce229",
];

export default function SpeakingSession() {
  const { recording, startRecording, stopRecording, askRecordingPermission } =
    useMicrophone();
  const { playSound, loadSound, unloadSound } = useAudio();
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1);

  useEffect(() => {
    checkPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // This runs when the screen gains focus
      if (recording) {
        return () => {
          // This runs when the screen loses focus
          console.log("Stopping recording due to screen losing focus.");
          stopRecording();
        };
      }
    }, [recording])
  );

  const checkPermission = async () => {
    const status = await askRecordingPermission();
    if (status === Audio.PermissionStatus.DENIED) {
      router.replace("/");
    } else {
      await introduction();
      console.log("Start first question");
    }
  };

  const introduction = async () => {
    try {
      await loadSound(
        require("../../assets/audio/introduction.wav"),
        { shouldPlay: true },
        async (playbackStatus) => {
          if ((playbackStatus as AVPlaybackStatusSuccess)?.didJustFinish) {
            setCurrentAudioIndex(0);
            await unloadSound();
          }
        }
      );
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  const askQuestion = async () => {
    try {
      await loadSound(
        {
          uri: `http://10.0.2.2:5000/u/123/s/58246962-5946-4023-84df-772835abe341/audio/${audioIds[currentAudioIndex]}`,
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

  const nextQuestion = async () => {
    await stopRecording();
    setCurrentAudioIndex((prevIndex) => prevIndex + 1);
  };

  useEffect(() => {
    if (currentAudioIndex < 0) return;
    console.log("Playing sound for question", audioIds[currentAudioIndex]);

    askQuestion().catch((err) => {
      console.error("Error playing sound:", err);
    });
  }, [currentAudioIndex]);

  return (
    <>
      <Stack.Screen options={{ title: "Speaking Session" }} />
      <View className={"flex-1 items-center justify-center p-6"}>
        <View className="w-32 h-32 rounded-full bg-primary items-center justify-center" />
        {recording && currentAudioIndex < audioIds.length - 1 && (
          <Button onPress={nextQuestion}>
            <Text>Next</Text>
          </Button>
        )}
      </View>
    </>
  );
}
