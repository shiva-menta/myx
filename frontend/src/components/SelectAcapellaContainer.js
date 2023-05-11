import Song from '../components/Song.js';
import FeatureDropdowns from '../components/FeatureDropdowns';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function SelectAcapellaContainer() {
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