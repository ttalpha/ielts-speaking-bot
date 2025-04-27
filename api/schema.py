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

class FeedbackSchema(BaseModel):
  fluency_coherence: FeedbackBandScore
  lexical_resource: FeedbackBandScore
  grammatical_range_accuracy: FeedbackBandScore
  pronunciation: FeedbackBandScore
  suggestions: List[str]
