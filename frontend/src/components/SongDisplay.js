import React from 'react';
import Song from './Song.js'

function SongDisplay() {
    return (
        <div className="song-display">
            <div className="section-title">choose instrumental...</div>
            <Song songName="Chopper" artistName="Mo Falk" img="chopper" link="https://open.spotify.com/album/7Iw2wdmbXeA28ZQ1Mo0RlM"/>
            {/* <Song songName="Break My Heart" artistName="Dua Lipa" img="break_my_heart"/> */}
        </div>
    );
}

export default SongDisplay;