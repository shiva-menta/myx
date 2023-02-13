import React from 'react';
import Card from 'react-bootstrap/Card';

function Mashup(props) {
    const songName1 = props.songName1;
    const artistName1 = props.artistName1;
    const link1 = props.link1;
    const img1 = props.img1;

    const songName2 = props.songName2;
    const artistName2 = props.artistName2;
    const link2 = props.link2;
    const img2 = props.img2;

    function cutString(string, maxLength) {
        if (string.length > maxLength) {
            return string.substring(0, maxLength) + '...';
        }
        return string;
    }

    return (
        <Card className="mashup-unit">
            <div className = "artist-info">
                <div className="song-title">{cutString(songName1, 30)}</div>
                <div className="artist-title">{cutString(artistName1, 25)}</div>
            </div>
            <div className = "artist-info">
                <div className="song-title">{cutString(songName2, 30)}</div>
                <div className="artist-title">{cutString(artistName2, 25)}</div>
            </div>
        </Card>
    );
}

export default Mashup;