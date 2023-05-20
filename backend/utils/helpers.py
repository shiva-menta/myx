# Imports
from .maps import major_pitchmap, harmonic_pitchmap

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

def calc_key_distance(song1_mode, song1_key, song2_mode, song2_key):
  song1_adj_key, song2_adj_key = pitchmap_key(song1_key, song1_mode), pitchmap_key(song2_key, song2_mode)
  if song1_adj_key == song2_adj_key:
    return 0
  else:
    if song1_adj_key in major_pitchmap[song2_adj_key]:
      return 1
    elif song1_adj_key in harmonic_pitchmap[song2_adj_key]:
      return 2
  
  return 10

def calc_mix_distance(song1_data, song2_data):
  return calc_key_distance(
      song1_mode=song1_data['mode'],
      song1_key=song1_data['key'],
      song2_mode=song2_data['mode'],
      song2_key=song2_data['key']
    ) \
    + abs(song1_data['tempo'] - song2_data['tempo']) * 0.2 \
    + abs(song1_data['valence'] - song2_data['valence']) * 5 \
    + abs(song1_data['energy'] - song2_data['energy']) * 5 \
    + abs(song1_data['danceability'] - song2_data['danceability']) * 5 \
    + abs(song1_data['acousticness'] - song2_data['acousticness']) * 5

def adjust_track_key(song_data, pitch_shift):
  key = song_data['key']
  new_key = key + pitch_shift
  if new_key > 11:
    new_key = new_key % 12
  elif new_key < 0:
    new_key += 12
  song_data['key'] = new_key

  return song_data

def get_pitch_adjusted_track_data(track_descriptions, track_data, pitch_tolerance):
  all_track_names, all_track_data = [], []
  for i in range(len(track_descriptions)):
    all_track_names.append(track_descriptions[i])
    all_track_data.append(track_data[i])
  for i in range(1, pitch_tolerance + 1):
    for track_ind, track_description in enumerate(track_descriptions):
      all_track_names.extend([{
        'artists': track_description['artists'],
        'id': track_description['id'],
        'name': track_description['name'] + f'| +{i}'
      }, {
        'artists': track_description['artists'],
        'id': track_description['id'],
        'name': track_description['name'] + f'| -{i}'
      }])
      all_track_data.extend([adjust_track_key(track_data[track_ind], i), adjust_track_key(track_data[track_ind], -1 * i)])
  return all_track_names, all_track_data

def create_weight_matrix(track_descriptions, track_data):
  pitch_shift_tolerance = 2
  adj_track_descriptions, adj_track_data = get_pitch_adjusted_track_data(track_descriptions, track_data, pitch_shift_tolerance)
  pitch_adj_num_tracks = len(adj_track_descriptions)
  matrix = [[0] * pitch_adj_num_tracks for _ in range(pitch_adj_num_tracks)]

  for i in range(pitch_adj_num_tracks):
    for j in range(i + 1, pitch_adj_num_tracks):
      matrix[i][j] = calc_mix_distance(adj_track_data[i], adj_track_data[j])

  return adj_track_descriptions, adj_track_data, matrix