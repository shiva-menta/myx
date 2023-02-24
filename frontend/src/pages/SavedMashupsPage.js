import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js'
import 'bootstrap/dist/css/bootstrap.css';
import '../components/component.css'
import Mashup from '../components/Mashup.js'
import ScaleLoader from "react-spinners/ScaleLoader";

import { FaSpotify, FaPlus, FaCheck } from 'react-icons/fa';
import { CgPlayListRemove } from 'react-icons/cg';

function SavedMashupsPage() {
    const api_url = 'http://127.0.0.1:5000/mashups';
    const api_spot_url = 'http://127.0.0.1:5000/add-spotify-mashup';

    const [mashups, setMashups] = useState([]);
    const [addMarkers, setAddMarkers] = useState([]);
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
        var markersArray = [];

        for (const mashup in mashupObjects) {
            const mashupData = mashupObjects[mashup];

            res.push({
                acapSongName: mashupData.acap_song_name,
                acapArtistNames: mashupData.acap_artist_name,
                acapImage: mashupData.acap_image,
                acapLink: mashupData.acap_link,
                acapUri: mashupData.acap_uri,

                instrSongName: mashupData.instr_song_name,
                instrArtistNames: mashupData.instr_artist_name,
                instrImage: mashupData.instr_image,
                instrLink: mashupData.instr_link,
                instrUri: mashupData.instr_uri
            })
            markersArray.push(false);
        }
        
        setMashups(res);
        setAddMarkers(markersArray);
    }

    function addMashupToSpotify(idx) {
        var mashup = mashups[idx];
        var mashupData = {
            acap_uri: mashup.acapUri,
            acap_name: mashup.acapSongName,
            instr_uri: mashup.instrUri,
            instr_name: mashup.instrSongName
        }
        // console.log(mashupData);
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
            // console.log(data);
            setAddMarkers(prevMarkers => {
                var newMarkers = [...prevMarkers];
                newMarkers[idx] = true;
                return newMarkers;
            })
        })
    }

    function removeMashup(idx) {
        var mashup = mashups[idx];
        var mashupData = {
            acap_uri: mashup.acapUri,
            instr_uri: mashup.instrUri
        }
        // console.log(mashupData);
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
            // console.log(data);
            setMashups(prevMashups => prevMashups.filter((_, i) => i !== idx));
            setAddMarkers(prevMarkers => prevMarkers.filter((_, i) => i !== idx));
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
                {mashups.length === 0 ? 
                <div className="no-mashups-found-container">
                    <div className="section-text">No mashups found! Add some through <b>acapella match</b>.</div>
                </div>
                    :
                mashups.map((mashup, index) => (
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
                            <button className="mashup-action-button" onClick={() => {if (!addMarkers[index]) {addMashupToSpotify(index)}}}>
                                <FaSpotify className="add-mashup-spotify-icon" size={20}/>
                                {addMarkers[index] ? <FaCheck className="add-mashup-spotify-icon" size={10}/> : <FaPlus className="add-mashup-spotify-icon" size={10}/>}
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