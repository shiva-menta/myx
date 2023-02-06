import React from 'react';
import Card from 'react-bootstrap/Card';

function Song(props) {
    const songName = props.songName;
    const artistName = props.artistName;
    const link = props.link;
    const img = props.img;

    return (
        <a href={link} target="_blank" rel="noopener noreferrer">
            <Card className="song-unit">
                <div className = "artist-info">
                    <div className="song-title">{songName}</div>
                    <div className="artist-title">{artistName}</div>
                </div>
                <div className = "song-image-container">
                    <Card.Img src={img === 'none' ? require(`../images/${img}.png`) : img}></Card.Img>
                </div>
            </Card>
        </a>
    );
}

export default Song;