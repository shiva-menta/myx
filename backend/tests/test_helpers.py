import pytest
from utils.helpers import adjust_track_key, get_pitch_adjusted_track_data, calc_key_distance, calc_tempo_distance, calc_mix_distance, create_weight_matrix


# ––––– Tests –––––
def test_adjust_track_key_increase():
    song_data = {"key": 5}
    result = adjust_track_key(song_data, 3)
    assert result["key"] == 8

def test_adjust_track_key_decrease():
    song_data = {"key": 2}
    result = adjust_track_key(song_data, -1)
    assert result["key"] == 1

def test_adjust_track_key_overflow():
    song_data = {"key": 11}
    result = adjust_track_key(song_data, 2)
    assert result["key"] == 1

def test_adjust_track_key_underflow():
    song_data = {"key": 0}
    result = adjust_track_key(song_data, -1)
    assert result["key"] == 11

def test_get_pitch_adjusted_track_data():
    full_track_data = [{"name": "test", "artists": ["artist"], "id": "123", "audio_features": {"key": 5}}]
    result = get_pitch_adjusted_track_data(full_track_data, 1)

    assert len(result) == 3

    assert result[0] == full_track_data[0]

    assert result[1]["name"] == "test | +1"
    assert result[2]["name"] == "test | -1"

    assert result[1]["audio_features"]["key"] == 6
    assert result[2]["audio_features"]["key"] == 4

def test_calc_key_distance():
    assert calc_key_distance(1, 5, 1, 5) == 0

def test_calc_tempo_distance():
    assert calc_tempo_distance(120, 125) == 0
    assert calc_tempo_distance(120, 130) == 200
    assert calc_tempo_distance(120, 135) == 200

def test_calc_mix_distance():
    song1_data = {"mode": 1, "key": 5, "tempo": 120, "valence": 0.5, "energy": 0.5, "danceability": 0.5, "acousticness": 0.5}
    song2_data = {"mode": 1, "key": 5, "tempo": 120, "valence": 0.5, "energy": 0.5, "danceability": 0.5, "acousticness": 0.5}
    assert calc_mix_distance(song1_data, song2_data) == 0

def test_create_weight_matrix():
    full_track_data = [{"name": "test", "artists": ["artist"], "id": "123", "audio_features": {"key": 5, "mode": 1, "tempo": 120, "valence": 0.5, "energy": 0.5, "danceability": 0.5, "acousticness": 0.5}}]
    pitch_shift_tolerance = 2
    adj_tracks, matrix = create_weight_matrix(full_track_data)
    assert adj_tracks == get_pitch_adjusted_track_data(full_track_data, pitch_shift_tolerance)
    assert len(matrix) == len(adj_tracks)