import json
import os
import uuid
from schema import next_question_schema, cue_card_schema, feedback_schema

feedback_instructions = """
You are a certified IELTS Speaking examiner. Based on the transcribed conversation, please generate feedback for the candidate's performance in the IELTS Speaking test.
For fluency, coherence, lexical resource, grammatical range and accuracy, and pronunciation, please provide a score from 0 to 9 with a brief explanation for each criteria mentioning the candidate's strength, areas of improvement and specific example.
Example comments for each criterion:
1. Fluency and Coherence: The candidate speaks fluently and coherently, engaging with the questions smoothly without obvious effort, uses a good range of linking words and discourse markers (e.g., 'in addition,' 'however,' 'as well as') to connect their ideas. However, the candidate occasionally hesitates or repeats themselves, which slightly impacts fluency.
2. Lexical Resource: The candidate demonstrates a good range of vocabulary and uses it accurately, showing an awareness of style and collocation. For example, the candidate uses idioms and collocations effectively (e.g., 'hit the nail on the head,' 'take something with a pinch of salt') to add variety and interest to their responses. The candidate could expand their vocabulary to include more sophisticated and nuanced language.
3. Grammatical Range and Accuracy: The candidate shows a wide range of grammatical structures and uses them accurately, with minimal errors. The candidate uses complex sentence structures effectively (e.g., 'despite the fact that,' 'although,' 'while') to express more sophisticated ideas. The candidate could improve their grammatical accuracy by paying closer attention to sentence structure and verb tenses.
4. Pronunciation: The candidate's pronunciation is clear and understandable, with good use of stress and intonation, which helps to make their speech clear and engaging. The candidate could improve their pronunciation by focusing on specific sounds or areas of stress.

Example Suggestions:
- The candidate could benefit from practicing more speaking, particularly on a wider range of topics.
- The candidate should focus on improving their fluency by practicing linking words and discourse markers.
"""

instructions = {
  1: """You are a certified IELTS Speaking examiner conducting Part 1 of the IELTS Speaking test.

Instructions:

1. Ask the candidate questions one at a time, waiting for their answer before continuing.
2. Begin each new topic with: “Let’s talk about [topic].”
3. Ask 4–5 varied and logically ordered questions per topic, then transition to a new topic.
4. Prioritize natural conversation flow — start with simple, factual questions, then gradually move to preferences, opinions, or small reflections.
5. Do not repeat topics or questions.
6. Avoid asking two questions at once.
7. Cover 2 different topics, chosen from common IELTS Part 1 areas such as: Accommodation, Advertisements, Art & Photography, Animals, Bags & Boat, Birthdays, Books, Celebrity, Clothes, Fashion & Photos, Colours, Computer, Country, Daily Routine, Dictionaries, Dreams, Email, Exercise, Family & Housework, Flowers, Friends, Food, Gift & Noise, High School, Home, Hometown, Humour, Indoor Activities & Transportation, Internet, Lifestyle, Major, Mobile Phones, Movies, Museums, Music, Musical Instruments, Neighbours, Newspaper And Magazine, Outdoor Activities, Patience & Politeness, Public Transport, Seasons, Sports, The internet, The Sea, Timing, Travel, Trees, TV, Volunteer Works, Weather, Work, Writing
Guidance for Questioning:

- Use a natural progression within each topic. Start with questions like:
    - “Where is your hometown?”
    - “What do you do?”
    - “How often do you eat out?”

  Then follow up with:
    - “What do you like about...”
    - “Has that changed over time?”
    - “Why do you think that is?”

- Be flexible and creative in how you phrase questions — avoid sounding repetitive or robotic.

Follow-up Rules:

- If the candidate gives a **short answer**, ask a follow-up to encourage elaboration.
- If the answer sounds **memorized**, test fluency with a natural probing question.
  Signs of memorized answers:
    - Generic or overly formal language
    - No personal examples or variation
    - Fluent delivery without any hesitation

  Sample probing follow-ups:
    - “Can you give me an example?”
    - “How did that make you feel?”
    - “Have your views changed over time?”

Tone & Output:

- Keep your tone friendly, neutral, and professional.
- Only output the question — do not explain or comment.
- Use natural transitions between topics (e.g., “Let’s talk about [new topic].”)

Avoid rigid repetition of sample questions — generate your own questions naturally based on the topic and the candidate’s previous answers.
""",
2: """You are a certified IELTS Speaking examiner conducting Part 2 of the IELTS Speaking test.

After the candidate finishes their long turn, you will ask 1 or 2 simple follow-up questions.

Instructions:
1. Ask one question at a time, related directly to the candidate’s response.
2. The questions should:
   - Encourage the candidate to add more detail or reflection
   - Stay personal and easy to answer
   - NOT be too abstract or theoretical
   - Sound natural and appropriate for the Part 2 transition (not like Part 3)
3. Avoid asking two questions at once.
4. Use everyday language

Format:
Step 1: Say “Thank you.” (to end Part 2)
Step 2: Ask a short follow-up question.
Wait for the candidate's response.
Step 3: Ask a second follow-up question (if relevant).
Then smoothly transition to Part 3.
""",
3: """You are a certified IELTS Speaking examiner conducting Part 3 of the IELTS Speaking test.

Instructions:
1. When introducing a new topic, say: "Now, let's talk about <topic>."
2. Ask a general, opinion-based question related to the Part 2 topic.
3. Continue the discussion with 1–2 follow-up questions that go deeper or offer a different perspective.
4. Ask one question at a time.
5. Use natural examiner-like follow-up questions for further elaboration, such as:
   - "Why do you think that is?"
   - "Do you think this is changing nowadays?"
   - "How might this be different in other countries?"
6. Keep your questions open-ended and relevant to broader social or cultural aspects of the Part 2 topic.
7. Do not summarize the candidate’s answer or provide feedback.
8. Do not include any filler text or notes — only speak as an IELTS examiner would.
9. Transition to the sub-topic related to the previous topic and the candidate's response after 3–4 questions.
10. If the candidate asks to repeat or rephrase a question, you have to say "Yes, <repeat/rephrase the question>".
11. If the candidate asks to rephrase a question, you have to simplify it to make it easier to understand.

Example flow:
“Now, let's talk about <topic>.”
[Ask question]
[Wait for answer]
[Ask follow-up]
[Continue discussion as appropriate]
"""
}

def create_session_dir(user_id, session_id):
  session_dir = f"data/{user_id}/{session_id}"
  os.makedirs(session_dir, exist_ok=True)

def save_session(user_id, session_id, session_data):
  session_dir = f"data/{user_id}/{session_id}"
  session_file = f"{session_dir}/session.json"
  with open(session_file, "w") as f:
    json.dump(session_data, f)

def get_user_sessions(user_id):
  user_data_dir = f"data/{user_id}/"
  if not os.path.exists(user_data_dir):
    return []
  sessions = []
  for session_id in os.listdir(user_data_dir):
    session_file = os.path.join(user_data_dir, session_id, "session.json")
    if os.path.isfile(session_file):
      with open(session_file, 'r') as f:
        session_data = f.read()
        sessions.append(json.loads(session_data))

def load_conversation(user_id, session_id, current_part):
  session_dir = f"data/{user_id}/{session_id}"
  conversation_file = f"{session_dir}/part_{current_part}.json"
  if not os.path.exists(conversation_file):
    return []
  with open(conversation_file, "r") as f:
    return json.load(f)

def save_conversation(user_id, session_id, current_part, conversation):
  session_dir = f"data/{user_id}/{session_id}"
  os.makedirs(session_dir, exist_ok=True)
  conversation_file = f"{session_dir}/part_{current_part}.json"
  with open(conversation_file, "w") as f:
    json.dump(conversation, f)
  return conversation

def load_session(user_id, session_id):
  session_file = f"data/{user_id}/{session_id}/session.json"
  if not os.path.exists(session_file):
    return None
  with open(session_file, "r") as f:
    return json.load(f)

def save_audio(user_id, session_id, audio_data):
  user_dir = f"data/{user_id}/{session_id}"
  os.makedirs(user_dir, exist_ok=True)
  audio_id = str(uuid.uuid4())
  audio_path = f"{user_dir}/{audio_id}.wav"
  with open(audio_path, "wb") as f:
    f.write(audio_data)
  return audio_id

def generate_feedback(client, user_id, session_id):
  # get all part_1, part_2, and part_3 conversations
  part_1_conversation = load_conversation(user_id, session_id, 1)
  part_2_conversation = load_conversation(user_id, session_id, 2)
  part_3_conversation = load_conversation(user_id, session_id, 3)
  # concat them together
  conversation = part_1_conversation + part_2_conversation + part_3_conversation

  conversation.append({"role": "user", "message": f"Generate feedback for the IELTS Speaking test based on the conversation."})
  messages = []
  for entry in conversation:
    messages.append({"role": entry["role"], "content": entry["message"]})

  response = client.responses.create(
    model="gpt-4o",
    instructions=feedback_instructions,
    input=messages,
    text=feedback_schema
  )
  feedback = json.loads(response.output_text)
  # save feedback to a file
  feedback_file = f"data/{user_id}/{session_id}/feedback.json"
  os.makedirs(os.path.dirname(feedback_file), exist_ok=True)
  with open(feedback_file, "w") as f:
    json.dump(feedback, f)
  return feedback

def save_feedback(user_id, session_id, feedback):
  user_dir = f"data/{user_id}/{session_id}"
  os.makedirs(user_dir, exist_ok=True)
  feedback_file = f"{user_dir}/feedback.json"
  with open(feedback_file, "w") as f:
    json.dump(feedback, f)

def transcribe_audio(client, audio_path):
  audio_data = open(audio_path, "rb")
  transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_data,
  )
  return transcription.text

def respond(client, user_id, session_id, conversation, current_part):
  messages = []
  for entry in conversation:
    messages.append({"role": entry["role"], "content": entry["message"]})

  prompt = f"Follow the given instructions on part {current_part} of the IELTS Speaking test."
  if current_part == 3:
    # read the conversation in part 2 to get the cue card
    last_part_conv = load_conversation(user_id, session_id, 2)
    cue_card = last_part_conv[0]["message"]
    prompt += f"Here is the cue card from Part 2:\n{cue_card}\n"

  response = client.responses.create(
    model="gpt-4o",
    instructions=instructions[current_part],
    input=messages if len(messages) > 0 else prompt,
    text=next_question_schema
  )
  return json.loads(response.output_text)['next_question']

def generate_cue_card(client):
  response = client.responses.create(
    model="gpt-4o",
    input='Generate a cue card for IELTS Speaking Part 2',
    text=cue_card_schema
  )
  cue_card = json.loads(response.output_text)
  return cue_card

def format_cue_card(cue_card):
  # format the cue card for display
  return f"""{cue_card['question']}
You should say:
\u2022 {'\n\u2022 '.join(cue_card['bullet_points'])}"""

def synthesize_audio(client, text, output_path):
  with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="shimmer",
    input=text,
    instructions="Speak clearly like an IELTS examiner.",
  ) as response:
    response.stream_to_file(output_path)

def next_part(session):
  if not session:
    return None

  if session['current_part'] >= 3:
    return None

  session["current_part"] += 1
  return session