from lxml import html
import requests
import json
from creds import CLIENT_ID, CLIENT_SECRET
import csv

AUTH_URL = 'https://accounts.spotify.com/api/token'
access_token = None
headers = None

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

def scrape_spotify_playlists(ids, genre):
    uris = []
    
    for id in ids:
        url = f"https://api.spotify.com/v1/playlists/{id}/tracks"
        response = requests.get(url, headers=headers)
        data = response.json()
        for item in data['items']:
            uris.append(item['track']['uri'])
    
    with open('src/new_songs_uris.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for uri in uris:
            writer.writerow([uri, genre])

# ––––– POP SONGS –––––

def scrape_pop_link():
    page = requests.get('https://www.liveabout.com/top-pop-songs-of-the-2000s-3248358')
    tree = html.fromstring(page.content)
    links = tree.xpath("//*[contains(@class, 'mntl-sc-block-heading__link')]")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for link in links:
            txt_1 = link.text.split(":")
            name = txt_1[1].split("(")[0].strip().strip("'")
            writer.writerow([name, txt_1[0], 'pop'])

# Spotify Playlist IDs: ['3qBfIVSkqusmkNUnXM0uLm', '2cG36Z2ODrVKVJ2AGI6Eiv', '3EaR6DYH8p027RZcEXa8Xm']

# ––––– Hip-Hop –––––

def scrape_hiphop_link_2010s():
    page = requests.get('https://www.xxlmag.com/hip-hop-songs-defined-2010s/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//div[@class='list-post-right']")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            header = element.xpath("./header")[0]
            song_name = header.xpath("./h2/text()")[0].strip().strip('"')
            song_artist = header.xpath("./small/text()")[0]
            writer.writerow([song_name, song_artist, 'hip-hop'])

def scrape_hiphop_link_2020s():
    page = requests.get('https://www.musicindustryhowto.com/2020s-hip-hop-songs/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//h2[.//*[@class='ez-toc-section']]")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            txt = element.text_content().split(" by ")
            if len(txt) < 2:
                continue
            name = txt[0].strip().strip('“').strip('”')
            artist = txt[1].strip()
            writer.writerow([name, artist, 'hip-hop'])

def scrape_hiphop_link_2000s():
    page = requests.get('https://www.musicindustryhowto.com/2000s-hip-hop-songs/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//h2[.//*[@class='ez-toc-section']]")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            txt = element.text_content().split(" by ")
            if len(txt) < 2:
                continue
            name = txt[0].strip().strip('“').strip('”')
            artist = txt[1].strip()
            writer.writerow([name, artist, 'hip-hop'])

def scrape_hiphop_link_2010s_ringer():
    page = requests.get('https://music.theringer.com/2010s-rap/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//div[@class='song__inner']")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            song_name = element.xpath("./h3/text()")[0].strip().strip('"')
            song_artist = element.xpath("./h4/text()")[0].strip()
            writer.writerow([song_name, song_artist, 'hip-hop'])

# ––––– Rock –––––

def scrape_rock_link_2000s():
    page = requests.get('https://middermusic.com/2000s-rock-songs/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//h2[@class='wp-block-heading']")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            txt = element.text_content().split(" by ")
            if len(txt) < 2:
                continue
            name = txt[0].split('. ')[1].strip().strip('“').strip('”')
            artist = txt[1].strip()
            writer.writerow([name, artist, 'rock'])

def scrape_rock_link_2020s():
    page = requests.get('https://www.musicindustryhowto.com/2020s-rock-songs/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//h2[.//*[@class='ez-toc-section']]")

    for element in elements:
        txt = element.text_content().split(" by ")
        if len(txt) < 2:
            continue
        name = txt[0].strip().strip('“').strip('”')
        artist = txt[1].strip()
        print([name, artist])

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            txt = element.text_content().split(" by ")
            if len(txt) < 2:
                continue
            name = txt[0].strip().strip('“').strip('”')
            artist = txt[1].strip()
            writer.writerow([name, artist, 'rock'])

# ––––– Country –––––

def scrape_country_link_2020s():
    page = requests.get('https://www.musicindustryhowto.com/2020s-country-songs/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//h2[.//*[@class='ez-toc-section']]")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            txt = element.text_content().split(" by ")
            if len(txt) < 2:
                continue
            name = txt[0].strip().strip('“').strip('”')
            artist = txt[1].strip()
            writer.writerow([name, artist, 'country'])

# ––––– R&B –––––
def scrape_rb_link_2020s():
    page = requests.get('https://www.capitalxtra.com/playlists/best-2020/rnb-songs-listen/')
    tree = html.fromstring(page.content)
    elements = tree.xpath("//h2[@class='title']")

    with open('src/new_songs.csv', 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        for element in elements:
            txt = element.text_content().split(" - ")
            if len(txt) < 2:
                continue
            artist = txt[0].strip()
            name = txt[1].strip().strip("'")
            writer.writerow([name, artist, 'r&b'])

if __name__ == '__main__':
    get_access_token()
    scrape_spotify_playlists(['1FaX1Max0KZErtm93tgcSI', '37i9dQZF1DWXNFSTtym834', '41mj3UeexIKCyNeMSlRoQM'], 'metal')

