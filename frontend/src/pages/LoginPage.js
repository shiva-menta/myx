import React from 'react';
import { FaSpotify } from 'react-icons/fa';
import Header from '../components/Header.js';
import { authenticateUser } from '../api/spotifyApiCalls.js';

function LoginPage() {
    // Render Function
    return (
        <div className='login-page'>
            <Header/>
            <div className="page-title">[myx login]</div>
            <div className="section-text">Welcome to <b>Myx V1: Acapella Match</b>! Pick an instrumental song, and we'll pair a funky acapella with it. Login with Spotify for access and saving mashups.</div>
            <br></br>
            <div className="section-text"><b>Myx V2: Shortest Mix Path</b> will use graph algorithms to find the shortest path between two songs in a playlist. This will come in the next few weeks!</div>
            <button className="spotify-auth-button" onClick={authenticateUser}>
                <div className="spotify-button-text">Spotify Log-In</div>
                <FaSpotify className="spotify-icon"/>
            </button>
        </div>
    );
}

export default LoginPage;