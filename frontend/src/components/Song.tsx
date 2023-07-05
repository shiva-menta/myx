// Imports
import React from 'react';
import Card from 'react-bootstrap/Card';
import { FaSpotify } from 'react-icons/fa';
import { cutString } from '../utils/helpers';

// Props Type
type SongProps = {
  songName: string;
  artistName: string;
  link: string;
  img: string;
};

// Main Component
function Song({
  songName,
  artistName,
  link,
  img,
}: SongProps) {
  // Render Function
  const songComponent = (
    <Card className="song-unit">
      <div className="artist-info">
        <div className="spotify-direct">
          <FaSpotify className="spotify-song-icon" />
          {img !== 'none' && <div>PLAY ON SPOTIFY</div>}
        </div>
        <div className="song-title">{cutString(songName, 23)}</div>
        <div className="artist-title">{cutString(artistName, 30)}</div>
      </div>
      <div className="song-image-container">
        <Card.Img src={img === 'none' ? require(`../images/${img}.png`) : img} />
      </div>
    </Card>
  );

  if (img === 'none') {
    return (
      songComponent
    );
  } else {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {songComponent}
      </a>
    );
  }
}

export default Song;
