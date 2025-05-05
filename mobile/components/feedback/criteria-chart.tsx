import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import Svg, { Line, Polygon, Text as SvgText } from "react-native-svg";

const maxScore = 9;
const height = 300;
const width = Dimensions.get("screen").width;
const xCenter = width / 2;
const yCenter = height / 2;
const levels = 3;
const radius = height / 2 - 30;

interface CriteriaChartProps {
  fcScore: number;
  graScore: number;
  lrScore: number;
  pronunciationScore: number;
}

export function CriteriaChart({
  fcScore,
  graScore,
  lrScore,
  pronunciationScore,
}: CriteriaChartProps) {
  const chartData = useMemo(
    () => [
      { criteria: "F&C", score: fcScore },
      { criteria: "LR", score: lrScore },
      { criteria: "GR&A", score: graScore },
      { criteria: "P", score: pronunciationScore },
    ],
    [fcScore, graScore, lrScore, pronunciationScore]
  );

  const angleSlice = (2 * Math.PI) / chartData.length;

  const getCoordinates = (value: number, i: number, scale = 1) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (value / maxScore) * radius * scale;
    const x = xCenter + r * Math.cos(angle);
    const y = yCenter + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const radarPoints = chartData.map((point, i) =>
    getCoordinates(point.score, i)
  );

  const getAxisLabelPosition = (i: number, distance = radius + 20) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = xCenter + distance * Math.cos(angle);
    const y = yCenter + distance * Math.sin(angle);
    return { x, y };
  };

  return (
    <View className="px-4 py-6">
      {/* Header */}
      <View className="items-center pb-4">
        <Text className="text-lg font-semibold">Criteria Band Scores</Text>
        <Text className="text-muted-foreground text-sm text-center">
          (F&C: Fluency & Coherence, LR: Lexical Resource, GR&A: Grammatical
          Range & Accuracy, P: Pronunciation)
        </Text>
      </View>

      {/* Chart */}
      <View className="items-center justify-center">
        <Svg width={width} height={height + 20}>
          {/* Background Levels */}
          {[...Array(levels)].map((_, l) => {
            const scale = (l + 1) / levels;
            const levelPoints = chartData
              .map((_, i) => getCoordinates(maxScore, i, scale))
              .join(" ");
            return (
              <Polygon
                key={`level-${l}`}
                points={levelPoints}
                fill="none"
                stroke="#E5E7EB"
              />
            );
          })}

          {/* Axes */}
          {chartData.map((_, i) => {
            const coord = getCoordinates(maxScore, i);
            const [x, y] = coord.split(",").map(Number);
            return (
              <Line
                key={`axis-${i}`}
                x1={xCenter}
                y1={yCenter}
                x2={x}
                y2={y}
                stroke="#E5E7EB"
              />
            );
          })}

          {/* Data Area */}
          <Polygon
            points={radarPoints.join(" ")}
            fill="#2A9D90"
            fillOpacity={0.6}
          />

          {/* Axis Labels */}
          {chartData.map((point, i) => {
            const { x, y } = getAxisLabelPosition(i);
            return (
              <React.Fragment key={`data-${i}`}>
                <SvgText
                  key={`label-${i}`}
                  x={x}
                  y={y}
                  fontSize="12"
                  fill="#6B7280"
                  textAnchor="middle"
                  fontFamily="Geist"
                >
                  {point.criteria}
                </SvgText>
                <SvgText
                  key={`band-${i}`}
                  x={x}
                  y={y + 15}
                  fontSize="13"
                  fill="#364153"
                  textAnchor="middle"
                  fontFamily="Geist-Bold"
                >
                  {point.score.toFixed(1)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
