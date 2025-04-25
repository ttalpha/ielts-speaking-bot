import {
  Audio,
  AVPlaybackSource,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  AVPlaybackStatusToSet,
} from "expo-av";
import { useEffect, useState } from "react";

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function loadSound(
    source: AVPlaybackSource,
    initialStatus?: AVPlaybackStatusToSet,
    onPlaybackStatusUpdate?: (playbackStatus: AVPlaybackStatus) => void
  ) {
    const { sound: newSound } = await Audio.Sound.createAsync(
      source,
      initialStatus,
      onPlaybackStatusUpdate
    );
    setSound(newSound);
    return newSound;
  }

  async function playSound() {
    console.log("Playing sound", sound);
    await sound?.playAsync();
  }

  async function unloadSound() {
    if (sound) {
      return () => {
        console.log("Unloading Sound on unmount");
        sound.unloadAsync();
        setSound(null);
      };
    }
  }

  return { sound, loadSound, playSound, unloadSound };
};
