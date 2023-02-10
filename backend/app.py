from flask import Flask, request, jsonify, make_response
from flask_restful import reqparse, abort
from flask_sqlalchemy import SQLAlchemy
import os
import requests
from creds import CLIENT_ID, CLIENT_SECRET

# ––––– App Initialization / Setup –––––
DB_FILE = "songs.db"
AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'

access_token = None
headers = None

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_FILE}"
db = SQLAlchemy()

from models import *
# app.app_context().push()

# setup key hashmap
pitchmap = {
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
        return [tuple([key, '+0']) for key in pitchmap[key]]

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
    
    return [tuple([key, "-{}".format(diff)]) for key in pitchmap[lo]] + [tuple([key, "+{}".format(diff)]) for key in pitchmap[hi]]


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
        return tuple([bpm - 15, bpm + 15])

def get_spotify_song_data(track_uri):
    track_id = track_uri.split(':')[2]
    r = requests.get(BASE_URL + 'audio-features/' + track_id, headers=headers)
    return r.json()

def get_match_uris(instr_data, req_data):
    sel_genre, sel_decade, sel_key, sel_bpm, sel_limit = input_map[req_data['genre']], int(req_data['decade']), req_data['key'], req_data['bpm'], req_data['limit']
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

# ––––– App Routes –––––

# Intro Endpoint
@app.route('/', methods=['GET'])
def main():
    return jsonify({"message": "Welcome to the Myx API!"}), 200

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
        return "All parameters are required: uri, bpm, genre, decade, key, limit", 400

    # get spotify data for song
    instr_data = get_spotify_song_data(uri)

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

    return jsonify(res), 200

# CORS Errors
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    get_access_token()
    db.init_app(app)
    app.run(debug=True)
