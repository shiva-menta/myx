import React from 'react';
import Card from 'react-bootstrap/Card';

function Song(props) {
    const songName = props.songName;
    const artistName = props.artistName;
    const img = props.img;

    return (
        <Card className="song-unit">
            <div className = "artist-info">
                <div className="song-title">{songName}</div>
                <div className="artist-title">{artistName}</div>
            </div>
            <div className = "song-image-container">
                <Card.Img src={require(`../images/${img}.png`)}></Card.Img>
            </div>
        </Card>
    );
}

export default Song;