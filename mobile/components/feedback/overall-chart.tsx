import { Text } from "@/components/ui";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

export interface OverallChartProps {
  overall: number;
}

const MAX_BAND_SCORE = 9;

export function OverallChart({ overall }: OverallChartProps) {
  const cefr = useMemo(() => {
    // Function to map IELTS band score to CEFR level
    if (overall >= 8.5) {
      return "C2 Proficient";
    } else if (overall >= 7.0) {
      return "C1 Advanced";
    } else if (overall >= 6.0) {
      return "B2 Upper Intermediate";
    } else if (overall >= 5.0) {
      return "B1 Intermediate";
    } else if (overall >= 3.0) {
      return "A2 Elementary";
    } else {
      return "A1 Beginner"; // For scores below 2.0
    }
  }, [overall]);

  const { id: sessionId } = useLocalSearchParams();

  const radius = 80;
  const strokeWidth = 10;
  const center = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percent = overall / MAX_BAND_SCORE;
  const strokeDashoffset = circumference * (1 - percent);

  return (
    <View className="pt-6 px-4">
      {/* Header */}
      <View className="items-center pb-2">
        <Text className="text-lg font-semibold">Overall Band Score</Text>
        <Text className="text-muted-foreground">Session ID: {sessionId}</Text>
      </View>

      {/* Chart */}
      <View className="items-center my-6 justify-center h-48">
        <Svg width={center * 2} height={center * 2}>
          <G rotation="90" origin={`${center}, ${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E5E7EB" // muted background
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#e76e50" // chart fill
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </G>
          <SvgText
            x={center}
            y={center}
            textAnchor="middle"
            fontSize="32"
            fontFamily="Geist-Bold"
            fill="#111827"
          >
            {overall.toFixed(1)}
          </SvgText>
          <SvgText
            x={center}
            y={center + 20}
            fontFamily="Geist-Medium"
            textAnchor="middle"
            fontSize="14"
            fill="#6B7280"
          >
            {cefr}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}
