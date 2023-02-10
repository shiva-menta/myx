import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.js'
import Song from './components/Song.js'
import FeatureDropdowns from './components/FeatureDropdowns';
import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css'

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { BsMusicNoteList } from 'react-icons/bs';
import { FaRecordVinyl } from 'react-icons/fa';
import { AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import ApiInfo from './config.json'

// Spotify ID Imports
const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

function App() {
  // useStates
  // Page State
  // const [radioValue, setRadioValue] = useState('match');
  const [isSelectPage, setIsSelectPage] = useState(true);
  
  // Search State
  const [searchState, setSearchState] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [songResults, setSongResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState({});
  const [dropdownData, setDropdownData] = useState([]);

  // Acapella State
  const [acapellas, setAcapellas] = useState([]);
  const [selectedAcapella, setSelectedAcapella] = useState({});
  
  const radios = [
    { icon: <BsMusicNoteList/>, value: 'list' },
    { icon: <FaRecordVinyl/>, value: 'match' }
  ];

  // Callback Function
  const updateDropdownData = (data) => {
    setDropdownData(data);
  }

  // Spotify URL Information
  const api_url = 'http://127.0.0.1:5000/get-acapellas?';
  const base_url = 'https://api.spotify.com/v1/'


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
  // Update Selected Song useEffect
  useEffect(() => {
    updateSelectedSong(0);
  }, [songResults]);


  // Functions
  function updateSelectedSong(idx) {
    setSelectedSong(songResults[idx]);
  }

  function updateSelectedAcapella(idx) {
    setSelectedAcapella(acapellas[idx]);
  }

  function isSongSelected() {
    return selectedSong != undefined && Object.keys(selectedSong).length != 0;
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

  function extractSongListData(songList) {
    return songList.map(data => extractSongData(data));
  }

  async function getAcapellaDataFromURI(trackUri) {
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

    return data;
  }

  async function updateAllAcapellaData(acapellaURIs) {
    var res = [];

    for (const data of acapellaURIs) {
      const songData = await getAcapellaDataFromURI(data[0]);
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
    setSelectedAcapella(res[0])
    setIsSelectPage(false);
  }

  // Search
  async function search() {
    console.log("Search for " + searchState);

    var searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    }

    var trackIDs = await fetch('https://api.spotify.com/v1/search?q=' + searchState + '&type=track&limit=10', searchParameters)
      .then(response => response.json())
      .then(data => {
        setSongResults(extractSongListData(data.tracks.items));
      })
  }

  // Request Match
  function getAcapellas() {
    if (isSongSelected() && dropdownData.every(item => item !== "")) {
      var acapellas = fetch(api_url + 'uri=' + selectedSong.uri + '&bpm=' + dropdownData[3] + '&genre=' + dropdownData[0] + '&decade=' + dropdownData[1] + '&key=' + dropdownData[2] + '&limit=10', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          updateAllAcapellaData(data)
        })
        .catch(error => console.error(error))
    } else {
      console.log("Incomplete request.")
    }
  }

  return (
    <div className="App">
      <div className="view-container">
        <Header/>
        {isSelectPage ?
          <div className="select-page-container">
            <div className="page-title">[acapella match]</div>
            <div className="song-select">
              <div className="section-title">1. choose instrumental...</div>
              <div className="song-select-container">
                <div className="song-search-container">
                  <button className="search-button" onClick={() => {search()}}>
                    <AiOutlineSearch/>	  
                  </button>
                  <input id="team-search" type="test" className="song-search-bar" placeholder="Search by title" onChange={(evt) => {setSearchState(evt.target.value)}}/>
                </div>
                <DropdownButton id='dropdown-button' title="">
                  {isSongSelected() && songResults.map((song, idx) => (
                    <Dropdown.Item onClick={() => {updateSelectedSong(idx)}}>{song.name + ' - ' + song.artists.join(', ')}</Dropdown.Item>
                  ))}
                </DropdownButton>
              </div>
              
              {!isSongSelected() ?
                <Song songName="N/A" artistName="N/A" img="none" link=""/>
              :
                <Song songName={selectedSong.name} artistName={selectedSong.artists.join(', ')} link={selectedSong.link} img={selectedSong.image}/>
              }
            </div>
            <FeatureDropdowns callback={updateDropdownData}/>
            <div className="match">
              <div className="section-title">3. match...</div>
              <button className="match-button" onClick={() => {getAcapellas()}}>match</button>
            </div>
          </div>
        :
          <div className="results-page-container">
            <div className="section-title">instrumental</div>
            <Song songName={selectedSong.name} artistName={selectedSong.artists.join(', ')} link={selectedSong.link} img={selectedSong.image}/>
            <div className="plus-container">
              <AiOutlinePlus color='white' size={40}/>
            </div>
            <div className="acapella-container">
              <div className="section-title">acapella</div>
              <DropdownButton id='dropdown-button' title="">
                {isSongSelected() && acapellas.map((song, idx) => (
                  <Dropdown.Item onClick={() => {updateSelectedAcapella(idx)}}>{song.name + ' - ' + song.artists.join(', ')}</Dropdown.Item>
                ))}
              </DropdownButton>
            </div>
            <Song songName={selectedAcapella.name} artistName={selectedAcapella.artists.join(', ')} link={selectedAcapella.link} img={selectedAcapella.image}/>
            <div className="mix-instructions-container">
              <div className="section-title">mix instructions:</div>
              <div className="section-text">{`change bpm ${Math.round(selectedAcapella.bpm_shift)} and key ${selectedAcapella.key_shift}`}</div>
            </div>
          </div>
        }
        {/* <ButtonGroup className="nav-button-group">
          {radios.map((radio, idx) => (
            <ToggleButton
              key = {idx}
              id={`radio${idx}`}
              type="radio"
              name="radio"
              value={radio.value}
              checked={radioValue === radio.value}
              onChange={(e) => setRadioValue(e.currentTarget.value)}
            >
              {radio.icon}
            </ToggleButton>
          ))}
        </ButtonGroup> */}
      </div>
    </div>
  );
}

export default App;
