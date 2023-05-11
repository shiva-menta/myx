import React, { useState, useEffect } from 'react';
import '../App.css';
import Header from '../components/Header.js'
import Song from '../components/Song.js'
import FeatureDropdowns from '../components/FeatureDropdowns';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { BsCheck } from 'react-icons/bs';
import { AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';

import { getAccessToken, getAcapellaDataFromURI, searchSongs, getTrackFeaturesFromURIs } from '../api/spotifyApiCalls';
import { getMatchingAcapellas, addMashupToDB } from '../api/backendApiCalls';
import { formatBPM, extractSongData, extractSongListData } from '../helpers';

function AcapellaMatchPage() {
    // useStates
    // Page State
    const [isSelectPage, setIsSelectPage] = useState(true);
    
    // Search State
    const [searchState, setSearchState] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [songResults, setSongResults] = useState([]);
    const [selectedSong, setSelectedSong] = useState({});
    const [dropdownData, setDropdownData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('Select all parameters.');
    const [searchWarning, setSearchWarning] = useState(false);
    const [dropdownWarning, setDropdownWarning] = useState(false);
    const [mashupAdded, setMashupAdded] = useState(false);
  
    // Acapella State
    const [acapellas, setAcapellas] = useState([]);
    const [selectedAcapella, setSelectedAcapella] = useState({});
  
    // Callback Function
    const updateDropdownData = (data) => {
      setDropdownData(data);
    }
  
    // useEffects
    // Spotify useEffect
    useEffect(() => {
      getAccessToken()
        .then(data => setAccessToken(data.access_token))
    }, []);
    // Update Selected Song useEffect
    useEffect(() => {
      updateSelectedSong(0);
    }, [songResults]);
  
  
    // Functions
    function updateSelectedSong(idx) {
      setSelectedSong(songResults[idx]);
      if (songResults.length > 0) {
        if (songResults[idx].instrumentalness < 0.3) {
          setSearchWarning(true);
        } else {
          setSearchWarning(false);
        }
      }
    }
  
    function updateSelectedAcapella(idx) {
      setSelectedAcapella(acapellas[idx]);
    }
  
    function isSongSelected() {
      return selectedSong != undefined && Object.keys(selectedSong).length != 0;
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
      setSelectedAcapella(res[0])
      setIsSelectPage(false);
    }
  
    // Search
    async function search() {
      searchSongs(searchState, accessToken)
        .then(async data => {
          let extractedSongListData = extractSongListData(data.tracks.items);
          let trackURIs = extractedSongListData.map(track => track.uri.split(":")[2]);
          
          getTrackFeaturesFromURIs(trackURIs, accessToken)
            .then(data => {
              console.log(data)
              let instrumentalValues = data.audio_features.map(feature => feature === null ? 1 : feature.instrumentalness);
              extractedSongListData.forEach((track, index) => {
                track.instrumentalness = instrumentalValues[index];
              });
              setSongResults(extractedSongListData);
            })
        })
    }
  
    // Request Match
    function getAcapellas() {
      if (isSongSelected() && dropdownData.every(item => item !== "")) {
        getMatchingAcapellas(selectedSong.uri, dropdownData[3], dropdownData[0], dropdownData[1], dropdownData[2])
          .then(data => {
            updateAllAcapellaData(data)
          })
          .catch(() => {
            setDropdownWarning(true);
            setErrorMessage("No results found. Please try again.");
          })
      } else {
        setDropdownWarning(true);
        setErrorMessage("Select all parameters.");
        console.log("Incomplete request.")
      }
    }

    // Add Mashup
    function addMashup() {
      if (selectedAcapella != undefined && selectedSong != undefined) {
        var body = {
          "acap_uri": selectedAcapella.uri,
          "acap_song_name": selectedAcapella.name,
          "acap_artist_name": selectedAcapella.artists.join(", "),
          "acap_image": selectedAcapella.image,
          "acap_link": selectedAcapella.link,
          "instr_uri": selectedSong.uri,
          "instr_song_name": selectedSong.name,
          "instr_artist_name": selectedSong.artists.join(", "),
          "instr_image": selectedSong.image,
          "instr_link": selectedSong.link
        }

        addMashupToDB(body)
          .then(() => {
            console.log("Success!")
          })
          .catch(() => {
            console.log("Failure.")
          });
      }
    }

    return (
      <div className="view-container">
          <Header/>
          {isSelectPage ?
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
                  <Dropdown.Item onClick={() => {updateSelectedAcapella(idx)}} key={idx}>{song.name + ' - ' + song.artists.join(', ')}</Dropdown.Item>
                ))}
              </DropdownButton>
              </div>
              <Song songName={selectedAcapella.name} artistName={selectedAcapella.artists.join(', ')} link={selectedAcapella.link} img={selectedAcapella.image}/>
              <div className="mix-instructions-container">
                <div className="section-title">mix instructions:</div>
                <div className="section-text">{`change bpm ${formatBPM(selectedAcapella.bpm_shift)} and key ${selectedAcapella.key_shift}`}</div>
              </div>
              <div className="playlist-add" onClick={() => {addMashup(); setMashupAdded(true)}}>
                {mashupAdded ? "added" : "add to saved"}
                {mashupAdded && <BsCheck color='white' size={15}/>}
              </div>
              <button className="action-button" 
                onClick={() => {
                    setSearchState("");
                    setSongResults([]);
                    setSelectedSong({});
                    setSelectedAcapella({});
                    setDropdownData([]);
                    setSearchWarning(false);
                    setDropdownWarning(false);
                    setAcapellas([]);
                    setIsSelectPage(true);
                    setMashupAdded(false)
                }}
                >
                reset
              </button>
          </div>
          }
      </div>
    );
  }

export default AcapellaMatchPage;