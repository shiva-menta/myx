// Imports
import React, { useState, useEffect } from 'react';
import '../App.css';
import { SongResultData, AcapellaData, AcapellaURI } from '../utils/types';

import Header from '../components/Header';
import DisplayMatchResults from '../components/DisplayMatchResults';
import SelectAcapellaContainer from '../components/SelectAcapellaContainer';

import { getAccessToken, getMultipleTracksFromURIs } from '../api/spotifyApiCalls';
import { extractSongData } from '../utils/helpers';

// State Defaults
const noSong = {
  artists: [],
  name: '',
  link: '',
  image: '',
  uri: '',
  instrumentalness: 0,
  energy: 0,
};
const noAcapella = {
  artists: [],
  name: '',
  link: '',
  image: '',
  uri: '',
  key_shift: '',
  bpm_shift: 0,
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
      .then((data) => setAccessToken(data.access_token));
  }, []);
  useEffect(() => {
    if (acapellas.length > 0 && selectedAcapella.uri.length > 0) {
      setAcapellasLoaded(true);
    }
  }, [acapellas, selectedAcapella]);

  // Functions
  const updateAllAcapellaData = async (acapellaURIs: AcapellaURI[]) => {
    const res: AcapellaData[] = [];
    const trackUris = acapellaURIs.map((data) => (data[0].split(':')[2]));

    getMultipleTracksFromURIs(trackUris, accessToken)
      .then((data) => {
        const allTrackInfo = data.tracks;
        for (let i = 0; i < allTrackInfo.length; i += 1) {
          const trackInfo = extractSongData(allTrackInfo[i]);
          const acapellaData = acapellaURIs[i];
          res.push({
            artists: trackInfo.artists,
            name: trackInfo.name,
            link: trackInfo.link,
            image: trackInfo.image,
            uri: acapellaData[0],
            key_shift: acapellaData[1],
            bpm_shift: acapellaData[2],
          });
        }

        setAcapellas(res);
        setSelectedAcapella(res[0]);
      });
  };

  const resetData = () => {
    setSelectedSong(noSong);
    setSelectedAcapella(noAcapella);
    setAcapellas([]);
    setResetFlag(!resetFlag);
    setAcapellasLoaded(false);
  };

  // Render Function
  return (
    <div className="view-container">
      <Header clickable />
      {!acapellasLoaded || acapellas.length === 0 || selectedAcapella.uri.length === 0
        ? (
          <SelectAcapellaContainer
            updateAcapellaState={updateAllAcapellaData}
            setSong={setSelectedSong}
            selectedSong={selectedSong}
            accessToken={accessToken}
            resetFlag={resetFlag}
          />
        )
        : (
          <DisplayMatchResults
            selectedSong={selectedSong}
            resetFlag={resetFlag}
            acapellas={acapellas}
            selectedAcapella={selectedAcapella}
            setSelectedAcapella={setSelectedAcapella}
            reset={resetData}
          />
        )}
    </div>
  );
}

export default AcapellaMatchPage;
