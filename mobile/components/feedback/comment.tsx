import { View } from "react-native";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface FeedbackCommentProps {
  criterion: string;
  comment: string;
}

export const FeedbackComment = ({
  criterion,
  comment,
}: FeedbackCommentProps) => {
  return (
    <View className="px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{criterion}</CardTitle>
          <CardDescription className="text-base">{comment}</CardDescription>
        </CardHeader>
      </Card>
    </View>
  );
};
