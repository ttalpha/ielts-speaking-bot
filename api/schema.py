from pydantic import BaseModel
from typing import List

class NextQuestionSchema(BaseModel):
  is_last: bool
  next_question: str

class CueCardSchema(BaseModel):
  question: str
  bullet_points: List[str]

class FeedbackBandScore(BaseModel):
  band_score: float
  comment: str

  def to_dict(self):
    return {
      'band_score': self.band_score,
      'comment': self.comment,
    }

class FeedbackSchema(BaseModel):
  fluency_coherence: FeedbackBandScore
  lexical_resource: FeedbackBandScore
  grammatical_range_accuracy: FeedbackBandScore
  pronunciation: FeedbackBandScore

  def to_dict(self):
    return {
      'fluency_coherence': self.fluency_coherence.to_dict(),
      'lexical_resource': self.lexical_resource.to_dict(),
      'grammatical_range_accuracy': self.grammatical_range_accuracy.to_dict(),
      'pronunciation': self.pronunciation.to_dict(),
    }
