// Imports
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { AiOutlineSearch } from 'react-icons/ai';

import Song from './Song';
import FeatureDropdowns from './FeatureDropdowns';

import { searchSongs, getTrackFeaturesFromURIs } from '../api/spotifyApiCalls';
import { SongData, SongResultData, AcapellaURI } from '../utils/types';
import { extractSongListData } from '../utils/helpers';
import { getMatchingAcapellas } from '../api/backendApiCalls';

// Type Declarations
type SelectAcapellaContainerProps = {
  updateAcapellaState: (acapellaURIs: AcapellaURI[]) => void;
  setSong: (value: SongResultData) => void;
  selectedSong: SongResultData;
  accessToken: string;
  resetFlag: boolean;
};

// Main Component
function SelectAcapellaContainer({
  updateAcapellaState,
  setSong,
  selectedSong,
  accessToken,
  resetFlag,
}: SelectAcapellaContainerProps) {
  // State Hooks
  const [searchState, setSearchState] = useState<string>('');
  const [songResults, setSongResults] = useState<SongResultData[]>([]);
  const [searchWarning, setSearchWarning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('Select all parameters.');
  const [dropdownWarning, setDropdownWarning] = useState<boolean>(false);
  const [dropdownData, setDropdownData] = useState<string[]>([]);

  // Effect Hooks
  const updateSelectedSong = (idx: number) => {
    setSong(songResults[idx]);
    if (songResults.length > 0) {
      if (songResults[idx].instrumentalness < 0.3) {
        setSearchWarning(true);
      } else {
        setSearchWarning(false);
      }
    }
  };
  useEffect(() => {
    updateSelectedSong(0);
  }, [songResults]);
  useEffect(() => {
    setSearchState('');
    setSongResults([]);
    setDropdownData([]);
    setSearchWarning(false);
    setDropdownWarning(false);
  }, [resetFlag]);

  // Functions
  const isSongSelected = () => (
    selectedSong !== undefined && Object.keys(selectedSong).length !== 0
  );
  const getAcapellas = () => {
    if (isSongSelected() && dropdownData.every((item) => item !== '')) {
      getMatchingAcapellas(
        selectedSong.uri,
        dropdownData[3],
        dropdownData[0],
        dropdownData[1],
        dropdownData[2],
        selectedSong.energy,
      )
        .then((data) => {
          updateAcapellaState(data);
        })
        .catch(() => {
          setDropdownWarning(true);
          setErrorMessage('No results found. Please try again.');
        });
    } else {
      setDropdownWarning(true);
      setErrorMessage('Select all parameters.');
    }
  };
  const search = async () => {
    if (searchState.length > 0) {
      searchSongs(searchState, accessToken)
        .then(async (data) => {
          const extractedSongListData = extractSongListData(data.tracks.items);
          const trackURIs = extractedSongListData.map((track: SongData) => track.uri.split(':')[2]);

          getTrackFeaturesFromURIs(trackURIs, accessToken)
            .then((feature_data) => {
              const instrumentalValues = feature_data.audio_features.map(
                (feature: any) => (feature === null ? 1 : feature.instrumentalness),
              );
              const energyValues = feature_data.audio_features.map(
                (feature: any) => (feature === null ? 1 : feature.energy),
              );
              extractedSongListData.forEach((track: SongResultData, index: number) => {
                track.instrumentalness = instrumentalValues[index];
                track.energy = energyValues[index];
              });
              setSongResults(extractedSongListData);
            });
        });
    }
  };
  const updateDropdownData = (data: string[]) => {
    setDropdownData(data);
  };

  // Render Function
  return (
    <div className="select-page-container">
      <div className="page-title">[acapella match]</div>
      <div className="song-select-container">
        <div className="section-title">1. choose instrumental...</div>
        <div className="song-select">
          <div className="song-search-bar">
            <button className="search-button" onClick={() => { search(); }}>
              <AiOutlineSearch />
            </button>
            <input
              id="team-search"
              type="test"
              className="song-search-input"
              placeholder="Search by title"
              onChange={(evt) => { setSearchState(evt.target.value); }}
              onKeyDown={(evt) => { if (evt.key === 'Enter') { search(); } }}
            />
          </div>
          <DropdownButton id="dropdown-button" title="">
            {isSongSelected() && songResults.map((song, idx: number) => (
              <Dropdown.Item onClick={() => { updateSelectedSong(idx); }} key={song.name}>{`${song.name} - ${song.artists.join(', ')}`}</Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
        {!isSongSelected()
          ? <Song songName="N/A" artistName="N/A" img="none" link="" />
          : <Song songName={selectedSong.name} artistName={selectedSong.artists.join(', ')} link={selectedSong.link} img={selectedSong.image} />}
        {searchWarning && <div className="warning">Your track has vocals which could clash with the acapella.</div>}
      </div>
      <div className="feature-select-container">
        <FeatureDropdowns callback={updateDropdownData} />
        {dropdownWarning && <div className="warning">{errorMessage}</div>}
      </div>
      <div className="match">
        <div className="section-title">3. match...</div>
        <button className="action-button" onClick={() => { getAcapellas(); }}>match</button>
      </div>
    </div>
  );
}

export default SelectAcapellaContainer;
