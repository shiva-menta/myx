import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.js'
import SongDisplay from './components/SongDisplay.js'
import FeatureDropdowns from './components/FeatureDropdowns';
import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css'

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { BsMusicNoteList } from 'react-icons/bs';
import { FaRecordVinyl } from 'react-icons/fa';
import { AiOutlineSearch } from 'react-icons/ai';

function App() {
  const [radioValue, setRadioValue] = useState('match');
  const [searchState, setSearchState] = useState('');

  const radios = [
    { icon: <BsMusicNoteList/>, value: 'list' },
    { icon: <FaRecordVinyl/>, value: 'match' }
  ];

  useEffect(() => {
    let searchBox = document.querySelector(".song-search-container");
		searchBox.addEventListener("mousedown", function() {
			searchBox.style.backgroundColor = "rgba(0,0,0, 0.5)";
		})
		document.addEventListener("mousedown", function(event) {
			if (event.target.closest(".song-search-container")) return;
			searchBox.style.backgroundColor = "rgba(0,0,0, 0.35)";
		})
  })

  return (
    <div className="App">
      <div className="view-container">
        <Header/>
        <div className="page-title">[acapella match]</div>
        <div className="song-search-container">
          <AiOutlineSearch/>					
          <input id="team-search" type="test" className="song-search-bar" placeholder="Search by title" onChange={(evt) => {setSearchState(evt.target.value)}}/>
        </div>
        <SongDisplay/>
        <FeatureDropdowns/>
        <button className="match-button">match</button>
        <ButtonGroup className="nav-button-group">
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
        </ButtonGroup>
      </div>
    </div>
  );
}

export default App;
