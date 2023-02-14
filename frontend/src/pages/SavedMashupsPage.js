import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js'
import 'bootstrap/dist/css/bootstrap.css';
import '../components/component.css'
import ApiInfo from '../config.json'
import Mashup from '../components/Mashup.js'

// Spotify ID Imports
const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

function SavedMashupsPage() {
    const api_url = 'http://127.0.0.1:5000/mashups';
    const base_url = 'https://api.spotify.com/v1/'

    const [mashups, setMashups] = useState([]);
    const [accessToken, setAccessToken] = useState('');

    const addMashup = (mashup) => {
        setMashups(prevMashups => [...prevMashups, mashup]);
    }

    // useEffects
    // Spotify useEffect
    useEffect(() => {
        var authParameters = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        }
    
        fetch('https://accounts.spotify.com/api/token', authParameters) 
          .then(result => result.json())
          .then(data => setAccessToken(data.access_token))
      }, []);

    // useEffect to Load Saved Mashups
    useEffect(() => {
        var mashups = fetch(api_url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(mashup => {
              
            })
        })
    }, []);

    // getRelevant Mashup Data from URIs
    async function getTrackDataFromURI(trackUri) {
        var trackId = trackUri.split(":")[2]
        var searchParameters = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
          }
        }
    
        const response = await fetch(base_url + 'tracks/' + trackId, searchParameters)
        const data = await response.json();
    
        return data;
      }
    
    // Render Function
    return (
        <div className='saved-mashups-page'>
            <Header/>
            <div className="page-title">[saved mashups]</div>
            <div className="mashups-container">
                {mashups.map((mashup, index) => 
                    <Mashup key={index}
                        songName1={mashup.songName1}
                        artistName1={mashup.artistName1}
                        img1={mashup.img1}
                        link1={mashup.link1}

                        songName2={mashup.songName2}
                        artistName2={mashup.artistName2}
                        img2={mashup.img2}
                        link2={mashup.link2}
                    />
                )}
            </div>
        </div>
    )
}

export default SavedMashupsPage;