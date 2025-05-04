import { Audio } from "expo-av";
import { router } from "expo-router";
import { useLocalStorage } from "./use-local-storage";
import { useMicrophone } from "./use-microphone";
import { useToast } from "@/components/ui/toast";
import { useCallback } from "react";

export const useCreateSession = () => {
  const { getItem } = useLocalStorage();
  const { askRecordingPermission } = useMicrophone();
  const { toast } = useToast();

  const createSpeakingSession = useCallback(async () => {
    const userId = await getItem("userId");
    if (!userId) return;
    try {
      const response = await fetch(
        `http://10.0.2.2:5000/u/${userId}/session/new`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const session = await response.json();
      return session.id;
    } catch (error) {
      toast(`Error creating speaking session: ${error}`, "destructive");
    }
  }, [getItem]);

  const redirectToSpeakingSession = useCallback(async () => {
    const sessionId = await createSpeakingSession();
    if (sessionId) {
      router.navigate(`/session/speak/${sessionId}`);
    }
  }, [createSpeakingSession]);

  const onContinue = useCallback(async () => {
    const status = await askRecordingPermission();
    if (status === Audio.PermissionStatus.DENIED) {
      toast("You must allow microphone access to continue!", "destructive");
      return;
    }
    await redirectToSpeakingSession();
  }, [redirectToSpeakingSession]);

  return { onContinue };
};
