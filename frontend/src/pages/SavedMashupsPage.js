import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js';
import Mashup from '../components/Mashup.js';
import ScaleLoader from "react-spinners/ScaleLoader";
import { FaSpotify, FaPlus, FaCheck } from 'react-icons/fa';
import { CgPlayListRemove } from 'react-icons/cg';
import { getMashups, addMashupToSpotify, removeSavedMashup } from '../api/backendApiCalls.js';

function SavedMashupsPage() {
    const [mashups, setMashups] = useState([]);
    const [addMarkers, setAddMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffects
    // useEffect to Load Saved Mashups
    useEffect(() => {
        getMashups()
            .then(data => {
                updateMashups(data);
                setLoading(false);
            })
    }, []);

    // Adjust Mashups Container for Scroll
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

            res.push(mashupData)
            markersArray.push(false);
        }
        
        setMashups(res);
        setAddMarkers(markersArray);
    };

    function addToSpotify(idx) {
        var mashup = mashups[idx];
        var mashupData = {
            acap_uri: mashup.acap_uri,
            acap_name: mashup.acap_song_name,
            instr_uri: mashup.instr_uri,
            instr_name: mashup.instr_song_name
        }
        addMashupToSpotify(mashupData)
            .then(
                setAddMarkers(prevMarkers => {
                    var newMarkers = [...prevMarkers];
                    newMarkers[idx] = true;
                    return newMarkers;
                })
            )
    }

    function removeMashup(idx) {
        var mashup = mashups[idx];
        var mashupData = {
            acap_uri: mashup.acap_uri,
            instr_uri: mashup.instr_uri
        }

        removeSavedMashup(mashupData)
            .then(() => {
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
                        <Mashup songData={mashup} />
                        <div className="mashup-action-button-container">
                            <button className="mashup-action-button" onClick={() => {if (!addMarkers[index]) {addToSpotify(index)}}}>
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