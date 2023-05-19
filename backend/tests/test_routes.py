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
  assert b'User is not logged in' in res.data

def test_logged_in(client):
  login(client)
  res = client.get('/')
  assert b'Welcome to the Myx API!' in res.data
  logout(client)



# testing get acapellas successful

# testing get acapellas unsuccessful
