import React from 'react';
import Card from 'react-bootstrap/Card';

function Song(props) {
    const songName = props.songName;
    const artistName = props.artistName;
    const link = props.link;
    const img = props.img;

    function cutString(string, maxLength) {
        if (string.length > maxLength) {
            return string.substring(0, maxLength) + '...';
        }
        return string;
    }

    return (
        <a href={link} target="_blank" rel="noopener noreferrer">
            <Card className="song-unit">
                <div className = "artist-info">
                    <div className="song-title">{cutString(songName, 30)}</div>
                    <div className="artist-title">{cutString(artistName, 25)}</div>
                </div>
                <div className = "song-image-container">
                    <Card.Img src={img === 'none' ? require(`../images/${img}.png`) : img}></Card.Img>
                </div>
            </Card>
        </a>
    );
}

export default Song;