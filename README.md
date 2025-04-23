# IELTS Speaking Assistant

An AI-powered assistant that can give feedback on IELTS Speaking performance.

## User Journey
### Part 1

1. Questions for each part will be generated in advance.
2. AI bot will ask the questions sequentially.
3. The user will have 20 seconds to answer.
4. The user can ask to repeat the question one more time if they haven't answered.
5. AI bot will automatically move to the next question if either condition satisfies:
- The user is silent for 3 seconds
- The user has answered for 20 seconds

### Part 2
1. Display the card containing the topic to speak
2. Display a note for the user to jot down some ideas
3. Once 1 minute is up, they are asked to speak
4. The user will speak for 2 minutes
5. AI bot will end this part if either condition satisfies:
- The user has spoken for 2 minutes.
- The user has spoken for at least 1 minute but stayed silent for 10 seconds.

### Part 3
1. Follow the first 2 steps in part 1
2. The user will have up to 1 minute to answer
3. Follow step 4 in part 1
4. AI bot will automatically move to the next question if either condition satisfies:
- The user is silent for 3 seconds
- The user has answered for 1 minute

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
- **Request Body**: None.
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