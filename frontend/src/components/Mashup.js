import React from 'react';
import Card from 'react-bootstrap/Card';

function Mashup({ songData }) {
    const acapSongName = songData.acap_song_name;
    const acapArtistNames = songData.acap_artist_name;
    const instrSongName = songData.instr_song_name;
    const instrArtistNames = songData.instr_artist_name;

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