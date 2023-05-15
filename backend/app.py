# Imports
import redis
import datetime
import time
import logging
from functools import wraps

from flask import Flask, request, jsonify, redirect, session
from flask_restful import reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS, cross_origin

from creds import secret_key
from config import DEV_DB, PROD_DB, redis_url, frontend_url
from utils.maps import input_map
from utils.spotify import get_spotify_song_audio_features, get_spotify_app_token, refresh_user_token, get_user_info, get_user_token, create_mashup_playlist, add_songs_to_mashup
from utils.helpers import pitchmap_key, get_key_range, get_bpm_range

# ––––– App Initialization / Setup –––––
FRONTEND_REDIRECT_URL = frontend_url + '/#/home'

access_token = None
headers = None
expires_at = None

app = Flask(__name__)
# change this to PROD_DB when testing / deploying
app.config['SQLALCHEMY_DATABASE_URI'] = DEV_DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.from_url(redis_url)
app.config['CORS_HEADERS'] = 'Content-Type'

app.secret_key = secret_key
logging.basicConfig(level=logging.DEBUG)
CORS(app, origins=[frontend_url], supports_credentials=True)
db = SQLAlchemy(app)
sess = Session(app)

from models import *

# ––––– Functions –––––
def get_access_token():
  global access_token, headers, expires_at
  
  if expires_at is not None and expires_at > time.time():
    return

  auth_response = get_spotify_app_token()
  auth_response_data = auth_response.json()

  access_token = auth_response_data['access_token']
  expires_in = auth_response_data['expires_in']

  expires_at = time.time() + expires_in
  headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token}'.format(token=access_token)
  }

def requires_access_token(f):
  @wraps(f)
  def token_wrapper(*args, **kwargs):
    get_access_token()
    return f(*args, **kwargs)
  return token_wrapper

def get_match_uris(instr_data, req_data):
  sel_genre = input_map[req_data['genre']]
  sel_decade = int(req_data['decade'])
  sel_key = req_data['key']
  sel_bpm = req_data['bpm']
  sel_limit = req_data['limit']
  lo_bpm, hi_bpm = get_bpm_range(int(instr_data['tempo']), sel_bpm)
  key = pitchmap_key(instr_data['key'], instr_data['mode'])
  keys = {key: value for key, value in get_key_range(key, sel_key)}

  try:
    acapellas = Acapella.query \
      .join(Acapella.genres) \
      .filter(Genre.name == sel_genre) \
      .filter(Acapella.decade == sel_decade) \
      .filter(Acapella.bpm >= lo_bpm) \
      .filter(Acapella.bpm <= hi_bpm) \
      .filter(Acapella.adj_key.in_(keys)) \
      .order_by(Acapella.popularity.desc()) \
      .limit(sel_limit) \
      .all()
  except:
    acapellas = []

  return acapellas, keys

# ––––– OAuth –––––
@app.route('/callback')
@requires_access_token
def callback():
  code = request.args.get('code')
  response = get_user_token(code)
  
  user_access_token = response.json()['access_token']
  user_refresh_token = response.json()['refresh_token']
  expires_in = response.json()['expires_in']
  
  response = get_user_info(user_access_token)
  user_info = response.json()
  
  session['user_info'] = user_info
  session['user_access_token'] = user_access_token
  session['token_expires'] = datetime.datetime.now() + datetime.timedelta(seconds=expires_in)
  session['user_refresh_token'] = user_refresh_token

  return redirect(FRONTEND_REDIRECT_URL)

def refresh_user_token(refresh_token):
  if session['token_expires'] > datetime.datetime.now() + datetime.timedelta(seconds=60):
    return jsonify({"message": "Token is still valid"}), 200

  response = refresh_user_token(refresh_token)

  if response.status_code == 200:
    response_data = response.json()
    session['user_access_token'] = response_data['access_token']
    return jsonify({"message": "Token refreshed successfully"}), 200
  else:
    return jsonify({"message": "Token refresh failed"}), 400

def login_required(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if request.method == 'OPTIONS':
      return jsonify({"message": "Preflight request"}), 200
    if 'user_info' not in session:
      return jsonify({"message": "User is not logged in"}), 401
    return f(*args, **kwargs)
  return decorated_function

@app.route('/api/authenticate')
@login_required
def authenticated():
  return jsonify({'authenticated': True}), 200

# ––––– General Endpoints –––––
# Intro Endpoint
@app.route('/', methods=['GET'])
@login_required
def main():
  return jsonify({"message": "Welcome to the Myx API!"}), 200

# ––––– Acapella Endpoints –––––
# Acapellas Endpoint
@app.route('/get-acapellas', methods=['GET'])
@login_required
@requires_access_token
def get_acapellas():
  arg_keys = ["uri", "bpm", "genre", "decade", "key", "limit"]
  args = {key: request.args.get(key) for key in arg_keys}

  if not all(args.values()):
    return jsonify({"message": "All parameters are required: uri, bpm, genre, decade, key, limit"}), 400

  try:
    instr_data = get_spotify_song_audio_features(args["uri"], headers)
  except:
    return jsonify({"message": "Invalid URI or search failed."}), 400

  data = {
    "uri": args["uri"],
    "bpm": args["bpm"],
    "genre": args["genre"],
    "decade": args["decade"],
    "key": args["key"],
    "limit": args["limit"]
  }

  acapellas, key_dict = get_match_uris(instr_data, data)

  res = []
  for acapella in acapellas:
    res.append(tuple([acapella.uri, key_dict[acapella.adj_key], acapella.bpm - instr_data['tempo']]))
  
  if not res:
    return jsonify({"message": "No matches found."}), 404

  response = jsonify(res)
  return response, 200


# ––––– Mashup Endpoints –––––
# get all mashups
@app.route('/mashups', methods=['GET'])
@login_required
@requires_access_token
@cross_origin(supports_credentials=True)
def get_mashups():
  res = []

  mashups = Mashup.query.filter_by(user_uri=session['user_info']['uri']).all()
  for mashup in mashups:
    res.append({
      "acap_song_name": mashup.acap_song_name,
      "acap_artist_name": mashup.acap_artist_name,
      "acap_image": mashup.acap_image,
      "acap_link": mashup.acap_link,
      "acap_uri": mashup.acap_uri,
      
      "instr_song_name": mashup.instr_song_name,
      "instr_artist_name": mashup.instr_artist_name,
      "instr_image": mashup.instr_image,
      "instr_link": mashup.instr_link,
      "instr_uri": mashup.instr_uri,
    })

  return jsonify([e for e in res]), 200

# post new mashup
mashup_args = reqparse.RequestParser()
mashup_args.add_argument("instr_uri", type=str, help="Instrumental URI is required", required=True)
mashup_args.add_argument("acap_uri", type=str, help="Acapella URI is required", required=True)
mashup_args.add_argument("acap_song_name", type=str, help="Acapella song name is required", required=True)
mashup_args.add_argument("acap_artist_name", type=str, help="Acapella artist name is required", required=True)
mashup_args.add_argument("acap_image", type=str, help="Acapella image is required", required=True)
mashup_args.add_argument("acap_link", type=str, help="Acapella link is required", required=True)
mashup_args.add_argument("instr_song_name", type=str, help="Instrumental song name is required", required=True)
mashup_args.add_argument("instr_artist_name", type=str, help="Instrumental artist name is required", required=True)
mashup_args.add_argument("instr_image", type=str, help="Instrumental image is required", required=True)
mashup_args.add_argument("instr_link", type=str, help="Instrumental link is required", required=True)

@app.route('/mashups', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def create_mashup():
  data = mashup_args.parse_args()

  same_mashup = Mashup.query.filter_by(user_uri=session['user_info']['uri'], instr_uri=data['instr_uri'], acap_uri=data['acap_uri']).first()
  if same_mashup:
    return jsonify({"message": "Mashup already exists."}), 409

  mashup = Mashup(user_uri=session['user_info']['uri'], 
    instr_uri=data['instr_uri'], 
    acap_uri=data['acap_uri'],
    acap_song_name=data['acap_song_name'],
    instr_song_name=data['instr_song_name'],
    acap_artist_name=data['acap_artist_name'],
    instr_artist_name=data['instr_artist_name'],
    acap_image=data['acap_image'],
    instr_image=data['instr_image'],
    acap_link=data['acap_link'],
    instr_link=data['instr_link'])
  db.session.add(mashup)
  db.session.commit()

  return jsonify(mashup.serialize()), 200

# delete mashup
mashup_delete_args = reqparse.RequestParser()
mashup_delete_args.add_argument("instr_uri", type=str, help="Instrumental URI is required", required=True)
mashup_delete_args.add_argument("acap_uri", type=str, help="Acapella URI is required", required=True)

@app.route('/mashups', methods=['DELETE'])
@login_required
@cross_origin(supports_credentials=True)
def delete_mashup():
  data = mashup_delete_args.parse_args()

  mashup = Mashup.query.filter_by(user_uri=session['user_info']['uri'], instr_uri=data['instr_uri'], acap_uri=data['acap_uri']).first()
  if not mashup:
    return jsonify({"message": "Mashup does not exist."}), 404

  db.session.delete(mashup)
  db.session.commit()

  return jsonify({"message": "Mashup deleted successfully."}), 200

# ––––– Spotify Endpoints –––––
spotify_mashup_args = reqparse.RequestParser()
spotify_mashup_args.add_argument("instr_uri", type=str, help="Instrumental URI is required", required=True)
spotify_mashup_args.add_argument("instr_name", type=str, help="Instrumental URI is required", required=True)
spotify_mashup_args.add_argument("acap_uri", type=str, help="Acapella URI is required", required=True)
spotify_mashup_args.add_argument("acap_name", type=str, help="Instrumental URI is required", required=True)

@app.route('/add-spotify-mashup', methods=['POST'])
@login_required
@requires_access_token
@cross_origin(supports_credentials=True)
def add_spotify_mashup():
  response = refresh_user_token(session['user_refresh_token'])
  if response[1] != 200:
    return jsonify({"message": "Error in refreshing token."}), response.status_code

  data = spotify_mashup_args.parse_args()
  instr_uri = data['instr_uri']
  instr_name = data['instr_name']
  acap_uri = data['acap_uri']
  acap_name = data['acap_name']

  r = create_mashup_playlist(session['user_access_token'], session['user_info']['id'], instr_name, acap_name)
  if r.status_code != 201:
    return jsonify({"message": "Error in creating playlist."}), r.status_code
  
  r = add_songs_to_mashup(r.json()['id'], instr_uri, acap_uri, session['user_access_token'])

  if r.status_code != 201:
    return jsonify({"message": "Error in adding tracks to playlist."}), r.status_code
  return jsonify({"message": "Mashup added to Spotify!"}), 200

# ––––– MAIN –––––
if __name__ == '__main__':
  app.run(debug=True)
