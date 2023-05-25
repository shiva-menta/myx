// Imports
import React, { useState, useEffect } from 'react';
import { FaSpotify, FaPlus, FaCheck } from 'react-icons/fa';
import { CgPlayListRemove } from 'react-icons/cg';
import ScaleLoader from 'react-spinners/ScaleLoader';

import Header from '../components/Header';
import Mashup from '../components/Mashup';
import { getMashups, addMashupToSpotify, removeSavedMashup } from '../api/backendApiCalls';
import { MashupData } from '../utils/types';

// Main Component
function SavedMashupsPage() {
  // State Hooks
  const [mashups, setMashups] = useState<MashupData[]>([]);
  const [addMarkers, setAddMarkers] = useState<boolean[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Effect Hooks
  const updateMashups = async (mashupObjects: MashupData[]) => {
    const res = [];
    const markersArray: boolean[] = [];

    for (const mashup in mashupObjects) {
      const mashupData = mashupObjects[mashup];
      res.push(mashupData);
      markersArray.push(false);
    }

    setMashups(res);
    setAddMarkers(markersArray);
  };
  useEffect(() => {
    getMashups()
      .then((data) => {
        updateMashups(data);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    const div = document.getElementById('mashups-container');
    if (div != null) {
      const { clientHeight: height, scrollHeight } = div;

      if (scrollHeight > height) {
        div.style.overflowY = 'scroll';
      } else {
        div.style.overflowY = 'hidden';
      }
    }
  }, [mashups]);

  // Functions
  const addToSpotify = (idx: number) => {
    const mashup = mashups[idx];
    const mashupData = {
      acap_uri: mashup.acap_uri,
      acap_name: mashup.acap_song_name,
      instr_uri: mashup.instr_uri,
      instr_name: mashup.instr_song_name,
    };
    addMashupToSpotify(mashupData)
      .then(() => {
        setAddMarkers((prevMarkers) => {
          const newMarkers = [...prevMarkers];
          newMarkers[idx] = true;
          return newMarkers;
        });
      });
  };
  const removeMashup = (idx: number) => {
    const mashup = mashups[idx];
    const mashupData = {
      acap_uri: mashup.acap_uri,
      instr_uri: mashup.instr_uri,
    };

    removeSavedMashup(mashupData)
      .then(() => {
        setMashups((prevMashups) => prevMashups.filter((_, i) => i !== idx));
        setAddMarkers((prevMarkers) => prevMarkers.filter((_, i) => i !== idx));
      });
  };

  // Render Function
  return (
    <div className="saved-mashups-page">
      <Header clickable />
      <div className="page-title">[saved mashups]</div>
      {loading
        ? (
          <div className="loader-container">
            <ScaleLoader color="#ffffff" loading={loading} height={50} width={5} />
          </div>
        ) : (
          <div className="mashups-container" id="mashups-container">
            {mashups.length === 0
              ? (
                <div className="no-mashups-found-container">
                  <div className="section-text">
                    No mashups found! Add some through
                    <b> acapella match</b>
                    .
                  </div>
                </div>
              ) : mashups.map((mashup, index) => (
                <div key={`${mashup.acap_artist_name} ${mashup.instr_artist_name}`} className="mashup-add-container">
                  <Mashup songData={mashup} />
                  <div className="mashup-action-button-container">
                    <button className="mashup-action-button" onClick={() => { if (!addMarkers[index]) { addToSpotify(index); } }}>
                      <FaSpotify className="add-mashup-spotify-icon" size={20} />
                      {addMarkers[index] ? <FaCheck className="add-mashup-spotify-icon" size={10} /> : <FaPlus className="add-mashup-spotify-icon" size={10} />}
                    </button>
                    <button className="mashup-action-button" onClick={() => { removeMashup(index); }}>
                      <CgPlayListRemove className="remove-mashup-spotify-icon" size={20} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
    </div>
  );
}

export default SavedMashupsPage;
