import React, { useState, useEffect } from 'react';
import './App.css';
import Header from '../components/Header.js'
import Song from '../components/Song.js'
import FeatureDropdowns from '../components/FeatureDropdowns';
import 'bootstrap/dist/css/bootstrap.css';
import './components/component.css'

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { BsMusicNoteList } from 'react-icons/bs';
import { FaRecordVinyl } from 'react-icons/fa';
import { AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import ApiInfo from '../config.json'

// Spotify ID Imports
const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

function AcapellaMatchPage() {

}

export default AcapellaMatchPage;