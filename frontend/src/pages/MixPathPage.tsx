import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Header from '../components/Header';
import Song from '../components/Song';
import TypeInDropdown from '../components/TypeInDropdown';
import MixPathTable from '../components/MixPathTable';
import { PlaylistData, MixInstructionData, PlaylistTrackData } from '../utils/types';
import { calculateMixList } from '../utils/helpers';
import { getUserPlaylists, getPlaylistWeights } from '../api/backendApiCalls';

// State Defaults
const noPlaylist = {
  name: '',
  image: 'none',
  link: '',
  playlist_id: '',
};
const noPlaylistTrack = {
  name: '',
  artists: [],
  id: '',
  audio_features: {
    acousticness: 0,
    danceability: 0,
    energy: 0,
    key: 0,
    loudness: 0,
    mode: 0,
    tempo: 0,
    valence: 0,
  },
};

function MixPathPage() {
  // State Hooks
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistData>(noPlaylist);
  const [firstSong, setFirstSong] = useState<PlaylistTrackData>(noPlaylistTrack);
  const [secondSong, setSecondSong] = useState<PlaylistTrackData>(noPlaylistTrack);
  const [playlistCache, setPlaylistCache] = useState<Map<string, any>>(new Map());
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrackData[]>([]);
  const [playlistWeightMatrix, setPlaylistWeightMatrix] = useState<number[][]>([]);
  const [mixingInstructions, setMixingInstructions] = useState<MixInstructionData[]>([]);

  // Effect Hooks
  useEffect(() => {
    getUserPlaylists()
      .then((data) => setPlaylists(data));
  }, []);

  // Constants
  const tableDefaults = [
    { name: "Title", value: "title" },
    { name: "Artists", value: "artists" },
    { name: "Instructions", value: "instruction" },
  ];

  const getSelectedPlaylistWeights = async (playlist_id: string) => {
    if (playlistCache.has(playlist_id)) {
      const data = playlistCache.get(playlist_id);
      setPlaylistTracks(data.tracks);
      setPlaylistWeightMatrix(data.weights);
    } else {
      getPlaylistWeights(playlist_id)
        .then((data) => {
          setPlaylistTracks(data.tracks);
          setPlaylistWeightMatrix(data.weights);
          setPlaylistCache((prevCache) => new Map(prevCache).set(
            playlist_id,
            data,
          ));
        });
    }
  };

  const isPlaylistSelected = () => (
    selectedPlaylist.playlist_id.length > 0
  );

  const updateSelectedPlaylist = async (idx: number) => {
    setSelectedPlaylist(playlists[idx]);
    getSelectedPlaylistWeights(playlists[idx].playlist_id);
  };

  const getMixPath = () => {
    setMixingInstructions(calculateMixList(firstSong, secondSong, playlistTracks, playlistWeightMatrix));
  };

  // Render Function
  return (
    <div className="mix-path-page">
      <Header />
      <div className="page-title">[myx path]</div>
      <div className="section-title">1. choose playlist...</div>
      <div className="select-playlist-container">
        {!isPlaylistSelected()
          ? <Song songName="N/A" artistName="N/A" img="none" link="" />
          : <Song songName={selectedPlaylist.name} artistName="" link={selectedPlaylist.link} img={selectedPlaylist.image} />}
        <DropdownButton id="dropdown-button" title="">
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
      <div className="section-title">2. choose first song...</div>
      <TypeInDropdown onChangeFunc={setFirstSong} results={playlistTracks} defaultText="Set first song..." />
      <div className="section-title">3. choose second song...</div>
      <TypeInDropdown onChangeFunc={setSecondSong} results={playlistTracks} defaultText="Set second song..." />
      <button className="action-button" onClick={() => {}}>blend</button>
      <MixPathTable tableDefaults={tableDefaults} instructionList={mixingInstructions} />
    </div>
  );
}

export default MixPathPage;
