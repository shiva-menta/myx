// Imports
import React from 'react';
import { FaSpotify } from 'react-icons/fa';
import Header from '../components/Header';
import { authenticateUser } from '../api/spotifyApiCalls';

// Main Component
function LoginPage() {
  // Render Function
  return (
    <div className="login-page">
      <Header clickable={false} />
      <div className="page-title">[myx login]</div>
      <div className="section-text">
        Welcome to
        <b> Myx V2: Mix Path</b>
        !
        In Mix Path, easily find how to cleanly mix from one song to the next in your playlist.
        Just choose a playlist, a starting and ending song, and the algorithm will
        find the shortest mixing path with general key shift / bpm tips.
      </div>
      <br />
      <div className="section-text">
        In Acapella Match, quickly find the best-fitting acapella for your instrumental track.
      </div>
      <button className="spotify-auth-button" onClick={authenticateUser}>
        <div className="spotify-button-text">Spotify Log-In</div>
        <FaSpotify className="spotify-icon" />
      </button>
    </div>
  );
}

export default LoginPage;
