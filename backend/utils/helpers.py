# Imports
from .maps import major_pitchmap

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