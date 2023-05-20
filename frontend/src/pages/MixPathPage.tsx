import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Header from '../components/Header';
import { PlaylistData, SongData, SongAudioFeatures } from '../utils/types';
import { getUserPlaylists, getPlaylistWeights } from '../api/backendApiCalls';

// State Defaults
const noPlaylist = {
  name: '',
  image: '',
  playlist_id: '',
};

function MixPathPage() {
  // State Hooks
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistData>(noPlaylist);
  const [playlistTracks, setPlaylistTracks] = useState<SongData[]>([]);
  const [playlistTracksFeatures, setPlaylistsTracksFeatures] = useState<SongAudioFeatures[]>([]);
  const [playlistWeightMatrix, setPlaylistWeightMatrix] = useState<number[][]>([]);

  // Effect Hooks
  useEffect(() => {
    getUserPlaylists()
      .then((data) => setPlaylists(data));
  }, []);

  const getSelectedPlaylistWeights = async () => {
    getPlaylistWeights(selectedPlaylist.playlist_id)
      .then((data) => {
        setPlaylistTracks(data.tracks);
        setPlaylistsTracksFeatures(data.tracks_data);
        setPlaylistWeightMatrix(data.weights);
        console.log(data.weights);
      });
  };

  // Render Function
  return (
    <div className="mix-path-page">
      <Header />
      <div className="page-title">[mix path]</div>
      <div className="section-title">1. choose playlist...</div>
      <DropdownButton id="dropdown-button" title="">
        {playlists.map((playlist, idx: number) => (
          <Dropdown.Item onClick={() => { setSelectedPlaylist(playlists[idx]); }} key={playlist.name}>{playlist.name}</Dropdown.Item>
        ))}
      </DropdownButton>
      <button onClick={() => getSelectedPlaylistWeights} >getData</button>
      <div className="section-title">2. choose first song...</div>
      <div className="section-title">3. choose second song...</div>
    </div>
  );
}

export default MixPathPage;
