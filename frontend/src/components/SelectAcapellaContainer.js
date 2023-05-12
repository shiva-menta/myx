import { useState, useEffect } from 'react';
import Song from '../components/Song.js';
import FeatureDropdowns from '../components/FeatureDropdowns';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import { AiOutlineSearch } from 'react-icons/ai';

import { searchSongs, getTrackFeaturesFromURIs } from '../api/spotifyApiCalls';
import { extractSongListData } from '../helpers';
import { getMatchingAcapellas } from '../api/backendApiCalls';

function SelectAcapellaContainer({ updateAcapellaState, setSong, selectedSong, accessToken, resetFlag }) {
  const [searchState, setSearchState] = useState('');
  const [songResults, setSongResults] = useState([]);
  const [searchWarning, setSearchWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Select all parameters.');
  const [dropdownWarning, setDropdownWarning] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);

  // Search
  useEffect(() => {
    updateSelectedSong(0);
  }, [songResults]);
  useEffect(() => {
    setSearchState("");
    setSongResults([]);
    setDropdownData([]);
    setSearchWarning(false);
    setDropdownWarning(false);
  }, [resetFlag]);

  const updateDropdownData = (data) => {
    setDropdownData(data);
  }

  // Functions
  function updateSelectedSong(idx) {
    setSong(songResults[idx]);
    if (songResults.length > 0) {
      if (songResults[idx].instrumentalness < 0.3) {
        setSearchWarning(true);
      } else {
        setSearchWarning(false);
      }
    }
  }

  function getAcapellas() {
    if (isSongSelected() && dropdownData.every(item => item !== "")) {
      getMatchingAcapellas(selectedSong.uri, dropdownData[3], dropdownData[0], dropdownData[1], dropdownData[2])
        .then(data => {
          updateAcapellaState(data)
        })
        .catch(() => {
          setDropdownWarning(true);
          setErrorMessage("No results found. Please try again.");
        })
    } else {
      setDropdownWarning(true);
      setErrorMessage("Select all parameters.");
    }
  }

  

  function isSongSelected() {
    return selectedSong != undefined && Object.keys(selectedSong).length != 0;
  }

  async function search() {
    if (searchState.length > 0) {
      searchSongs(searchState, accessToken)
        .then(async data => {
          let extractedSongListData = extractSongListData(data.tracks.items);
          let trackURIs = extractedSongListData.map(track => track.uri.split(":")[2]);
          
          getTrackFeaturesFromURIs(trackURIs, accessToken)
            .then(data => {
              let instrumentalValues = data.audio_features.map(feature => feature === null ? 1 : feature.instrumentalness);
              extractedSongListData.forEach((track, index) => {
                track.instrumentalness = instrumentalValues[index];
              });
              setSongResults(extractedSongListData);
            })
        })
    }
  }
  
  // Render Function
  return (
    <div className="select-page-container">
      <div className="page-title">[acapella match]</div>
      <div className="song-select-container">
        <div className="section-title">1. choose instrumental...</div>
        <div className="song-select">
          <div className="song-search-bar">
            <button className="search-button" onClick={() => {search()}}>
              <AiOutlineSearch/>
            </button>
            <input id="team-search" type="test" className="song-search-input" placeholder="Search by title" 
              onChange={(evt) => {setSearchState(evt.target.value)}}
              onKeyDown={(evt) => {if (evt.key === 'Enter') {search()}}}
            />
          </div>
          <DropdownButton id='dropdown-button' title="">
            {isSongSelected() && songResults.map((song, idx) => (
                <Dropdown.Item onClick={() => {updateSelectedSong(idx)}} key={idx}>{song.name + ' - ' + song.artists.join(', ')}</Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
        {!isSongSelected() ?
            <Song songName="N/A" artistName="N/A" img="none" link=""/>
        :
            <Song songName={selectedSong.name} artistName={selectedSong.artists.join(', ')} link={selectedSong.link} img={selectedSong.image}/>
        }
        {searchWarning && <div className="warning">Your track has vocals which could clash with the acapella.</div>}
      </div>
      <div className='feature-select-container'>
        <FeatureDropdowns callback={updateDropdownData}/>
        {dropdownWarning && <div className="warning">{errorMessage}</div>}
      </div>
      <div className="match">
        <div className="section-title">3. match...</div>
        <button className="action-button" onClick={() => {getAcapellas()}}>match</button>
      </div>
  </div>
  );
}

export default SelectAcapellaContainer;