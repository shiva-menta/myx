import React, { useState, useEffect } from 'react';
import { FaSpotify } from 'react-icons/fa';
import Header from '../components/Header.js'
import ApiInfo from '../config.json';

// Spotify ID Imports
const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

function LoginPage() {

    // Handle Login
    const handleLogin = () => {
        const clientId = CLIENT_ID;
        const redirectUri = "http://localhost:3000/match";
        const scopes = "app-remote-control user-read-private user-read-email";
        
        const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
        
        window.location.assign(authorizationUrl);
    }

    // Render Function
    return (
        <div className='login-page'>
            <Header/>
            <div className="page-title">[myx login]</div>
            <div className="section-text">Welcome to <b>Myx V1: Acapella Match</b>! Pick an instrumental song, and we'll pair a funky acapella with it. Login with Spotify for access and saving.</div>
            <button className="spotify-auth-button" onClick={() => {handleLogin()}}>
                <div className="spotify-button-text">Spotify OAuth</div>
                <FaSpotify className="spotify-icon"/>
            </button>
        </div>
    );
}

export default LoginPage;