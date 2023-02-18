import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js'
import 'bootstrap/dist/css/bootstrap.css';
import '../components/component.css'
import ApiInfo from '../config.json'
import Mashup from '../components/Mashup.js'

import { FaSpotify, FaPlus } from 'react-icons/fa';
import { CgPlayListRemove } from 'react-icons/cg';

// Spotify ID Imports
const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

function SavedMashupsPage() {
    const api_url = 'http://127.0.0.1:5000/mashups';
    const api_spot_url = 'http://127.0.0.1:5000/add-spotify-mashup';
    const base_url = 'https://api.spotify.com/v1/'

    const [mashups, setMashups] = useState([]);
    const [accessToken, setAccessToken] = useState('');

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
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            toMashupComponents(data);
            console.log(data);
        })
    }, []);

    useEffect(() => {
        var div = document.getElementById('mashups-container');
        var height = div.clientHeight;
        var scrollHeight = div.scrollHeight;

        if (scrollHeight > height) {
            div.style.overflowY = 'scroll';
        } else {
            div.style.overflowY = 'hidden';
        }
    }, [mashups]);

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
        console.log(response)
        
        return data;
    }

    function extractSongData(data) {
        return {
            artists: data.artists.map(artist => artist.name),
            name: data.name,
            link: data.external_urls.spotify,
            image: data.album.images[1].url,
            uri: data.uri
        }
    }

    // map mashups to Mashup Components
    async function toMashupComponents(mashupObjects) {
        var res = [];

        for (const mashup in mashupObjects) {
            const mashupData = mashupObjects[mashup];
            const acapData = await getTrackDataFromURI(mashupData.acap_uri);
            const acapInfo = extractSongData(acapData);
            const instrData = await getTrackDataFromURI(mashupData.instr_uri);
            const instrInfo = extractSongData(instrData);

            res.push({
                acapSongName: acapInfo.name,
                acapArtistNames: acapInfo.artists.join(', '),
                acapImage: acapInfo.image,
                acapLink: acapInfo.link,
                acapUri: acapInfo.uri,

                instrSongName: instrInfo.name,
                instrArtistNames: instrInfo.artists.join(', '),
                instrImage: instrInfo.image,
                instrLink: instrInfo.link,
                instrUri: instrInfo.uri
            })
        }
        
        console.log(res);
        setMashups(res);
    }

    function addMashupToSpotify(idx) {
        var mashup = mashups[idx];
        var mashupData = {
            acap_uri: mashup.acapUri,
            acap_name: mashup.acapSongName,
            instr_uri: mashup.instrUri,
            instr_name: mashup.instrSongName
        }
        console.log(mashupData);
        fetch(api_spot_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(mashupData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
    }

    function removeMashup(idx) {
        var mashup = mashups[idx];
        var mashupData = {
            acap_uri: mashup.acapUri,
            instr_uri: mashup.instrUri
        }
        console.log(mashupData);
        fetch(api_url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(mashupData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setMashups(prevMashups => prevMashups.filter((_, i) => i !== idx));
        })
    }
    
    // Render Function
    return (
        <div className='saved-mashups-page'>
            <Header/>
            <div className="page-title">[saved mashups]</div>
            <div className="mashups-container" id="mashups-container">
                {mashups.map((mashup, index) => (
                    <div key={index} className="mashup-add-container">
                        <Mashup
                            acapSongName={mashup.acapSongName}
                            acapArtistNames={mashup.acapArtistNames}
                            acapImage={mashup.acapImage}
                            acapLink={mashup.acapLink}

                            instrSongName={mashup.instrSongName}
                            instrArtistNames={mashup.instrArtistNames}
                            instrImage={mashup.instrImage}
                            instrLink={mashup.instrLink}
                        />
                        <div className="mashup-action-button-container">
                            <button className="mashup-action-button" onClick={() => {addMashupToSpotify(index)}}>
                                <FaSpotify className="add-mashup-spotify-icon" size={20}/>
                                <FaPlus className="add-mashup-spotify-icon" size={10}/>
                            </button>
                            <button className="mashup-action-button" onClick={() => {removeMashup(index)}}>
                                <CgPlayListRemove className="remove-mashup-spotify-icon" size={20}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SavedMashupsPage;