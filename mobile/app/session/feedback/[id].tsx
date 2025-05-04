import { OverallChart } from "@/components/feedback/overall-chart";
import { ChevronLeft } from "@/components/Icons";
import { Pressable, ScrollView, View } from "react-native";
import { CriteriaChart } from "@/components/feedback/criteria-chart";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { Feedback } from "@/types";
import { FeedbackComment } from "@/components/feedback/comment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "@/components/ui";
import { useLocalStorage } from "@/hooks";
import { useToast } from "@/components/ui/toast";
import { getOverallScore } from "@/lib/utils";

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { id: sessionId } = useLocalSearchParams();
  const { getItem } = useLocalStorage();
  const { toast } = useToast();

  const getFeedback = useCallback(async () => {
    const userId: string = await getItem("userId");

    try {
      const response = await fetch(
        `http://10.0.2.2:5000/u/${userId}/s/${sessionId}/feedback`
      );
      const data = await response.json();
      const feedback = data.feedback;
      return feedback as Feedback;
    } catch (error) {
      console.log({ error });
      toast("Error creating speaking session!", "destructive");
      return null;
    }
  }, [getItem, sessionId]);

  useEffect(() => {
    getFeedback().then((f) => {
      setFeedback(f);
    });
  }, [getFeedback]);

  const overallScore = useMemo(() => {
    if (!feedback) return 0;
    return getOverallScore(
      feedback.fluency_coherence.band_score,
      feedback.lexical_resource.band_score,
      feedback.grammatical_range_accuracy.band_score,
      feedback.pronunciation.band_score
    );
  }, [feedback]);

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitle: "Feedback",
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Pressable onPress={() => router.back()}>
                <ChevronLeft width={20} height={20} color="#111827" />
              </Pressable>
            ) : (
              <></>
            ),
          headerTitleStyle: {
            fontSize: 16,
            fontFamily: "Geist-Medium",
            color: "#111827",
            // @ts-ignore
            textAlign: "center", // Center the title
          },
          headerTitleAlign: "center", // Ensure title alignment is centered
          headerTitleContainerStyle: {
            paddingHorizontal: 10, // Lower the padding
            paddingVertical: 4,
          },
        }}
      />
      {!feedback ? (
        <View className="h-full flex items-center justify-center">
          <Text className="text-muted-foreground">
            Getting feedback on your performance...
          </Text>
          <View className="mt-4 w-32 h-32 rounded-full bg-primary" />
        </View>
      ) : (
        <ScrollView>
          <OverallChart overall={overallScore} />
          <CriteriaChart
            fcScore={feedback.fluency_coherence.band_score}
            graScore={feedback.grammatical_range_accuracy.band_score}
            lrScore={feedback.lexical_resource.band_score}
            pronunciationScore={feedback.pronunciation.band_score}
          />
          <View className="pb-4 grid gap-y-4">
            <FeedbackComment
              criterion="Fluency & Coherence"
              comment={feedback.fluency_coherence.comment}
            />
            <FeedbackComment
              criterion="Lexical Resource"
              comment={feedback.lexical_resource.comment}
            />
            <FeedbackComment
              criterion="Grammatical Range & Accuracy"
              comment={feedback.grammatical_range_accuracy.comment}
            />
            <FeedbackComment
              criterion="Pronunciation"
              comment={feedback.pronunciation.comment}
            />
          </View>
        </ScrollView>
      )}
    </>
  );
}
