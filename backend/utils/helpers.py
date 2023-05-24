# Imports
from .maps import major_pitchmap, harmonic_pitchmap
import re
from functools import lru_cache

# Functions
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
  if input == 'Exact':
    return get_adjusted_key_range(key, 0)
  elif input == 'Tight':
    return get_adjusted_key_range(key, 0) + get_adjusted_key_range(key, 1)
  else:
    return get_adjusted_key_range(key, 0) + get_adjusted_key_range(key, 1) + get_adjusted_key_range(key, 2)

def get_bpm_range(bpm, input):
  if input == 'Exact':
    return tuple([bpm, bpm])
  elif input == 'Tight':
    return tuple([bpm - 5, bpm + 5])
  else:
    return tuple([bpm - 20, bpm + 20])

def extract_song_data(song_data):
  return {
    'uri': song_data['uri'],
    'name': song_data['name'],
    'artists': [artist['name'] for artist in song_data['artists']],
    'link': song_data['external_urls']['spotify'],
    'image': song_data['album']['images'][1]['url']
  }

def shorten_song_name(song_name):
  return re.sub(r'\s*\((feat|with)\. [^)]*\)', '', song_name)

def extract_track_description_data(all_track_data):
  return [{
    'name': e['track']['name'],
    'id': e['track']['id'],
    'artists': [artist['name'] for artist in e['track']['artists']]
  } for e in all_track_data if e['track']['id']]

def combine_track_info_features(track_descriptions, track_features):
  all_tracks = []
  for i in range(len(track_descriptions)):
    audio_features = track_features[i]
    if audio_features is not None:
      all_tracks.append({
        'name': shorten_song_name(track_descriptions[i]['name']),
        'artists': track_descriptions[i]['artists'],
        'id': track_descriptions[i]['id'],
        'audio_features': {
          'acousticness': audio_features['acousticness'],
          'danceability': audio_features['danceability'],
          'energy': audio_features['energy'],
          'key': audio_features['key'],
          'loudness': audio_features['loudness'],
          'mode': audio_features['mode'],
          'tempo': audio_features['tempo'],
          'valence': audio_features['valence']
        }
      })
  
  return all_tracks

# Matrix Helpers

@lru_cache(maxsize=128)
def calc_key_distance(song1_mode, song1_key, song2_mode, song2_key):
  song1_adj_key, song2_adj_key = pitchmap_key(song1_key, song1_mode), pitchmap_key(song2_key, song2_mode)
  if song1_adj_key == song2_adj_key:
    return 0
  else:
    if song1_adj_key in major_pitchmap[song2_adj_key]:
      return 1
    elif song1_adj_key in harmonic_pitchmap[song2_adj_key]:
      return 4

  return 50

@lru_cache(maxsize=128)
def calc_tempo_distance(song1_tempo, song2_tempo):
  # adjusting for potential 2x OR 1/2x tempos
  diff = min(abs(song1_tempo - song2_tempo), abs(max(song1_tempo, song2_tempo) / 2 - min(song1_tempo, song2_tempo)))
  if diff <= 5:
    return 0
  elif diff <= 8:
    return 10
  else:
    return 200

def round_nearest_five(n):
  return round(n / 5) * 5

def calc_mix_distance(song1_data, song2_data):
  return calc_key_distance(
      song1_mode=song1_data['mode'],
      song1_key=song1_data['key'],
      song2_mode=song2_data['mode'],
      song2_key=song2_data['key']
    ) \
    + calc_tempo_distance(round_nearest_five(song1_data['tempo']), round_nearest_five(song2_data['tempo'])) \
    + abs(song1_data['valence'] - song2_data['valence']) * 15 \
    + abs(song1_data['energy'] - song2_data['energy']) * 15 \
    + abs(song1_data['danceability'] - song2_data['danceability']) * 15 \
    + abs(song1_data['acousticness'] - song2_data['acousticness']) * 15

def adjust_track_key(song_data, pitch_shift):
  song_data = song_data.copy()
  key = song_data['key']
  new_key = key + pitch_shift
  if new_key > 11:
    new_key = new_key % 12
  elif new_key < 0:
    new_key += 12
  song_data['key'] = new_key

  return song_data

def get_pitch_adjusted_track_data(full_track_data, pitch_tolerance):
  all_tracks = []
  all_tracks.extend(full_track_data)
  for i in range(1, pitch_tolerance + 1):
    for track_data in full_track_data:
      all_tracks.extend([{
        'name': track_data['name'] + f' | +{i}',
        'artists': track_data['artists'],
        'id': track_data['id'],
        'audio_features': adjust_track_key(track_data['audio_features'], i)
      }, {
        'name': track_data['name'] + f' | -{i}',
        'artists': track_data['artists'],
        'id': track_data['id'],
        'audio_features': adjust_track_key(track_data['audio_features'], -1 * i)
      }])

  return all_tracks

def create_weight_matrix(full_track_data):
  pitch_shift_tolerance = 2
  adj_tracks = get_pitch_adjusted_track_data(full_track_data, pitch_shift_tolerance)
  pitch_adj_num_tracks = len(adj_tracks)
  # matrix = [[0] * pitch_adj_num_tracks for _ in range(pitch_adj_num_tracks)]
  weights = []

  for i in range(pitch_adj_num_tracks):
    for j in range(i + 1, pitch_adj_num_tracks):
      # matrix[i][j] = int(calc_mix_distance(adj_tracks[i]['audio_features'], adj_tracks[j]['audio_features']))
      weights.append(int(calc_mix_distance(adj_tracks[i]['audio_features'], adj_tracks[j]['audio_features'])))

  return adj_tracks, weights