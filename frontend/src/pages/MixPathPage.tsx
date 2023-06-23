import React, { useState, useEffect } from 'react';
import { RiseLoader } from 'react-spinners';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Header from '../components/Header';
import Song from '../components/Song';
import TypeInDropdown from '../components/TypeInDropdown';
import MixPathTable from '../components/MixPathTable';
import { PlaylistData, MixInstructionData, PlaylistTrackData } from '../utils/types';
import { calculateMixList, retryUntilSuccess } from '../utils/helpers';
import { getUserPlaylists, getPlaylistWeights } from '../api/backendApiCalls';
import DescriptionTooltip from '../components/DescriptionTooltip';

// State Defaults
const noPlaylist = {
  name: '',
  image: 'none',
  link: '',
  num_songs: 0,
  playlist_id: '',
};

// Main Component
function MixPathPage() {
  // State Hooks
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistData>(noPlaylist);
  const [firstSongIdx, setFirstSongIdx] = useState<number | null>(null);
  const [secondSongIdx, setSecondSongIdx] = useState<number | null>(null);
  const [playlistCache, setPlaylistCache] = useState<Map<string, any>>(new Map());
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrackData[]>([]);
  const [playlistWeights, setPlaylistWeights] = useState<number[]>([]);
  const [mixingInstructions, setMixingInstructions] = useState<MixInstructionData[]>([]);

  // Effect Hooks
  useEffect(() => {
    retryUntilSuccess(
      () => getUserPlaylists(),
    )
      .then((data) => setPlaylists(data));
  }, []);

  // Constants
  const tableDefaults = [
    { name: 'Title', value: 'song_name', class: 'col-large' },
    { name: 'Artists', value: 'artists', class: 'col-large' },
    { name: 'BPM', value: 'tempo', class: 'col-small' },
    { name: 'Key', value: 'key', class: 'col-small' },
    { name: 'Instructions', value: 'instruction', class: 'col-large' },
  ];

  const getSelectedPlaylistWeights = async (playlist_id: string, num_songs: number) => {
    if (playlistCache.has(playlist_id)) {
      const data = playlistCache.get(playlist_id);
      setPlaylistTracks(data.tracks);
      setPlaylistWeights(data.weights);
    } else {
      setMixingInstructions([]);
      setIsLoading(true);
      retryUntilSuccess(
        () => getPlaylistWeights(playlist_id, num_songs),
      )
        .then((data) => {
          setPlaylistTracks(data.tracks);
          setPlaylistWeights(data.weights);
          setPlaylistCache((prevCache) => new Map(prevCache).set(
            playlist_id,
            data,
          ));
        })
        .then(() => {
          setIsLoading(false);
        });
    }
  };

  const isPlaylistSelected = () => (
    selectedPlaylist.playlist_id.length > 0
  );

  const updateSelectedPlaylist = async (idx: number) => {
    setSelectedPlaylist(playlists[idx]);
    getSelectedPlaylistWeights(playlists[idx].playlist_id, playlists[idx].num_songs);
  };

  const getMixPath = () => {
    if (firstSongIdx === null || secondSongIdx === null || firstSongIdx === secondSongIdx) {
      alert('Invalid inputs. Please try again.');
      return;
    }
    setMixingInstructions(calculateMixList(
      firstSongIdx,
      secondSongIdx,
      playlistTracks,
      playlistWeights,
    ));
  };

  // Render Function
  return (
    <div className="mix-path-page">
      <Header clickable />
      <div className="page-title">[myx path]</div>
      <div className="mix-path-page-content">
        <div className="mix-path-menu">
          <div>
            <div className="tooltip-title-container">
              <div className="section-title">1. choose playlist...</div>
              <DescriptionTooltip page="mix-path" />
            </div>
            <div className="select-playlist-container">
              {!isPlaylistSelected()
                ? <Song songName="N/A" artistName="N/A" img="none" link="" />
                : <Song songName={selectedPlaylist.name} artistName="" link={selectedPlaylist.link} img={selectedPlaylist.image} />}
              <DropdownButton id="dropdown-button" title="" className={playlists.length === 0 ? '' : 'dropdown-shadow'}>
                <div className="scrollable-menu">
                  {playlists.map((playlist, idx: number) => (
                    <Dropdown.Item
                      onClick={() => { updateSelectedPlaylist(idx); }}
                      key={playlist.name}
                    >
                      {playlist.name}
                    </Dropdown.Item>
                  ))}
                </div>
              </DropdownButton>
            </div>
          </div>
          {isLoading
            ? <div className="h-300 mix-path-loading"><RiseLoader color="#ffffff" size={15} /></div>
            : (
              <div className="mix-path-menu h-300">
                <div className="mix-path-song-select">
                  <div className="section-title">2. choose first song...</div>
                  <TypeInDropdown onChangeFunc={setFirstSongIdx} results={playlistTracks} defaultText="Set first song..." />
                </div>
                <div className="mix-path-song-select">
                  <div className="section-title">3. choose second song...</div>
                  <TypeInDropdown onChangeFunc={setSecondSongIdx} results={playlistTracks} defaultText="Set second song..." />
                </div>
                <button className="action-button" onClick={() => { getMixPath(); }}>blend</button>
              </div>
            )}
        </div>
        {mixingInstructions.length > 0
          && <MixPathTable tableDefaults={tableDefaults} instructionList={mixingInstructions} />}
      </div>
    </div>
  );
}

export default MixPathPage;
