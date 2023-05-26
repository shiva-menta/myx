// Imports
import React from 'react';
import Card from 'react-bootstrap/Card';
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
  if (img === 'none') {
    return (
      <Card className="song-unit">
        <div className="artist-info">
          <div className="song-title">{cutString(songName, 30)}</div>
          <div className="artist-title">{cutString(artistName, 25)}</div>
        </div>
        <div className="song-image-container">
          <Card.Img src={img === 'none' ? require(`../images/${img}.png`) : img} />
        </div>
      </Card>
    );
  } else {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        <Card className="song-unit">
          <div className="artist-info">
            <div className="song-title">{cutString(songName, 30)}</div>
            <div className="artist-title">{cutString(artistName, 25)}</div>
          </div>
          <div className="song-image-container">
            <Card.Img src={img === 'none' ? require(`../images/${img}.png`) : img} />
          </div>
        </Card>
      </a>
    );
  }
}

export default Song;
