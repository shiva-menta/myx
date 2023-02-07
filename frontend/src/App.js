import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.js'
import SongDisplay from './components/SongDisplay.js'
import FeatureDropdowns from './components/FeatureDropdowns';
import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css'

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { BsMusicNoteList } from 'react-icons/bs';
import { FaRecordVinyl } from 'react-icons/fa';
import { AiOutlineSearch } from 'react-icons/ai';
import ApiInfo from './config.json'

const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

function App() {
  // const [radioValue, setRadioValue] = useState('match');
  const [searchState, setSearchState] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [songResults, setSongResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState({});

  const radios = [
    { icon: <BsMusicNoteList/>, value: 'list' },
    { icon: <FaRecordVinyl/>, value: 'match' }
  ];

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

  useEffect(() => {
    let searchBox = document.querySelector(".song-search-container");
    searchBox.style.backgroundColor = "rgba(0,0,0, 0.35)";

		searchBox.addEventListener("mousedown", function() {
			searchBox.style.backgroundColor = "rgba(0,0,0, 0.5)";
		})
		document.addEventListener("mousedown", function(event) {
			if (event.target.closest(".song-search-container")) return;
			searchBox.style.backgroundColor = "rgba(0,0,0, 0.35)";
		})
  })
  
  useEffect(() => {
    updateSelectedSong(0);
  }, [songResults]);

  function extractSongData(songList) {
    return songList.map(data => 
      ({
        artists: data.artists.map(artist => artist.name),
        name: data.name,
        link: data.external_urls.spotify,
        image: data.album.images[1].url,
        uri: data.uri
      })
    );
  }

  function updateSelectedSong(idx) {
    setSelectedSong(songResults[idx]);
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
        setSongResults(extractSongData(data.tracks.items));
      })
  }

  return (
    <div className="App">
      <div className="view-container">
        <Header/>
        <div className="page-title">[acapella match]</div>
        <div className="song-select-container">
          <div className="song-search-container">
            <button className="search-button" onClick={() => {search()}}>
              <AiOutlineSearch/>	  
            </button>
            <input id="team-search" type="test" className="song-search-bar" placeholder="Search by title" onChange={(evt) => {setSearchState(evt.target.value)}}/>
          </div>
          <DropdownButton id='dropdown-button' title="">
            {(selectedSong != undefined && Object.keys(selectedSong).length != 0) && songResults.map((song, idx) => (
              <Dropdown.Item onClick={() => {updateSelectedSong(idx)}}>{song.name + ' - ' + song.artists.join(', ')}</Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
        
        {selectedSong === undefined || Object.keys(selectedSong).length === 0 ?
          <SongDisplay songName="N/A" artistName="N/A" link="" img="none"/>
        :
          <SongDisplay songName={selectedSong.name} artistName={selectedSong.artists.join(', ')} link={selectedSong.link} img={selectedSong.image}/>
        }
        
        <FeatureDropdowns/>
        <button className="match-button">match</button>
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
