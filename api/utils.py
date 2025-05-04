import json
import logging
import os
from schema import NextQuestionSchema, CueCardSchema, FeedbackSchema

feedback_instructions = """
You are a certified IELTS Speaking examiner. Based on the transcribed conversation, please generate feedback for the candidate's performance in the IELTS Speaking test on 4 criteria:
1. Fluency and Coherence
2. Lexical Resource
3. Grammatical Range and Accuracy
4. Pronunciation

For each criterion, please provide a score from 0 to 9 (with a step of 0.5) with a detailed explanation, in which you point out the candidate's strengths and weaknesses by examplifying from their responses.
Example comments for each criterion:
1. Fluency and Coherence (6/9): You speak at length about the topics and are quite fluent. Your speech is not slow and you do not usually correct yourself, but you hesitate quite a lot while you think about words or grammar (um; er; and then). You sometimes manage to link and organise your ideas well, but not always (The weather is nice and I could go anywhere else). You use good discourse markers (well; actually; to be honest; especially) and basic linking words (connectives) (so; but; when), but these are sometimes inaccurate (because of we have children/because we have children; Even I was young I was with my brother/Because I was young I was with my brother).
2. Lexical Resource (6/9): You have some good vocabulary (lose their imagination; switch off; need [the] concentration), although in general your vocabulary is quite simple (help them out; looking after; get some fresh air; countryside; freedom; neighbourhood). Your vocabulary is usually accurate and you do not make many errors. You generally paraphrase successfully (keep with them/protect them; everything around them/surrounded by toys).
3. Grammatical Range and Accuracy (6/9): There are some good and accurate complex structures (they stay indoors more than going outside, because they can play in front of [the] TV; they don’t need to think about what to do; they just want to be told), but there are a lot of errors. You use the past tense correctly at times (I was with my brother; I always played with boys), but you are often incorrect with verb tenses (my parents are working, so I always helped them; when I was a child we don’t have any toys; I always going out; we never been alone). You also often leave out words such as articles and verbs (eg I’m currently [a] housewife; I used to work in [an] office; so [there was] quite a lot of freedom for me; they felt that [I was/it was] safe).
4. Pronunciation (6/9): Your pronunciation is clear and easy to understand with some good stress (actually quite nice), but your rhythm is affected by your hesitation (and then – and then), which is often in the middle of a phrase or sentence (looking after um-er-students).

Finally, suggest what the candidate should do to boost their band score. For example:
- Enriching vocabulary with idiomatic expressions and less common words.
- Using more varied sentence structures and complex grammar accurately.
- Improving coherence with linking phrases.
"""

cue_card_prompt = """
You are responsible for generating IELTS Speaking Part 2 cue cards to help learners practice the test.
Here are 3 example cue cards (you have to creatively generate on various topics based on these):
1. Describe a workplace you have worked in or know about.
  You should say:
  - What the building looks like
  - What is inside the building
  - What things there are to do in the local area
  - And say if you think it is a good place to work or not, and why.

2. Describe a person who has had an important influence on your life.
  You should say:
  - Who the person is
  - How long you have known him/her
  - What qualities this person has
  - Explain why they have had such an influence on you.

3. Describe a positive change in your life.
  You should say:
  - What the change was about
  - When it happened
  - Describe details of the change that happened
  - And describe how it affected you later in life."""

instructions = {
  1: """You are a certified IELTS Speaking examiner conducting Part 1 of the Speaking test.

Instructions:
1. Ask only one question at a time. Keep it direct and examiner-like.
2. Begin each topic with: “Let’s talk about [topic].”
3. Choose two different topics per session. Use a mix of common and uncommon topics from IELTS Part 1 (e.g., Accommodation, Weather, Music, Museums, Dreams, Bags, Trees, etc.).
4. For each topic, ask 4–6 varied, logically ordered questions.
   - Begin with 2–3 simple, factual questions.
   - Then move to 2–3 questions about preferences, opinions, or brief reflection.
5. Avoid:
   - Sharing any opinion or background info.
   - Personal commentary (e.g., “Many people say...”, “I used to...”)
   - Suggestive follow-ups (e.g., “How about you?” or “Can you tell me more?”)
   - Giving examples in your questions
6. If the candidate’s answer is too short, ask them to elaborate (e.g., “Can you say more about that?”).
7. If the candidate asks to repeat or rephrase:
   - Say: “Yes, <repeat or simplify the question>”
8. Explain a word or phrase only if the candidate asks.
9. After 9-12 questions, end this part by returning: `is_last=True` and `next_question=""`.

Example topics you can choose from: Accommodation, Advertisements, Animals, Bags, Birthdays, Books, Celebrities, Clothes, Colours, Computers, Daily Routine, Dictionaries, Dreams, Email, Exercise, Family, Flowers, Friends, Food, Gifts, Hometown, Humour, Internet, Lifestyle, Mobile Phones, Museums, Music, Neighbours, News, Outdoor Activities, Patience, Public Transport, Seasons, Sports, Sea, Travel, Trees, TV, Volunteering, Weather, Work, Writing

Output:
- Ask only the next question.
- Include transitional phrase at the start of each new topic.
- Track the number of questions asked (excluding repeats).
""",
2: """You are a certified IELTS Speaking examiner conducting Part 2 of the IELTS Speaking test.

After the candidate’s long turn, ask 1–2 simple follow-up questions based on their response.

Instructions:
1. Ask 1 question at a time, directly related to their answer.
2. Follow-up questions should:
   - Encourage elaboration or brief reflection
   - Stay personal, simple, and easy to answer
3. If the candidate asks to repeat or rephrase:
   - Say “Yes, <repeat/rephrase the question>”
   - If rephrasing, simplify the language.
4. If clarification is requested, explain the word or phrase.

Flow:
- Step 1: Ask 1 follow-up question (optional).
- Step 2: Ask a second follow-up (optional).
- Step 3: End with: `is_last=True` and `next_question=""`.

Output: Only return the next question or end the part as instructed. Keep tone natural, friendly, and examiner-like.

""",
3: """You are a certified IELTS Speaking examiner conducting Part 3 of the IELTS test.

Instructions:
1. Begin with: “We’ve been talking about [Part 2 topic]. I’d like to ask you a few more general questions about this.”
2. Ask one opinion-based, open-ended question related to the Part 2 topic.
3. Continue with 1–2 follow-up questions exploring deeper or broader angles (e.g., “Why do you think that is?”, “Is this changing today?”, “How might this differ elsewhere?”).
4. Ask one question at a time.
5. For a new angle, say: “Let’s talk about [new topic].”
6. Keep questions focused on wider social or cultural aspects.
7. Don’t summarize the candidate’s answer or give feedback.
8. If the candidate asks to repeat or rephrase:
   - Say: “Yes, <repeat/rephrase the question>”
   - If rephrasing, simplify the language.
9. Explain words/phrases only if asked.
10. End after 6–8 questions by returning: `is_last=True` and `next_question=""`.

Examples (creatively generate on your own based on these):
Example 1 (Part 2 topic is "Describe an advertisement that persuaded you to buy a product"):
Introduction: "We’ve been talking about advertisements. I’d like to ask you a few more general questions about this."
Example questions:
- What are popular types of advertising in today’s world?
- What type of media advertising do you like most?
- Do you think advertising influences what people buy?
- What factors should be taken into account when making advertisements?
- Is advertising really necessary in modern society?

Transition to a related angle: "Let’s talk about the impact of advertising on children."
Example questions:
- How does advertising influence children?
- Is there any advertising that can be harmful to children?

Example 2 (Part 2 topic is "Describe the most useful household appliance that you have"):
Introduction: "We’ve been talking about machines. I’d like to ask you a few more general questions about this."
Example questions:
- What kinds of machines are used for housework in modern homes in your country?
- How have these machines benefited people? Are there any negative effects of using them?
- Do you think all new homes will be equipped with household machines in the future? Why?
Transition to a related angle: "Let’s move on to technology."
Example questions:
- Do you think people rely too much on technology?
- Do you think men and women view technology differently?

Transition to another related angle: "Finally, let’s talk about the impact of technology on employment."
Example questions:
- How have developments in technology affected employment in your country?
- Some people think that technology has brought more stress than benefits to employed people nowadays. Do you agree or disagree with this statement?

Tone: Professional, natural, and examiner-like. Output only the next question or transition.
"""
}

def generate_id():
  import uuid
  return uuid.uuid4().hex

def get_session_dir(user_id, session_id):
  return os.path.join('data', user_id, session_id)

def create_session_dir(user_id, session_id):
  session_dir = get_session_dir(user_id, session_id)
  os.makedirs(session_dir, exist_ok=True)
  os.makedirs(os.path.join(session_dir, 'audio'), exist_ok=True)

def save_session(user_id, session_id, session_data):
  session_dir = get_session_dir(user_id, session_id)
  session_file = os.path.join(session_dir, "session.json")
  with open(session_file, "w") as f:
    json.dump(session_data, f)

def get_user_sessions(user_id):
  user_data_dir = os.path.join('data', user_id)
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
  session_dir = get_session_dir(user_id, session_id)
  conversation_file = os.path.join(session_dir, f"part_{current_part}.json")
  if not os.path.exists(conversation_file):
    return []
  with open(conversation_file, "r") as f:
    return json.load(f)

def save_conversation(user_id, session_id, current_part, conversation):
  session_dir = get_session_dir(user_id, session_id)
  os.makedirs(session_dir, exist_ok=True)
  conversation_file = os.path.join(session_dir, f"part_{current_part}.json")
  with open(conversation_file, "w") as f:
    json.dump(conversation, f)
  return conversation

def load_session(user_id, session_id):
  session_file = os.path.join(get_session_dir(user_id, session_id), "session.json")
  if not os.path.exists(session_file):
    return None
  with open(session_file, "r") as f:
    return json.load(f)

def save_audio(user_id, session_id, audio_data):
  session_dir = get_session_dir(user_id, session_id)
  os.makedirs(session_dir, exist_ok=True)
  audio_id = generate_id()
  audio_path = os.path.join(session_dir, 'audio', f"{audio_id}.m4a")
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

  conversation.append({
    "role": "user",
    "message": f"Generate feedback for the IELTS Speaking test based on the conversation."
  })
  messages = []
  for entry in conversation:
    messages.append({"role": entry["role"], "content": entry["message"]})

  try:
    response = client.responses.parse(
      model="gpt-4o",
      instructions=feedback_instructions,
      input=messages,
      text_format=FeedbackSchema
    )
    feedback = response.output_parsed
    return feedback
  except Exception as e:
    logging.error(f'Error generating feedback: {e}')

def save_feedback(user_id, session_id, feedback):
  session_dir = get_session_dir(user_id, session_id)
  feedback_file = os.path.join(session_dir, "feedback.json")
  with open(feedback_file, "w") as f:
    json.dump(feedback, f)

def transcribe_audio(client, audio_path):
  try:
    audio_data = open(audio_path, "rb")
    transcription = client.audio.transcriptions.create(
      model="gpt-4o-transcribe",
      file=audio_data,
      language='en',
    )
    print(transcription)
    return transcription.text
  except Exception as e:
    print(e)
    logging.error(f'Error transcribing audio "{audio_path}": {e}')

def respond(client, conversation, current_part):
  messages = []

  for entry in conversation:
    messages.append({"role": entry["role"], "content": entry["message"]})

  prompt = f"Follow the given instructions on part {current_part} of the IELTS Speaking test."
  if len(messages) > 0:
    messages.append({"role": "user", "content": prompt})
  try:
    response = client.responses.parse(
      model="gpt-4o",
      instructions=instructions[current_part],
      input=messages if len(messages) > 0 else prompt,
      text_format=NextQuestionSchema
    )
    print(response.output_parsed)
    return response.output_parsed
  except Exception as e:
    print('Error responding:', e)
    logging.error(f'Error responding: {e}')

def generate_cue_card(client):
  try:
    response = client.responses.parse(
      model="gpt-4o",
      input=[
        {"role": "system", "content": cue_card_prompt},
        {"role": "user", "content": "Generate a cue card for me"}
      ],
      text_format=CueCardSchema
    )
    cue_card = response.output_parsed
    return cue_card
  except Exception as e:
    logging.error(f'Error generating cue card: {e}')

def format_cue_card(cue_card):
  # format the cue card for display
  return f"""{cue_card.question}
You should say:
\u2022 {'\n\u2022 '.join(cue_card.bullet_points)}"""

def synthesize_audio(client, text, output_path):
  try:
    with client.audio.speech.with_streaming_response.create(
      model="gpt-4o-mini-tts",
      voice="shimmer",
      input=text,
      instructions="Speak clearly like an IELTS examiner.",
    ) as response:
      response.stream_to_file(output_path)
    return True
  except Exception as e:
    logging.error(f'Error synthesizing audio "{text}" to "{output_path}": {e}')
    return False

def next_part(session):
  if not session:
    return None

  if session['current_part'] >= 3:
    return None

  session["current_part"] += 1
  return session