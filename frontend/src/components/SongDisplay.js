import React from 'react';
import Song from './Song.js'

function SongDisplay(props) {
    const songName = props.songName;
    const artistName = props.artistName;
    const link = props.link;
    const img = props.img;

    return (
        <div className="song-display">
            <div className="section-title">choose instrumental...</div>
            <Song songName={songName} artistName={artistName} img={img} link={link}/>
        </div>
    );
}

export default SongDisplay;