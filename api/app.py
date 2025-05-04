import json
import logging
import os
from schema import NextQuestionSchema
from openai import OpenAI
from flask import Flask, request, jsonify, send_file
from datetime import datetime
import utils

app = Flask(__name__)
client = OpenAI()

@app.route('/u/<user_id>/session/new', methods=['POST'])
def create_session(user_id):
  session_id = utils.generate_id()
  started_at = datetime.now().isoformat()
  utils.create_session_dir(user_id, session_id)
  # Generate developer audio to start the IELTS speaking exam
  start_audio_id = utils.generate_id()
  session_dir = utils.get_session_dir(user_id, session_id)
  audio_path = os.path.join(session_dir, 'audio', f"{start_audio_id}.m4a")
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
        "audio": start_audio_id
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
  session_dir = utils.get_session_dir(user_id, session_id)
  audio_path = os.path.join(session_dir, "audio", f"{audio_id}.m4a")
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
  if not cue_card:
    return jsonify({"error": "Error generating cue card :("}), 500

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
  session_path = utils.get_session_dir(user_id, session_id)
  answer_audio_id = utils.generate_id()
  audio_path = os.path.join(session_path, 'audio', f"{answer_audio_id}.m4a")
  audio_file.save(audio_path)

  conversation = utils.load_conversation(user_id, session_id, session['current_part'])
  transcript = utils.transcribe_audio(client, audio_path)

  if not transcript:
    return jsonify({"error": "Failed to transcribe audio :("}), 500

  current_part = session['current_part']
  # Add the transcribed audio to the conversation
  conversation.append({"role": "user", "message": transcript, "audio": answer_audio_id})
  utils.save_conversation(user_id, session_id, current_part, conversation)

  # Generate a response
  audio_id = None

  response = utils.respond(client, conversation, current_part)
  if not response:
    return jsonify({"error": "Failed to ask question :("}), 500

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
    audio_id = utils.generate_id()
    audio_path = os.path.join(session_path, 'audio', f'{audio_id}.m4a')
    success = utils.synthesize_audio(client, response.next_question, audio_path)
    if not success:
      return jsonify({'error': 'Failed to ask question :('}), 500
    conversation.append({"role": "developer", "message": response.next_question, "audio": audio_id})
    utils.save_conversation(user_id, session_id, session['current_part'], conversation)

  utils.save_session(user_id, session_id, session)
  return jsonify({
    'audio_id': audio_id,
    'ended_at': session['ended_at'],
    'current_part': session['current_part'],
    'is_last': is_last,
  }), 200

@app.route('/u/<user_id>/s/<session_id>/feedback', methods=['GET'])
def get_feedback(user_id, session_id):
  session_dir = utils.get_session_dir(user_id, session_id)
  feedback_path = os.path.join(session_dir, 'feedback.json')
  if os.path.exists(feedback_path):
    try:
      with open(feedback_path, 'r') as f:
        feedback = json.load(f)
        return jsonify({'feedback': feedback}), 200
    except json.decoder.JSONDecodeError:
      print('Error reading feedback. Generating...')

  feedback = utils.generate_feedback(client, user_id, session_id)

  # save feedback to a file
  with open(feedback_path, "w") as f:
    json.dump(feedback.to_dict(), f)
  return jsonify({'feedback': feedback.to_dict()}), 200

if __name__ == '__main__':
  app.run(port=5000, debug=True)
  logging.basicConfig(
    filename='ieltsbot.log',
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S'
  )