import { useState, useEffect } from 'react';
import { addMashupToDB } from '../api/backendApiCalls';
import { formatBPM } from '../helpers';

import { BsCheck } from 'react-icons/bs';
import { AiOutlinePlus } from 'react-icons/ai';

import Song from '../components/Song.js';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function DisplayMatchResults({ selectedSong, resetFlag, acapellas, selectedAcapella, setSelectedAcapella, reset }) {
  const [mashupAdded, setMashupAdded] = useState(false);

  useEffect(() => {
    setMashupAdded(false)
  }, [resetFlag])

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

  function updateSelectedAcapella(idx) {
    setSelectedAcapella(acapellas[idx]);
  }
  
  return (
    <div className="results-page-container">
      <div className="section-title">instrumental</div>
      <Song songName={selectedSong.name} artistName={selectedSong.artists.join(', ')} link={selectedSong.link} img={selectedSong.image}/>
      <div className="plus-container">
        <AiOutlinePlus color='white' size={40}/>
      </div>
      <div className="acapella-container">
        <div className="section-title">acapella</div>
        <DropdownButton id='dropdown-button' title="">
          {acapellas.map((song, idx) => (
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
      <button className="action-button" onClick={reset}>reset</button>
    </div>
  );
}

export default DisplayMatchResults;