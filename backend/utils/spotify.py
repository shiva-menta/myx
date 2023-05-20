# Imports
import requests
import base64
from config import backend_url, CLIENT_ID, CLIENT_SECRET

# URLs
AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'
REDIRECT_URI = backend_url + '/callback'

# ---- HEADERS ----
client_headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Authorization': 'Basic ' + base64.b64encode(bytes(CLIENT_ID + ':' + CLIENT_SECRET, 'utf-8')).decode('utf-8')
}
def get_user_headers(access_token):
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + access_token
  }

# ---- FUNCTIONS ----
def get_spotify_app_token():
  return requests.post(AUTH_URL, {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
  })

def get_user_token(code):
  return requests.post(AUTH_URL, 
    data={
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': REDIRECT_URI
    },
    headers=client_headers
  )

def get_user_info(user_access_token):
  return requests.get(
    'https://api.spotify.com/v1/me',
    headers={
      'Authorization': 'Bearer ' + user_access_token
    }
  )

def refresh_spot_user_token(refresh_token):
  return requests.post(AUTH_URL,
    data={
      'grant_type': 'refresh_token',
      'refresh_token': refresh_token
    }, 
    headers=client_headers
  )

def get_spotify_song_audio_features(track_uri, headers):
  track_id = track_uri.split(':')[2]
  r = requests.get(BASE_URL + 'audio-features/' + track_id, headers=headers)
  return r.json()

def get_spotify_songs_audio_features(track_uris, headers):
  length = len(track_uris)
  iterations = length // 100 + 1
  all_tracks = []

  for i in range(iterations):
    curr_uris = ','.join(track_uris[i * 100 : min(length, (i + 1) * 100)])
    r = requests.get(BASE_URL + 'audio-features?ids=' + curr_uris, headers=headers)
    all_tracks += [{
      'acousticness': e['acousticness'],
      'danceability': e['danceability'],
      'energy': e['energy'],
      'key': e['key'],
      'loudness': e['loudness'],
      'mode': e['mode'],
      'tempo': e['tempo'],
      'valence': e['valence']
    } for e in r.json()['audio_features']]
  
  return all_tracks

def get_spotify_song_info(track_uri, headers):
  track_id = track_uri.split(':')[2]
  r = requests.get(BASE_URL + 'tracks/' + track_id, headers=headers)
  return r.json()

def create_mashup_playlist(access_token, id, instr_name, acap_name):
  return requests.post(
    BASE_URL + 'users/' + id + '/playlists',
    json={
      "name": "Myxup: " + instr_name + " + " + acap_name,
      "description": "Mashup created with Myx.",
      "public": False
    },
    headers=get_user_headers(access_token)
  )

def add_songs_to_mashup(playlist_id, instr_uri, acap_uri, access_token):
  return requests.post(
    BASE_URL + 'playlists/' + playlist_id + '/tracks',
    json={
      "uris": [instr_uri, acap_uri]
    },
    headers=get_user_headers(access_token)
  )

def get_user_playlists(user_access_token):
  return requests.get(
    'https://api.spotify.com/v1/me/playlists?limit=50',
    headers={
      'Authorization': 'Bearer ' + user_access_token
    }
  )

def get_playlist_items(playlist_id, user_access_token):
  return requests.get(
    f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks',
    headers={
      'Authorization': 'Bearer ' + user_access_token
    }
  )
