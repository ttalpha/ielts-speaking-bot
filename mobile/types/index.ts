export interface AnswerQuestionResponse {
  audio_id: string;
  ended_at: string | null;
  current_part: number;
  is_last: boolean;
}

export interface FeedbackBandScore {
  band_score: number;
  comment: string;
}

export interface Feedback {
  fluency_coherence: FeedbackBandScore;
  lexical_resource: FeedbackBandScore;
  grammatical_range_accuracy: FeedbackBandScore;
  pronunciation: FeedbackBandScore;
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
