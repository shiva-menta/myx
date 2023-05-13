// Imports
import React, { useState, useEffect } from 'react';
import '../App.css';
import { SongResultData, AcapellaData, AcapellaURI } from '../utils/types';

import Header from '../components/Header';
import DisplayMatchResults from '../components/DisplayMatchResults';
import SelectAcapellaContainer from '../components/SelectAcapellaContainer';

import { getAccessToken, getAcapellaDataFromURI } from '../api/spotifyApiCalls';
import { extractSongData } from '../utils/helpers';

// State Defaults
const noSong = {
  artists: [],
  name: '',
  link: '',
  image: '',
  uri: '',
  instrumentalness: 0
};
const noAcapella = {
  artists: [],
  name: '',
  link: '',
  image: '',
  uri: '',
  key_shift: '',
  bpm_shift: 0
};

// Main Component
function AcapellaMatchPage() {
  // State Hooks
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<SongResultData>(noSong);
  const [resetFlag, setResetFlag] = useState<boolean>(false);
  const [acapellas, setAcapellas] = useState<AcapellaData[]>([]);
  const [selectedAcapella, setSelectedAcapella] = useState<AcapellaData>(noAcapella);
  const [acapellasLoaded, setAcapellasLoaded] = useState<boolean>(false);

  // Effect Hooks
  useEffect(() => {
    getAccessToken()
      .then(data => setAccessToken(data.access_token))
  }, []);
  useEffect(() => {
    if (acapellas.length > 0 && selectedAcapella.uri.length > 0) {
      setAcapellasLoaded(true);
    }
  }, [acapellas, selectedAcapella]);

  // Functions
  const updateAllAcapellaData = async (acapellaURIs: AcapellaURI[]) => {
    var res: AcapellaData[] = [];

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
  };
  const resetData = () => {
    setSelectedSong(noSong);
    setSelectedAcapella(noAcapella);    
    setAcapellas([]);
    setResetFlag(!resetFlag);
    setAcapellasLoaded(false);
  }
  
  // Render Function
  return (
    <div className="view-container">
      <Header/>
      {!acapellasLoaded || acapellas.length === 0 || selectedAcapella.uri.length === 0 ?
        (<SelectAcapellaContainer
          updateAcapellaState={updateAllAcapellaData}
          setSong={setSelectedSong}
          selectedSong={selectedSong}
          accessToken={accessToken}
          resetFlag={resetFlag}
        />)
      :
        (<DisplayMatchResults
          selectedSong={selectedSong}
          resetFlag={resetFlag}
          acapellas={acapellas}
          selectedAcapella={selectedAcapella}
          setSelectedAcapella={setSelectedAcapella}
          reset={resetData}
        />)
      }
    </div>
  );
};

export default AcapellaMatchPage;