import json
import os
import uuid
from schema import NextQuestionSchema, CueCardSchema, FeedbackSchema

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

cue_card_prompt = """
You are responsible for generating IELTS Speaking Part 2 cue cards to help learners practice the test.
Here are 5 example cue cards (you have to creatively generate on various topics based on these):
1. Describe a job someone in your family does.
   You should say:
   - How long that person has been doing that job
   - What the good things about that job are
   - What the difficulties of doing that job are
   - And say if you think that person enjoys their job or not, and why.

2. Describe a workplace you have worked in or know about.
   You should say:
   - What the building looks like
   - What is inside the building
   - What things there are to do in the local area
   - And say if you think it is a good place to work or not, and why.

3. Describe a person who has had an important influence on your life.
   You should say:
   - Who the person is
   - How long you have known him/her
   - What qualities this person has
   - Explain why they have had such an influence on you.

4. Describe a time when someone apologized to you.
   You should say:
   - When this happened
   - What you were doing
   - Who apologized to you
   - And explain why they apologized to you.

5. Describe a positive change in your life.
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
3. Ask 4–6 varied, logically ordered questions per topic.
   - Begin with 2–3 simple, factual questions.
   - Then move to 2–3 questions about preferences, opinions, or brief reflection.
4. Avoid:
   - Sharing any opinion or background info.
   - Personal commentary (e.g., “Many people say...”, “I used to...”)
   - Suggestive follow-ups (e.g., “How about you?” or “Can you tell me more?”)
   - Giving examples in your questions
5. If the candidate’s answer is too short, ask them to elaborate (e.g., “Can you say more about that?”).
6. If the candidate asks to repeat or rephrase:
   - Say: “Yes, <repeat or simplify the question>”
7. Explain a word or phrase only if the candidate asks.
8. Choose two different topics per session. Use a mix of common and uncommon topics from IELTS Part 1 (e.g., Accommodation, Weather, Music, Museums, Dreams, Bags, Trees, etc.).
9. After 9–12 total questions, finish by returning: `is_last=True` and `next_question=""`.

Example topics you can choose from: Accommodation, Advertisements, Animals, Bags, Birthdays, Books, Celebrities, Clothes, Colours, Computers, Daily Routine, Dictionaries, Dreams, Email, Exercise, Family, Flowers, Friends, Food, Gifts, Hometown, Humour, Internet, Lifestyle, Mobile Phones, Museums, Music, Neighbours, News, Outdoor Activities, Patience, Public Transport, Seasons, Sports, Sea, Travel, Trees, TV, Volunteering, Weather, Work, Writing
Here are some example questions (be creative based on these):
1. Public Transport:
- What kinds of public transport do you have in your country?
- What kinds of public transport do most people use?
- What is your favourite type of public transport?
- What do you do when you are travelling on public transport?
- How could public transport in your country be improved?

2. Dreams:
- Do you dream much at night?
- Do you often remember your dreams?
- Do you think we can learn anything from dreams?
- Do people in your country talk about their dreams?
- Do you think that dreams can come true?

3. Birthdays:
- What did you usually do on your birthday as a child?
- How do you normally celebrate your birthday?
- Is your birthday still as important as it was before?
- Do you think it’s important to give a birthday card?
- Does the price of a gift matter?

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

def get_session_dir(user_id, session_id):
  return os.path.join('data', user_id, session_id)

def create_session_dir(user_id, session_id):
  session_dir = get_session_dir(user_id, session_id)
  os.makedirs(session_dir, exist_ok=True)

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
  user_dir = get_session_dir(user_id, session_id)
  os.makedirs(user_dir, exist_ok=True)
  audio_id = str(uuid.uuid4())
  audio_path = f"{user_dir}/{audio_id}.m4a"
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

  response = client.responses.parse(
    model="gpt-4o",
    instructions=feedback_instructions,
    input=messages,
    text_format=FeedbackSchema
  )
  feedback = response.output_parsed
  # save feedback to a file
  feedback_file = os.path.join(get_session_dir(user_id, session_id), "feedback.json")
  os.makedirs(os.path.dirname(feedback_file), exist_ok=True)
  with open(feedback_file, "w") as f:
    json.dump(feedback, f)
  return feedback

def save_feedback(user_id, session_id, feedback):
  session_dir = get_session_dir(user_id, session_id)
  feedback_file = os.path.join(session_dir, "feedback.json")
  with open(feedback_file, "w") as f:
    json.dump(feedback, f)

def transcribe_audio(client, audio_path, question):
  audio_data = open(audio_path, "rb")
  transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_data,
    prompt=f"Here's an answer to the question: \"{question}\""
  )
  return transcription.text

def respond(client, conversation, current_part):
  messages = []

  for entry in conversation:
    messages.append({"role": entry["role"], "content": entry["message"]})

  prompt = f"Follow the given instructions on part {current_part} of the IELTS Speaking test."
  if len(messages) > 0:
    messages.append({"role": "user", "content": prompt})

  response = client.responses.parse(
    model="gpt-4o",
    instructions=instructions[current_part],
    input=messages if len(messages) > 0 else prompt,
    text_format=NextQuestionSchema
  )
  print(response.output_parsed)
  return response.output_parsed

def generate_cue_card(client):
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

def format_cue_card(cue_card):
  # format the cue card for display
  return f"""{cue_card.question}
You should say:
\u2022 {'\n\u2022 '.join(cue_card.bullet_points)}"""

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