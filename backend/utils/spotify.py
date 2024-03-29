# Imports
import requests
import base64
from config import backend_url, CLIENT_ID, CLIENT_SECRET
from .helpers import extract_track_description_data, combine_track_info_features
import httpx
import asyncio

# Creating Session Object
session = requests.Session()

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
  return session.post(AUTH_URL, {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
  })

def get_user_token(code):
  return session.post(AUTH_URL, 
    data={
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': REDIRECT_URI
    },
    headers=client_headers
  )

def get_user_info(user_access_token):
  return session.get(
    'https://api.spotify.com/v1/me',
    headers={
      'Authorization': 'Bearer ' + user_access_token
    }
  )

def refresh_spot_user_token(refresh_token):
  return session.post(AUTH_URL,
    data={
      'grant_type': 'refresh_token',
      'refresh_token': refresh_token
    }, 
    headers=client_headers
  )

def get_spotify_song_audio_features(track_uri, headers):
  track_id = track_uri.split(':')[2]
  r = session.get(BASE_URL + 'audio-features/' + track_id, headers=headers)
  return r.json()

def get_spotify_song_info(track_uri, headers):
  track_id = track_uri.split(':')[2]
  r = session.get(BASE_URL + 'tracks/' + track_id, headers=headers)
  return r.json()

def create_mashup_playlist(access_token, id, instr_name, acap_name):
  return session.post(
    BASE_URL + 'users/' + id + '/playlists',
    json={
      "name": "Myxup: " + instr_name + " + " + acap_name,
      "description": "Mashup created with Myx.",
      "public": False
    },
    headers=get_user_headers(access_token)
  )

def add_songs_to_mashup(playlist_id, instr_uri, acap_uri, access_token):
  return session.post(
    BASE_URL + 'playlists/' + playlist_id + '/tracks',
    json={
      "uris": [instr_uri, acap_uri]
    },
    headers=get_user_headers(access_token)
  )

def get_user_playlists(user_access_token):
  limit = 3
  all_playlists = []
  next_url = 'https://api.spotify.com/v1/me/playlists?limit=50'
  while next_url and limit:
    limit -= 1
    res = session.get(
      next_url,
      headers={
        'Authorization': 'Bearer ' + user_access_token
      }
    )
    next_url = res.json()['next']
    all_playlists.extend(res.json()['items'])
  
  return all_playlists

async def get_playlist_subset_tracks(
  session,
  playlist_id,
  offset,
  user_access_token,
  headers
):
  # get track descriptions
  desc_res = await session.get(
    f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks?limit=100&offset={offset}',
    headers = {
      'Authorization': 'Bearer ' + user_access_token
    })
  track_descriptions = extract_track_description_data(desc_res.json()['items'])
  track_ids = [e['id'] for e in track_descriptions]

  # get track audio features
  feat_res = await session.get(BASE_URL + 'audio-features?ids=' + ','.join(track_ids), headers=headers)
  track_features = feat_res.json()['audio_features']
  
  return combine_track_info_features(track_descriptions, track_features)

async def get_playlist_full_tracks(
  playlist_id,
  num_songs,
  user_access_token,
  headers
):
  all_items, limit = [], 5
  iterations = min((int(num_songs) + 99) // 100, limit)

  async with httpx.AsyncClient() as async_sess:
    tasks = []
    for i in range(iterations):
      task = asyncio.create_task(get_playlist_subset_tracks(
        async_sess,
        playlist_id,
        i * 100,
        user_access_token,
        headers
      ))
      tasks.append(task)
    all_items = await asyncio.gather(*tasks, return_exceptions=True)

  all_items = [item for sublist in all_items for item in sublist]

  return all_items
