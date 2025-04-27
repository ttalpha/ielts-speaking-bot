from schema import NextQuestionSchema
from openai import OpenAI
from flask import Flask, request, jsonify, send_file
from datetime import datetime
import utils
import uuid

app = Flask(__name__)
client = OpenAI()

# Helper functions

@app.route('/u/<user_id>/session/new', methods=['POST'])
def create_session(user_id):
  session_id = str(uuid.uuid4())
  started_at = datetime.now().isoformat()
  utils.create_session_dir(user_id, session_id)
  # Generate developer audio to start the IELTS speaking exam
  start_audio_id = str(uuid.uuid4())
  audio_path = f"data/{user_id}/{session_id}/{start_audio_id}.m4a"
  response = utils.respond(client, [], current_part=1)
  utils.synthesize_audio(client, response.next_question, audio_path)

  session_data = {
    "id": session_id,
    "started_at": started_at,
    "start_audio_id": start_audio_id,
    "current_part": 1,
    "cue_card": None,
    "ended_at": None
  }

  utils.save_session(user_id, session_id, session_data)
  utils.save_conversation(
    user_id,
    session_id,
    session_data['current_part'],
    [
      {
        "role": "developer",
        "message": response.next_question,
        "audio": audio_path
      }
    ]
  )

  return jsonify({'id': session_id}), 201

@app.route('/u/<user_id>/s/<session_id>', methods=['GET'])
def get_session(user_id, session_id):
  session = utils.load_session(user_id, session_id)
  if not session:
    return jsonify({"error": "Session not found"}), 404

  return jsonify(session), 200

@app.route('/u/<user_id>/s/<session_id>/audio/<audio_id>', methods=['GET'])
def get_audio(user_id, session_id, audio_id):
  audio_path = f"data/{user_id}/{session_id}/{audio_id}.m4a"
  try:
    return send_file(audio_path, as_attachment=True)
  except FileNotFoundError:
    return jsonify({"error": "Audio file not found"}), 404

@app.route('/u/<user_id>/sessions', methods=['GET'])
def get_user_history(user_id):
  sessions = utils.get_user_sessions(user_id)
  return jsonify(sessions), 200

@app.route('/u/<user_id>/s/<session_id>/cue_card', methods=['POST'])
def cue_card(user_id, session_id):
  session = utils.load_session(user_id, session_id)
  if session['current_part'] != 2:
    return jsonify({"error": "Cue card can only be generated in part 2"}), 400

  if session['cue_card']:
    return jsonify({"error": "Cue card already generated"}), 400

  if not session:
    return jsonify({"error": "Session not found"}), 404

  cue_card = utils.generate_cue_card(client)
  session['cue_card'] = cue_card.__dict__

  # Save the cue card and audio
  conversation = utils.load_conversation(user_id, session_id, session['current_part'])
  conversation.append({"role": "developer", "message": utils.format_cue_card(cue_card), "audio": None})
  utils.save_session(user_id, session_id, session)
  utils.save_conversation(user_id, session_id, session['current_part'], conversation)

  return jsonify({
    "cue_card": session['cue_card']
  }), 200

@app.route('/u/<user_id>/s/<session_id>/answer', methods=['POST'])
def answer_question(user_id, session_id):
  session = utils.load_session(user_id, session_id)
  if not session:
    return jsonify({"error": "Session not found"}), 404

  if 'audio' not in request.files:
    return jsonify({"error": "Audio file is required"}), 400

  audio_file = request.files['audio']
  session_path = f'data/{user_id}/{session_id}'
  audio_path = f"{session_path}/{uuid.uuid4()}.m4a"
  audio_file.save(audio_path)

  conversation = utils.load_conversation(user_id, session_id, session['current_part'])
  transcription = utils.transcribe_audio(client, audio_path, conversation[-1]['message'])

  if not transcription:
    return jsonify({"error": "Failed to transcribe audio"}), 500

  current_part = session['current_part']
  # Add the transcribed audio to the conversation
  conversation.append({"role": "user", "message": transcription, "audio": audio_path})
  utils.save_conversation(user_id, session_id, current_part, conversation)

  # Generate a response
  audio_id = None
  response = utils.respond(client, conversation, current_part)
  is_last = response.is_last
  # Save the updated conversation
  if response.is_last:
    response = None
    if session['current_part'] == 3:
      session['ended_at'] = datetime.now().isoformat()
    else:
      session = utils.next_part(session)
      if session['current_part'] == 3:
        response = utils.respond(
          client,
          [
            {
              "role": "user",
              "message": f'Part 2 Speaking topic is: "{session['cue_card']['question']}". Continue to part 3'
            }
          ],
          session['current_part']
        )
    conversation.clear()
  # Synthesize the response audio
  if isinstance(response, NextQuestionSchema):
    audio_id = uuid.uuid4()
    audio_path = f"{session_path}/{audio_id}.m4a"
    utils.synthesize_audio(client, response.next_question, audio_path)
    conversation.append({"role": "developer", "message": response.next_question, "audio": audio_path})
    utils.save_conversation(user_id, session_id, session['current_part'], conversation)

  utils.save_session(user_id, session_id, session)
  return jsonify({
    'audio_id': audio_id,
    'ended_at': session['ended_at'],
    'current_part': session['current_part'],
    'is_last': is_last,
  }), 200

if __name__ == '__main__':
  app.run(port=5000, debug=True)