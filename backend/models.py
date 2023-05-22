from app import db


# ––––– Many to Many Relationship Tables –––––


# Genres & Acapellas Relationship
genres = db.Table('genres',
  db.Column('genre_id', db.Integer, db.ForeignKey('genre.id'), primary_key=True),
  db.Column('acapella_id', db.Integer, db.ForeignKey('acapella.id'), primary_key=True)
)


# ––––– Individual Models –––––


# Acapellas Model
class Acapella(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  uri = db.Column(db.String(50), unique=True, nullable=False)
  title = db.Column(db.String(100), nullable=False)
  artist = db.Column(db.String(100), nullable=False)
  key = db.Column(db.String(5), nullable=False)
  decade = db.Column(db.Integer, nullable=False)
  bpm = db.Column(db.Integer, nullable=False)
  genres = db.relationship('Genre', secondary=genres, lazy='subquery', backref=db.backref('genres', lazy=True))
  popularity = db.Column(db.Integer, nullable=False)
  mode = db.Column(db.Integer, nullable=False)
  adj_key = db.Column(db.Integer, nullable=False)
  danceability = db.Column(db.Float, nullable=False)
  energy = db.Column(db.Float, nullable=False)
  valence = db.Column(db.Float, nullable=False)

  def serialize(self):
    return {
      'uri': self.uri,
      'name': self.name,
      'artist': self.artist,
      'key': self.key,
      'decade': self.decade,
      'bpm': self.bpm,
      'genre': self.genre,
      'popularity': self.popularity,
      'mode': self.mode,
      'danceability': self.danceability,
      'energy': self.energy,
      'valence': self.valence
    }

# Genres Model
class Genre(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(25), nullable = False)

  def serialize(self):
    return {
      'name': self.name
    }

class Mashup(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  user_uri = db.Column(db.String(50), nullable=False)
  instr_uri = db.Column(db.String(50), nullable=False)
  instr_song_name = db.Column(db.String(100), nullable=False)
  instr_artist_name = db.Column(db.String(200), nullable=False)
  instr_image = db.Column(db.String(100), nullable=False)
  instr_link = db.Column(db.String(100), nullable=False)
  acap_uri = db.Column(db.String(50), nullable=False)
  acap_song_name = db.Column(db.String(100), nullable=False)
  acap_artist_name = db.Column(db.String(200), nullable=False)
  acap_image = db.Column(db.String(100), nullable=False)
  acap_link = db.Column(db.String(100), nullable=False)

  def serialize(self):
    return {
      'acap_uri': self.acap_uri,
      'acap_song_name': self.acap_song_name,
      'acap_artist_name': self.acap_artist_name,
      'acap_image': self.acap_image,
      'acap_link': self.acap_link,
      'instr_uri': self.instr_uri,
      'instr_song_name': self.instr_song_name,
      'instr_artist_name': self.instr_artist_name,
      'instr_image': self.instr_image,
      'instr_link': self.instr_link
    }