import pytest
import datetime
from app import app as myx_app, db
from bootstrap import load_songs


# ––––– Test Setup –––––
@pytest.fixture
def client():
  with myx_app.test_client() as client:
      with myx_app.app_context():
        db.create_all()
        load_songs('src/test_data.csv')
      
      yield client

  with myx_app.app_context():       
    db.drop_all()

def login(client):
  with client.session_transaction() as session:
    session['user_info'] = { 'uri': 'test_user' }
    session['user_access_token'] = 'XXXXX'
    session['token_expires'] = datetime.datetime.now() + datetime.timedelta(seconds=3600)
    session['user_refresh_token'] = 'XXXXX'

def logout(client):
  with client.session_transaction() as session:
    session.pop('user_info', None)
    session.pop('user_access_token', None)
    session.pop('token_expires', None)
    session.pop('user_refresh_token', None)

# ––––– Tests –––––
def test_logged_out(client):
  res = client.get('/')
  assert res.status_code == 401
  assert b'User is not logged in' in res.data

def test_logged_in(client):
  login(client)
  res = client.get('/')
  assert b'Welcome to the Myx API!' in res.data
  logout(client)

def test_get_acapellas_incomplete_params(client):
  login(client)
  data = {'bpm': 200, 'genre': 'edm'}
  res = client.get('/get-acapellas', json=data)
  assert res.status_code == 400
  assert b'All parameters are required' in res.data
  logout(client)

def test_get_mashups_empty(client):
  login(client)
  res = client.get('/mashups')
  assert res.status_code == 200
  assert res.get_json() == []
  logout(client)

def test_post_get_delete_mashup(client):
  login(client)
  data = {
    'acap_uri': 'test',
    'acap_song_name': '',
    'acap_artist_name': '',
    'acap_image': '',
    'acap_link': '',
    'instr_uri': 'test',
    'instr_song_name': '',
    'instr_artist_name': '',
    'instr_image': '',
    'instr_link': ''
  }
  res = client.post('/mashups', json=data)
  assert res.status_code == 200

  res = client.get('/mashups')
  assert res.status_code == 200
  assert len(res.get_json()) != 0

  data = {
    'acap_uri': 'test',
    'instr_uri': 'test'
  }
  res = client.delete('/mashups', json=data)
  assert res.status_code == 200

  res = client.get('/mashups')
  assert res.status_code == 200
  assert res.get_json() == []
  logout(client)

def test_delete_mashup_unsuccessful(client):
  login(client)
  data = {
    'acap_uri': 'none',
    'instr_uri': 'none'
  }
  res = client.delete('/mashups', json=data)
  assert res.status_code == 404
  logout(client)