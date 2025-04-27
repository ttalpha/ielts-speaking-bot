import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { useToast } from "@/components/ui/toast";
import { useCallback, useState } from "react";

const recordingOptions: Audio.RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};

export const useMicrophone = () => {
  const toast = useToast();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [, requestPermission, getPermissionsAsync] = Audio.usePermissions();

  const askRecordingPermission = useCallback(async () => {
    const { status } = await getPermissionsAsync();
    if (status === Audio.PermissionStatus.GRANTED) {
      return status;
    }
    const response = await requestPermission();
    if (response.granted) {
      toast.toast("Microphone permission granted :)", "success");
    } else {
      toast.toast("Microphone permission denied :(", "destructive");
    }
    return response.status;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log("Starting recording..");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );
      setRecording(newRecording);
      console.log("Recording started");
      return newRecording;
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }, []);

  const stopRecording = useCallback(
    async (currentRecording: Audio.Recording | null) => {
      if (!currentRecording) {
        console.error("No active recording played!");
        return null;
      }
      await currentRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      setRecording(null);
      const uri = currentRecording.getURI();
      return uri;
    },
    []
  );

  return {
    recording,
    askRecordingPermission,
    startRecording,
    stopRecording,
  };
};
