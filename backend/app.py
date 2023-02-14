from flask import Flask, request, jsonify, make_response, redirect, session
from flask_restful import abort, reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS, cross_origin
from datetime import timedelta
import requests
import base64
from creds import CLIENT_ID, CLIENT_SECRET, secret_key
import logging

# ––––– App Initialization / Setup –––––
DB_FILE = "songs.db"
AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'
REDIRECT_URI = 'http://127.0.0.1:5000/callback'
FRONTEND_REDIRECT_URL = 'http://localhost:3000/match'

access_token = None
headers = None

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_FILE}"
app.config['SESSION_TYPE'] = 'filesystem'
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = secret_key
logging.basicConfig(level=logging.DEBUG)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
db = SQLAlchemy()
sess = Session()

from models import *
# app.app_context().push()

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
    global access_token, headers

    auth_response = requests.post(AUTH_URL, {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    })

    auth_response_data = auth_response.json()
    access_token = auth_response_data['access_token']
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {token}'.format(token=access_token)
    }

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
    response = requests.post('https://accounts.spotify.com/api/token', data=data, headers=headers)
    
    access_token = response.json()['access_token']
    
    headers = {
        'Authorization': 'Bearer ' + access_token
    }
    response = requests.get(
        'https://api.spotify.com/v1/me',
        headers=headers
    )
    user_info = response.json()
    
    session['user_info'] = user_info
    app.logger.info(session.sid)

    return redirect(FRONTEND_REDIRECT_URL)


# ––––– General Endpoints –––––


# Intro Endpoint
@app.route('/', methods=['GET'])
def main():
    return jsonify({"message": "Welcome to the Myx API!"}), 200


# ––––– Acapella Endpoints –––––

# Acapellas Endpoint
@app.route('/get-acapellas', methods=['GET'])
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
@cross_origin(supports_credentials=True)
def get_mashups():
    mashups = Mashup.query.filter_by(user_uri=session['user_info']['uri']).all()
    mashups = list(map(lambda x: x.serialize(), mashups))
    return jsonify(mashups), 200

# post new mashup
mashup_post_args = reqparse.RequestParser()
mashup_post_args.add_argument("instr_uri", type=str, help="Instrumental URI is required", required=True)
mashup_post_args.add_argument("acap_uri", type=str, help="Acapella URI is required", required=True)

@app.route('/mashups', methods=['POST'])
@cross_origin(supports_credentials=True)
def create_mashup():
    data = request.get_json()

    app.logger.info(request.cookies)

    same_mashup = Mashup.query.filter_by(user_uri=session['user_info']['uri'], instr_uri=data['instr_uri'], acap_uri=data['acap_uri']).first()
    if same_mashup:
        return jsonify({"message": "Mashup already exists."}), 409

    mashup = Mashup(user_uri=session['user_info']['uri'], instr_uri=data['instr_uri'], acap_uri=data['acap_uri'])
    db.session.add(mashup)
    db.session.commit()
    return jsonify(mashup.serialize()), 200

# ––––– MAIN –––––

if __name__ == '__main__':
    get_access_token()
    db.init_app(app)
    sess.init_app(app)
    app.run(debug=True)
