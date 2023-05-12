import React, { useState, useEffect } from 'react';
import '../App.css';
import Header from '../components/Header.js'

import { getAccessToken, getAcapellaDataFromURI } from '../api/spotifyApiCalls';
import { extractSongData } from '../helpers';

import DisplayMatchResults from '../components/DisplayMatchResults';
import SelectAcapellaContainer from '../components/SelectAcapellaContainer';

function AcapellaMatchPage() {
  const [accessToken, setAccessToken] = useState('');
  const [selectedSong, setSelectedSong] = useState({});
  const [resetFlag, setResetFlag] = useState(false);
  const [acapellas, setAcapellas] = useState([]);
  const [selectedAcapella, setSelectedAcapella] = useState({});
  
  const [acapellasLoaded, setAcapellasLoaded] = useState(false);

  useEffect(() => {
    getAccessToken()
      .then(data => setAccessToken(data.access_token))
  }, []);
  useEffect(() => {
    if (acapellas.length > 0 && Object.keys(selectedAcapella).length > 0) {
      setAcapellasLoaded(true);
    }
  }, [acapellas, selectedAcapella]);
  // Update Selected Song useEffect
  const resetData = () => {
    console.log("hello")
    setSelectedSong({});
    setSelectedAcapella({});    
    setAcapellas([]);
    setResetFlag(!resetFlag);
    setAcapellasLoaded(false);
  }

  async function updateAllAcapellaData(acapellaURIs) {
    var res = [];

    for (const data of acapellaURIs) {
      const songData = await getAcapellaDataFromURI(data[0], accessToken);
      const songInfo = extractSongData(songData);
      res.push({
          artists: songInfo.artists,
          name: songInfo.name,
          link: songInfo.link,
          image: songInfo.image,
          uri: data[0],
          key_shift: data[1],
          bpm_shift: data[2]
      });
    }

    setAcapellas(res);
    setSelectedAcapella(res[0]);
  }

  // Add Mashup
  return (
    <div className="view-container">
      <Header/>
      {!acapellasLoaded || acapellas.length === 0 || Object.keys(selectedAcapella).length === 0 ?
        <SelectAcapellaContainer
          updateAcapellaState={updateAllAcapellaData}
          setSong={setSelectedSong}
          selectedSong={selectedSong}
          accessToken={accessToken}
          resetFlag={resetFlag}
        />
      :
        <DisplayMatchResults
          selectedSong={selectedSong}
          resetFlag={resetFlag}
          acapellas={acapellas}
          selectedAcapella={selectedAcapella}
          setSelectedAcapella={setSelectedAcapella}
          reset={resetData}
        />
      }
    </div>
  );
}

export default AcapellaMatchPage;