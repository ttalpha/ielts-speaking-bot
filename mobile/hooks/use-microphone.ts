import { Audio } from "expo-av";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export const useMicrophone = () => {
  const toast = useToast();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [, requestPermission, getPermissionsAsync] = Audio.usePermissions();

  async function askRecordingPermission() {
    const { status } = await getPermissionsAsync();
    if (status === Audio.PermissionStatus.GRANTED) {
      return status;
    }
    const response = await requestPermission();
    if (response.granted) {
      toast.toast("Microphone permission granted :)", "success");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } else {
      toast.toast("Microphone permission denied :(", "destructive");
    }
    return response.status;
  }

  async function startRecording() {
    try {
      console.log("Starting recording..");
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setRecording(null);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();
    return uri;
  }

  return {
    recording,
    askRecordingPermission,
    startRecording,
    stopRecording,
  };
};
