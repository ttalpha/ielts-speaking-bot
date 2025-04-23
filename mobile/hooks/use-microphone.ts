import { Audio } from "expo-av";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export const useMicrophone = () => {
  const toast = useToast();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function askRecordingPermission() {
    if (permissionResponse?.status !== "granted") {
      const response = await requestPermission();
      if (response?.status !== "granted") {
        toast.toast("Permission denied", "destructive");
        return;
      } else {
        toast.toast("Permission granted", "success");
      }
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }

  async function startRecording() {
    try {
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
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
    askRecordingPermission,
    startRecording,
    stopRecording,
    permissionResponse,
  };
};
