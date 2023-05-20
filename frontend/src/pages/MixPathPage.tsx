import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Header from '../components/Header';
import Song from '../components/Song';
import { PlaylistData, SongData, SongAudioFeatures } from '../utils/types';
import { getUserPlaylists, getPlaylistWeights } from '../api/backendApiCalls';

// State Defaults
const noPlaylist = {
  name: '',
  image: 'none',
  link: '',
  playlist_id: '',
};

function MixPathPage() {
  // State Hooks
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistData>(noPlaylist);
  const [playlistCache, setPlaylistCache] = useState<Map<string, any>>(new Map());
  const [playlistTracks, setPlaylistTracks] = useState<SongData[]>([]);
  const [playlistTracksFeatures, setPlaylistsTracksFeatures] = useState<SongAudioFeatures[]>([]);
  const [playlistWeightMatrix, setPlaylistWeightMatrix] = useState<number[][]>([]);

  // Effect Hooks
  useEffect(() => {
    getUserPlaylists()
      .then((data) => setPlaylists(data));
  }, []);

  const getSelectedPlaylistWeights = async (playlist_id: string) => {
    if (playlistCache.has(playlist_id)) {
      const data = playlistCache.get(playlist_id);
      setPlaylistTracks(data.tracks);
      setPlaylistsTracksFeatures(data.tracks_data);
      setPlaylistWeightMatrix(data.weights);
    } else {
      getPlaylistWeights(playlist_id)
        .then((data) => {
          setPlaylistTracks(data.tracks);
          setPlaylistsTracksFeatures(data.tracks_data);
          setPlaylistWeightMatrix(data.weights);
          console.log(data.weights);
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
          {playlists.map((playlist, idx: number) => (
            <Dropdown.Item
              onClick={() => { updateSelectedPlaylist(idx); }}
              key={playlist.name}
            >
              {playlist.name}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>
      <div className="section-title">2. choose first song...</div>
      <div className="section-title">3. choose second song...</div>
    </div>
  );
}

export default MixPathPage;
