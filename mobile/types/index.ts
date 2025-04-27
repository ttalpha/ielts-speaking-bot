export interface AnswerQuestionResponse {
  audio_id: string;
  ended_at: string | null;
  current_part: number;
  is_last: boolean;
}

export interface SpeakingSession {
  started_at: string;
  current_part: number;
  ended_at: string | null;
  start_audio_id: string;
}

export interface CueCard {
  question: string;
  bullet_points: string[];
}
