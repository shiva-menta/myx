from flask import Flask, request, jsonify, make_response
from flask_restful import reqparse, abort
from flask_sqlalchemy import SQLAlchemy
import os

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# ––––– App Initialization / Setup –––––
DB_FILE = "songs.db"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_FILE}"
db = SQLAlchemy(app)

from models import *
app.app_context().push()

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

# ––––– Functions –––––
# key, mode -> pitchmap_key
def pitchmap_key(key, mode):
    return (1 - mode) * 12 + key

def get_key_range(key, input):
    if input == 'Exact':
        # no shift
        return pitchmap[key]
    elif input == 'Tight':
        # 1 tone
        out = pitchmap[key]
        return out + [x + 1 for x in out] + [x - 1 for x in out]
    else:
        # 2 tones
        out = pitchmap[key]
        return out + [x + 1 for x in out] + [x - 1 for x in out] + [x + 2 for x in out] + [x - 2 for x in out]
    

def get_bpm_range(bpm, input):
    if input == 'Exact':
        return tuple(bpm, bpm)
    elif input == 'Tight':
        return tuple(bpm - 5, bpm + 5)
    else:
        return tuple(bpm - 15, bpm + 15)


def get_match_uris(instr_data, limit):
    # define key range, define bpm range
    lo_bpm, hi_bpm = get_bpm_range(instr_data['bpm'])
    key = pitchmap_key(instr_data['key'], instr_data['mode'])
    keys = get_key_range(key)

    # filter out by genre, decade
    # sort results by popularity (descending), return top 10 most popular
    return

# ––––– App Routes –––––

# Intro Endpoint
@app.route('/', methods=['GET'])
def main():
    return jsonify({"message": "Welcome to the Myx API!"}), 200

# Acapellas Endpoint
acapella_args = reqparse.RequestParser()
acapella_args.add_argument("uri", type=str, help="URI of instrumental song is required.", required=True)
acapella_args.add_argument("bpm", type=str, help="BPM range of acapellas is required.", required=True)
acapella_args.add_argument("genre", type=str, help="Genre of acapellas is required.", required=True)
acapella_args.add_argument("time", type=str, help="Decade range of acapellas is required.", required=True)
acapella_args.add_argument("key", type=str, help="Key range of acapellas is required.", required=True)
acapella_args.add_argument("limit", type=str, help="Return limit of acapellas is required.", required=True)

@app.route('/acapella-match', methods=['GET'])
def get_acapellas():
    data = acapella_args.parse_args()
    instr_uri, res_lim = data['uri'], data['limit']

    # get spotify data for song
    instr_data = sp.track(instr_uri)

    # find matches
    out = get_match_uris(instr_data, res_lim)

    return jsonify([e.uri for e in out]), 200


if __name__ == '__main__':
    app.run(debug=True)
