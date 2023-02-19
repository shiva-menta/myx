import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js'
import 'bootstrap/dist/css/bootstrap.css';
import '../components/component.css'
import ApiInfo from '../config.json'
import Mashup from '../components/Mashup.js'
import ScaleLoader from "react-spinners/ScaleLoader";

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
    const [loading, setLoading] = useState(true);

    // useEffects
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
            updateMashups(data);
            setLoading(false);
        })
    }, []);

    useEffect(() => {
        var div = document.getElementById('mashups-container');
        if (div != null) {
            var height = div.clientHeight;
            var scrollHeight = div.scrollHeight;

            if (scrollHeight > height) {
                div.style.overflowY = 'scroll';
            } else {
                div.style.overflowY = 'hidden';
            }
        }
    }, [mashups]);

    // map mashups to Mashup Components
    async function updateMashups(mashupObjects) {
        var res = [];

        for (const mashup in mashupObjects) {
            const mashupData = mashupObjects[mashup];
            const acapData = mashupData.acap_data
            const instrData = mashupData.instr_data

            res.push({
                acapSongName: acapData.name,
                acapArtistNames: acapData.artists.join(', '),
                acapImage: acapData.image,
                acapLink: acapData.link,
                acapUri: acapData.uri,

                instrSongName: instrData.name,
                instrArtistNames: instrData.artists.join(', '),
                instrImage: instrData.image,
                instrLink: instrData.link,
                instrUri: instrData.uri
            })
        }
        
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
            {loading ? 
            <div className="loader-container">
                <ScaleLoader color={'#ffffff'} loading={loading} size={150}/>
            </div>
                :
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
            </div>}  
        </div>
    )
}

export default SavedMashupsPage;