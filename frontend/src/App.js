import React, { useState } from 'react';
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

function App() {
  const [radioValue, setRadioValue] = useState('match')

  const radios = [
    { icon: <BsMusicNoteList/>, value: 'list' },
    { icon: <FaRecordVinyl/>, value: 'match' }
  ];

  return (
    <div className="App">
      <div className="view-container">
        <Header/>
        <div className="page-title">[acapella match]</div>
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
