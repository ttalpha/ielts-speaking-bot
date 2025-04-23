# This schema is used to detect short answers or memorized answers and ask a follow-up question.
next_question_schema = {
  "format": {
    "type": "json_schema",
    "name": "generate_next_question",
    "description": "Generate the next question based on the instruction and the candidate's answer.",
    "schema": {
      "type": "object",
      "properties": {
        "next_question": {
          "type": "string",
          "description": "The next question depending on the answer.",
        },
      },
      "required": ["next_question"],
      "additionalProperties": False
    },
    "strict": True
  },
}

cue_card_schema = {
  "format": {
    "type": "json_schema",
    "name": "generate_cue_card",
    "description": "Generate a cue card for IELTS speaking part 2.",
    "schema": {
      "type": "object",
      "properties": {
        "question": {
          "type": "string",
          "description": "The question to ask the candidate.",
        },
        "bullet_points": {
          "type": "array",
          "items": {
            "type": "string",
            "description": "A bullet point to include in the cue card.",
          },
          "description": "Bullet points to include in the cue card.",
        },
      },
      "required": ["question", "bullet_points"],
      "additionalProperties": False
    },
    "strict": True
  },
}

feedback_schema = {
  "format": {
    "type": "json_schema",
    "name": "generate_feedback",
    "description": "Generate feedback for the candidate based on their performance.",
    "schema": {
      "type": "object",
      "properties": {
        "fluency_coherence": {
          "type": "object",
          "properties": {
            "band_score": {
              "type": "number",
              "description": "Band score for fluency and coherence.",
            },
            "comment": {
              "type": "string",
              "description": "Detailed feedback on fluency and coherence.",
            },
          },
          "additionalProperties": False,
          "required": ["band_score", "comment"],
        },
        "lexical_resource": {
          "type": "object",
          "properties": {
            "band_score": {
              "type": "number",
              "description": "Band score for lexical resource.",
            },
            "comment": {
              "type": "string",
              "description": "Detailed feedback on lexical resource.",
            },
          },
          "additionalProperties": False,
          "required": ["band_score", "comment"],
        },
        "grammatical_range_accuracy": {
          "type": "object",
          "properties": {
            "band_score": {
              "type": "number",
              "description": "Band score for grammatical range and accuracy.",
            },
            "comment": {
              "type": "string",
              "description": "Detailed feedback on grammatical range and accuracy.",
            },
          },
          "additionalProperties": False,
          "required": ["band_score", "comment"],
        },
        "pronunciation": {
          "type": "object",
          "properties": {
            "band_score": {
              "type": "number",
              "description": "Band score for pronunciation.",
            },
            "comment": {
              "type": "string",
              "description": "Detailed feedback on pronunciation.",
            },
          },
          "additionalProperties": False,
          "required": ["band_score", "comment"],
        },
        'suggestions': {
          "type": "array",
          "items": {
            "type": "string",
            "description": "Suggestions for improvement.",
          },
          "description": "Suggestions for improvement.",
        },
      },
      "required": ["fluency_coherence", "lexical_resource", "grammatical_range_accuracy", "pronunciation", "suggestions"],
      "additionalProperties": False
    },
    "strict": True
  },
}