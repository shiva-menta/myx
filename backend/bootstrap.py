import os
from app import app, db, DB_FILE
import requests
import pandas as pd
from time import sleep
from creds import CLIENT_ID, CLIENT_SECRET


# ––––– Environment Setup –––––


AUTH_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/'
SEARCH_URL = 'https://api.spotify.com/v1/search?q='

access_token = None
headers = None

GENRES = set(["pop", "rock", "country", "latin", "metal", "edm", "r&b", "hip-hop"])

# ––––– Setup Functions –––––


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


# ––––– CSV Editing Functions –––––


def clean_acapella_csv():
    df = pd.read_csv('src/songs_normalize.csv')
    filtered_df = df[(df['genre'] != "set()") & (df['instrumentalness'] <= 0.25)]
    filtered_df.to_csv('acapellas.csv', index=False)

def add_song_uris():
    df = pd.read_csv('src/new_songs.csv')

    for index, row in df.iterrows():
        if index % 150 == 0 and index != 0:
            sleep(60)
        df.at[index, 'uri'] = calc_uri_column(row)
        print(index)

    df.to_csv('src/new_songs.csv', index=False)

def calc_uri_column(row):
    return get_spotify_song_data(row['song'], row['artist'])

def get_spotify_song_data(name, artist):
    # get uri
    r = requests.get(SEARCH_URL + name + ' ' + artist + '&type=track&limit=1', headers=headers)
    if r is None:
        return ""
    try:
        track_uri = r.json()['tracks']['items'][0]['uri']
        track_id = track_uri.split(':')[2]
    except:
        return ""

    # get info by uri
    # r = requests.get(BASE_URL + 'audio-features/' + track_id, headers=headers)
    # print(json.dumps(r.json(), indent=2))
    return track_uri

def get_song_genres():
    genres = set()
    df = pd.read_csv('src/acapellas.csv')
    column = df['genre']

    for index, value in column.iteritems():
        lst = value.split(', ')
        for genre in lst:
            if genre not in genres:
                genres.add(genre)

    print(list(genres))

def delete_duplicates():
    df = pd.read_csv('src/updated_acapellas.csv')
    df = df.drop_duplicates(subset='uri', keep='first')

    df.to_csv('src/updated_acapellas.csv', index=False)

def create_pitchmap_keys():
    df = pd.read_csv('src/updated_acapellas.csv')

    for index, row in df.iterrows():
        df.at[index, 'adj_key'] = (1 - int(row['mode'])) * 12 + int(row['key'])

    df.to_csv('src/updated_acapellas.csv', index=False)

def get_spotify_song_data(track_uri):
    track_id = track_uri.split(':')[2]
    r = requests.get(BASE_URL + 'audio-features/' + track_id, headers=headers)
    data = r.json()
    return {
        "danceability": data['danceability'],
        "energy": data['energy'],
        "key": data['key'],
        "mode": data['mode'],
        "instrumentalness": data['instrumentalness'],
        "bpm": data['tempo'],
        "valence": data['valence']
    }

def get_spotify_song_info(track_uri):
    track_id = track_uri.split(':')[2]
    r = requests.get(BASE_URL + 'tracks/' + track_id, headers=headers)
    data = r.json()
    return {
        "title": data['name'],
        "artist": [artist['name'] for artist in data['artists']],
        "year": data['album']['release_date'][:4],
        "popularity": data['popularity'],
        "link": data['external_urls']['spotify'],
        "image": data['album']['images'][1]['url']
    }

def get_relevant_track_data(track_uri):
    features = get_spotify_song_data(track_uri)
    info = get_spotify_song_info(track_uri)
    merged_json = features.copy()
    merged_json.update(info)

    return merged_json

def get_acapella_data():
    df_from = pd.read_csv('src/new_songs_uris.csv')
    df_to = []

    for index, row in df_from.iterrows():
        if index % 75 == 0 and index != 0:
            sleep(60)
        data = get_relevant_track_data(row['uri'])
        data['artist'] = ', '.join(data['artist'])
        data['genre'] = row['genre']
        data['uri'] = row['uri']
        df_to.append(data)
        print(index)
    
    df_to = pd.DataFrame(df_to)
    df_to.to_csv('src/updated_acapellas.csv', index=False)


# ––––– Model Loading Functions –––––


def load_songs():
    df = pd.read_csv('src/updated_acapellas.csv')

    for index, row in df.iterrows():
        add_acapella({
            "uri": row['uri'],
            "title": row['title'],
            "artist": row['artist'],
            "key": row['key'],
            "mode": row['mode'],
            "decade": get_decade(row['year']),
            "bpm": int(row['bpm']),
            "popularity": int(row['popularity']),
            "genres": row['genre'].split(', '),
            "adj_key": row['adj_key'],
            "danceability": row['danceability'],
            "energy": row['energy'],
            "valence": row['valence']
        })

def add_acapella(song_dict):
    from models import Acapella, Genre
    genres = song_dict['genres']

    new_acapella = Acapella(
        uri=song_dict['uri'],
        title=song_dict['title'],
        artist=song_dict['artist'],
        key=song_dict['key'],
        decade=song_dict['decade'],
        bpm=song_dict['bpm'],
        popularity=song_dict['popularity'],
        mode=song_dict['mode'],
        adj_key=song_dict['adj_key'],
        danceability=song_dict['danceability'],
        energy=song_dict['energy'],
        valence=song_dict['valence']
    )
    db.session.add(new_acapella)

    for genre_val in genres:
        if genre_val not in GENRES:
            continue
        genre_name = genre_val
        genre = Genre.query.filter_by(name=genre_name).first()
        if not genre:
            genre = Genre(name=genre_name)
            db.session.add(genre)
        new_acapella.genres.append(genre)
    
    db.session.commit()

def get_decade(year):
    year = int(year)
    if year >= 2020:
        return 2020
    elif 2010 <= year < 2019:
        return 2010
    elif 2000 <= year < 2009:
        return 2000
    else:
        return 1990


# ––––– Runtime –––––


if __name__ == '__main__':
    # get_access_token()

    file_path = os.path.join('./instance', DB_FILE)
    if os.path.exists(file_path):
        os.remove(file_path)

    with app.app_context():
        db.create_all()
        load_songs()