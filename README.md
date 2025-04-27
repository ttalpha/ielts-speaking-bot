# IELTS Speaking Assistant

An AI-powered assistant that can give feedback on IELTS Speaking performance.

## User Journey
### Part 1

1. AI bot will ask a question.
2. The user will have up to 45 seconds to answer the question.
3. The user can ask to repeat/rephrase the question or explain a word/phrase up to 2 times.
4. AI bot will move on to the next question if either condition satisfies:
- The user is silent for 2 seconds
- The user has answered up to 45 seconds, AI bot will interrupt their speech with "Thank you for your answer." and ask the next question
5. If the user is completely silent for the first 5 seconds, AI bot will say "Sorry, would you like me to repeat the question?"
- If the user says "Yes", repeat the question
- If the user remains silent, move to the next question

### Part 2
1. Display the card containing the topic to speak
2. Display a note for the user to jot down some ideas
3. Once 1 minute is up, they are asked to speak
4. The user will speak for 2 minutes
5. AI bot will end this part if either condition satisfies:
- The user has spoken for 2 minutes.
- The user has spoken for at least 1 minute but stayed silent for 5 seconds.
6. 1-2 follow-up questions may be asked

### Part 3
Part 3 is the same in terms of the format in Part 1, but the user will have up to 1 minute to answer a question

### Feedback
1. Overall band score
2. Criteria band score
3. Descriptive feedback for each criterion
4. Point out mistakes
5. Suggest improvements
6. Compare previous and current performance
7. Save to history

## Technologies
- Front-end: React Native & Expo
- Speech-to-text: OpenAI Whisper
- LLM: OpenAI Chat API
- TTS: OpenAI TTS
- Database: JSON

## Speaking Flow
1. The user answers the asked question, which is recorded
2. The recording will be sent to the API, which is then transcribed
3. The transcript will be fed into the LLM to generate the next question
4. The LLM response will be synthesized into audio
5. The synthesized audio will be sent back to the client
6. Repeat step 1

## API

### POST `/:user_id/session/new`
- **Description**: Create a new speaking session and return the session's ID.
- **Request Body**: None.
- **Response**:
  ```json
  {
    "id": "string",
    "started_at": "datetime"
  }
  ```

### GET `/:user_id/sessions`
- **Description**: Retrieve user's history of speaking sessions.
- **Request Body**: None.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "started_at": "datetime",
      "ended_at": "datetime",
    }
  ]
  ```

### GET `/session/:user_id/:session_id`
- **Description**: Get information on a speaking session by user ID and session ID.
- **Request Body**: None.
- **Response**:
  ```json
  {
    "id": "string",
    "started_at": "datetime",
    "ended_at": "datetime",
    "conversation": [
      {
        "role": "assistant | user",
        "message": "string",
        "audio_path": "string"
      }
    ]
  }
  ```

### POST `/:user_id/:session_id/answer`
- **Description**: Receive the body containing the user's answer audio and return the path to the audio of the next question.
- **Request Body**:
  ```json
  {
    "audio": "base64_encoded_audio"
  }
  ```
- **Response**:
  ```json
  {
    "audio_path": "string"
  }
  ```

### GET `/:user_id/:session_id/feedback`
- **Description**: Return the feedback based on the speaking session's performance.
- **Response**:
  ```json
  {
    "overall_band_score": "number",
    "criteria_band_scores": {
      "fluency_and_coherence": "number",
      "pronunciation": "number",
      "grammatical_range_and_accuracy": "number",
      "lexical_resource": "number"
    },
    "descriptive_feedback": "string",
    "mistakes": ["string"],
    "suggested_improvements": ["string"]
  }
  ```

## Todo
- [x] Add speaking session screen
- [x] Integrate with API
- [ ] Generate feedback on a speaking session
- [ ] Interrupt the answer if it is too long
- [ ] Automatically move to the next question after a silence threshold
- [ ] Handle complete silence
- [ ] Prevent spam/abuse by temporarily/permanently banning accounts e.g. over-repeating a question, say completely irrelevant things or speak harmful content
- [ ] Stream response in real-time to minimize latency
- [ ] Switch to open-source models