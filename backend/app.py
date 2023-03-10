import redis
from flask import Flask, request, jsonify, make_response, redirect, session
from flask_restful import abort, reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS, cross_origin
import datetime
import time
import requests
import base64
import jwt
from creds import CLIENT_ID, CLIENT_SECRET, secret_key
from config import DEV_DB, PROD_DB, redis_url, backend_url, frontend_url
import logging
from functools import wraps

# ––––– App Initialization / Setup –––––
AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'
REDIRECT_URI = backend_url + '/callback'
FRONTEND_REDIRECT_URL = frontend_url + '/home'

access_token = None
headers = None
expires_at = None

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = PROD_DB
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

# setup key hashmap
harmonic_pitchmap = {
    0: [5, 7, 21],
    1: [6, 8, 22],
    2: [7, 9, 23],
    3: [8, 10, 12],
    4: [9, 11, 13],
    5: [0, 10, 14],
    6: [1, 11, 15],
    7: [0, 2, 16],
    8: [1, 3, 17],
    9: [2, 4, 18],
    10: [3, 5, 19],
    11: [4, 6, 20],
    12: [17, 19, 3],
    13: [18, 20, 4],
    14: [19, 21, 5],
    15: [20, 22, 6],
    16: [21, 23, 7],
    17: [12, 22, 8],
    18: [13, 23, 9],
    19: [12, 14, 10],
    20: [13, 15, 11],
    21: [14, 16, 0],
    22: [15, 17, 1],
    23: [16, 18, 2]
}
major_pitchmap = {
    0: [5, 7],
    1: [6, 8],
    2: [7, 9],
    3: [8, 10],
    4: [9, 11],
    5: [0, 10],
    6: [1, 11],
    7: [0, 2],
    8: [1, 3],
    9: [2, 4],
    10: [3, 5],
    11: [4, 6],
    12: [17, 19],
    13: [18, 20],
    14: [19, 21],
    15: [20, 22],
    16: [21, 23],
    17: [12, 22],
    18: [13, 23],
    19: [12, 14],
    20: [13, 15],
    21: [14, 16],
    22: [15, 17],
    23: [16, 18]
}

genre_map = {
    "Dance/Electronic": "edm",
    "pop": "pop",
    "jazz": "jazz",
    "country": "country",
    "R&B": "r&b",
    "World/Traditional": "world",
    "Folk/Acoustic": "folk",
    "hip hop": "hip-hop",
    "blues": "blues",
    "latin": "latin",
    "metal": "metal",
    "rock": "rock"
}

input_map = {
    "Pop": "pop",
    "Hip-Hop / Rap": "hip-hop",
    "Rock": "rock",
    "Country": "country",
    "EDM": "edm",
    "R&B": "r&b",
    "Latin": "latin",
    "Metal": "metal",
    "Blues": "blues"
}

# ––––– Functions –––––
def get_access_token():
    global access_token, headers, expires_at
    
    if expires_at is not None and expires_at > time.time():
        return

    auth_response = requests.post(AUTH_URL, {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    })

    auth_response_data = auth_response.json()
    # app.logger.info(auth_response_data)
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

# key, mode -> pitchmap_key
def pitchmap_key(key, mode):
    return (1 - mode) * 12 + key

def get_adjusted_key_range(key, diff):
    if not diff:
        return [tuple([key, '+0']) for key in major_pitchmap[key]]

    lo = hi = key
    if 0 <= key < 12:
        if key + diff > 12:
            hi = (key + diff) % 11
        else:
            hi = key + diff
        
        if key - diff < 0:
            lo = 11 + (key - diff)
        else:
            lo = key - diff
    else:
        if key + diff > 23:
            hi = (key + diff) - 23 + 12
        else:
            hi = key + diff
        
        if key - diff < 12:
            lo = 23 + (key - diff)
        else:
            lo = key - diff
    
    return [tuple([key, "-{}".format(diff)]) for key in major_pitchmap[lo]] + [tuple([key, "+{}".format(diff)]) for key in major_pitchmap[hi]]


def get_key_range(key, input):
    # use tuples to indicate key shifts
    if input == 'Exact':
        # no shift
        return get_adjusted_key_range(key, 0)
    elif input == 'Tight':
        # 1 tone
        return get_adjusted_key_range(key, 0) + get_adjusted_key_range(key, 1)
    else:
        # 2 tones
        return get_adjusted_key_range(key, 0) + get_adjusted_key_range(key, 1) + get_adjusted_key_range(key, 2)
    

def get_bpm_range(bpm, input):
    if input == 'Exact':
        return tuple([bpm, bpm])
    elif input == 'Tight':
        return tuple([bpm - 5, bpm + 5])
    else:
        return tuple([bpm - 20, bpm + 20])

def get_spotify_song_data(track_uri):
    track_id = track_uri.split(':')[2]
    r = requests.get(BASE_URL + 'audio-features/' + track_id, headers=headers)
    return r.json()

def get_spotify_song_info(track_uri):
    track_id = track_uri.split(':')[2]
    r = requests.get(BASE_URL + 'tracks/' + track_id, headers=headers)
    return r.json()

def extract_song_data(song_data):
    return {
        'uri': song_data['uri'],
        'name': song_data['name'],
        'artists': [artist['name'] for artist in song_data['artists']],
        'link': song_data['external_urls']['spotify'],
        'image': song_data['album']['images'][1]['url']
    }

def get_match_uris(instr_data, req_data):
    sel_genre = input_map[req_data['genre']]
    sel_decade = int(req_data['decade'])
    sel_key = req_data['key']
    sel_bpm = req_data['bpm']
    sel_limit = req_data['limit']
    lo_bpm, hi_bpm = get_bpm_range(int(instr_data['tempo']), sel_bpm)
    key = pitchmap_key(instr_data['key'], instr_data['mode'])
    keys = {key: value for key, value in get_key_range(key, sel_key)}

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

    return acapellas, keys

# ––––– OAuth –––––
@app.route('/callback')
@requires_access_token
def callback():
    code = request.args.get('code')
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + base64.b64encode(bytes(CLIENT_ID + ':' + CLIENT_SECRET, 'utf-8')).decode('utf-8')
    }
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    response = requests.post(AUTH_URL, data=data, headers=headers)
    app.logger.info(response.json())
    
    user_access_token = response.json()['access_token']
    user_refresh_token = response.json()['refresh_token']
    expires_in = response.json()['expires_in']
    
    headers = {
        'Authorization': 'Bearer ' + user_access_token
    }
    response = requests.get(
        'https://api.spotify.com/v1/me',
        headers=headers
    )
    user_info = response.json()
    
    session['user_info'] = user_info
    session['user_access_token'] = user_access_token
    session['token_expires'] = datetime.datetime.now() + datetime.timedelta(seconds=expires_in)
    session['user_refresh_token'] = user_refresh_token

    return redirect(FRONTEND_REDIRECT_URL)

def refresh_user_token(refresh_token):
    if session['token_expires'] > datetime.datetime.now() + datetime.timedelta(seconds=60):
        return jsonify({"message": "Token is still valid"}), 200

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + base64.b64encode(bytes(CLIENT_ID + ':' + CLIENT_SECRET, 'utf-8')).decode('utf-8')
    }
    
    response = requests.post(AUTH_URL, data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token
    }, headers=headers)

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
            app.logger.info(session)
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
    uri = request.args.get("uri")
    bpm = request.args.get("bpm")
    genre = request.args.get("genre")
    decade = request.args.get("decade")
    key = request.args.get("key")
    limit = request.args.get("limit")

    if uri is None or bpm is None or genre is None or decade is None or key is None or limit is None:
        return jsonify({"message": "All parameters are required: uri, bpm, genre, decade, key, limit"}), 400

    # get spotify data for song
    try:
        instr_data = get_spotify_song_data(uri)
    except:
        return jsonify({"message": "Invalid URI or search failed."}), 400

    # find matches
    data = {
        "uri": uri,
        "bpm": bpm,
        "genre": genre,
        "decade": decade,
        "key": key,
        "limit": limit
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

    user_headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session['user_access_token']
    }

    body = {
        "name": "Myxup: " + instr_name + " + " + acap_name,
        "description": "Mashup created with Myx.",
        "public": False
    }

    r = requests.post(BASE_URL + 'users/' + session['user_info']['id'] + '/playlists', json=body, headers=user_headers)
    if r.status_code != 201:
        return jsonify({"message": "Error in creating playlist."}), r.status_code
    
    playlist_id = r.json()['id']

    data = {
        "uris": [instr_uri, acap_uri]
    }

    r = requests.post(BASE_URL + 'playlists/' + playlist_id + '/tracks', json=data, headers=user_headers)

    if r.status_code != 201:
        return jsonify({"message": "Error in adding tracks to playlist."}), r.status_code
    return jsonify({"message": "Mashup added to Spotify!"}), 200

# ––––– MAIN –––––

if __name__ == '__main__':
    # get_access_token()
    # db.init_app(app)
    # sess.init_app(app)
    app.run(debug=True)
