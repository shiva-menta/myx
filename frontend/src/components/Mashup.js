import React from 'react';
import Card from 'react-bootstrap/Card';

function Mashup(props) {
    const acapSongName = props.acapSongName;
    const acapArtistNames = props.acapArtistNames;
    const acapLink = props.acapLink;
    const acapImage = props.acapImage;

    const instrSongName = props.instrSongName;
    const instrArtistNames = props.instrArtistNames;
    const instrLink = props.instrLink;
    const instrImage = props.instrImage;

    // Render Function
    return (
        <Card className="mashup-unit">
            <div className="song-info">
                <div className="song-title">{acapSongName + " –" + '\u00a0'}</div>
                <div className="artist-title">{acapArtistNames}</div>
            </div>
            <hr/>
            <div className="song-info">
                <div className="song-title">{instrSongName + " –" + '\u00a0'}</div>
                <div className="artist-title">{instrArtistNames}</div>
            </div>
        </Card>
    );
}

export default Mashup;