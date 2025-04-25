import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have @expo/vector-icons installed
import { Button } from "../ui";

export const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(200); // Example duration in seconds (3:20)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev < duration) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <View className="flex flex-row items-center justify-between bg-background">
      {/* Play/Pause Button */}
      <Button
        size="icon"
        className="rounded-full w-12 h-12"
        onPress={togglePlayPause}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="#FFFFFF" // Adjust color as needed
        />
      </Button>
      {/* Timestamps */}
      <View className="flex ml-4 flex-row items-center space-x-2">
        <Text className="text-muted-foreground">{formatTime(currentTime)}</Text>
        <Text className="text-secondary-foreground">/</Text>
        <Text className="font-medium">{formatTime(duration)}</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-1 ml-4 h-2 bg-muted rounded-full overflow-hidden relative">
        <View
          className="absolute top-0 left-0 h-full bg-primary"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );
};
