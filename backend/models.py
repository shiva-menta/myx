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
    decade = db.Column(db.String(5), nullable=False)
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