from openai import OpenAI
from flask import Flask, request, jsonify
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
  audio_path = f"data/{user_id}/{session_id}/{start_audio_id}.wav"
  response = utils.respond(client, [])
  utils.synthesize_audio(client, response, audio_path)

  session_data = {
    "id": session_id,
    "started_at": started_at,
    "start_audio_id": start_audio_id,
    "current_part": 1,
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
        "message": response,
        "audio": audio_path
      }
    ]
  )

  return jsonify(session_data), 201

@app.route('/u/<user_id>/s/<session_id>/next', methods=['PATCH'])
def next_part(user_id, session_id):
  prev_session = utils.load_session(user_id, session_id)
  if not prev_session:
    return jsonify({"error": "Session not found"}), 404

  if prev_session['current_part'] == 3:
    return jsonify({"error": "Session already completed"}), 400

  cur_session = utils.next_part(prev_session)
  # Save updated session data
  utils.save_session(user_id, session_id, cur_session)

  if cur_session['current_part'] == 2:
    # Generate cue card for Part 2
    cue_card = utils.generate_cue_card(client)
    utils.save_conversation(
      user_id,
      session_id,
      cur_session['current_part'],
      [
        {
          "role": "developer",
          "message": utils.format_cue_card(cue_card),
          "audio": None
        }
      ]
    )
    return jsonify({'session': cur_session, 'cue_card': cue_card}), 200

  # Generate developer audio for the next part of the IELTS speaking exam
  audio_id = uuid.uuid4()
  audio_path = f"data/{user_id}/{session_id}/{audio_id}.wav"
  response = utils.respond(client, user_id, session_id, [], cur_session['current_part'])
  utils.synthesize_audio(client, response, audio_path)
  utils.save_conversation(
    user_id,
    session_id,
    cur_session['current_part'],
    [
      {
        "role": "developer",
        "message": response,
        "audio": audio_path
      }
    ]
  )
  return jsonify({'session': cur_session, 'audio_id': audio_id}), 200

@app.route('/u/<user_id>/s/<session_id>/end', methods=['PATCH'])
def end_session(user_id, session_id):
  session = utils.load_session(user_id, session_id)
  if not session:
    return jsonify({"error": "Session not found"}), 404

  if session['current_part'] != 3:
    return jsonify({"error": "Session cannot be ended before all parts are completed"}), 400

  session["ended_at"] = datetime.now().isoformat()

  feedback = utils.generate_feedback(client, user_id, session_id)
  return jsonify({'feedback': feedback}), 200


@app.route('/u/<user_id>/sessions', methods=['GET'])
def get_user_history(user_id):
  sessions = utils.get_user_sessions(user_id)
  return jsonify(sessions), 200

@app.route('/u/<user_id>/s/<session_id>/answer', methods=['POST'])
def answer_question(user_id, session_id):
  session = utils.load_session(user_id, session_id)
  if not session:
    return jsonify({"error": "Session not found"}), 404

  if 'audio' not in request.files:
    return jsonify({"error": "Audio file is required"}), 400

  audio_file = request.files['audio']
  session_path = f'data/{user_id}/{session_id}'
  audio_path = f"{session_path}/{uuid.uuid4()}.wav"
  audio_file.save(audio_path)

  transcription = utils.transcribe_audio(client, audio_path)

  if not transcription:
    return jsonify({"error": "Failed to transcribe audio"}), 500

  # Add the transcribed audio to the conversation
  conversation = utils.load_conversation(user_id, session_id, session['current_part'])
  conversation.append({"role": "user", "message": transcription, "audio": audio_path})

  # Generate a response
  response = utils.respond(client, user_id, session_id, conversation, session['current_part'])

  # Synthesize the response audio
  audio_id = uuid.uuid4()
  audio_path = f"{session_path}/{audio_id}.wav"
  utils.synthesize_audio(client, response, audio_path)
  conversation.append({"role": "developer", "message": response, "audio": audio_path})
  # Save the updated conversation
  utils.save_conversation(user_id, session_id, session['current_part'], conversation)

  return jsonify({"audio_id": audio_id}), 200

if __name__ == '__main__':
  app.run(port=5000, debug=True)