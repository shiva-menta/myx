import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Header from '../components/Header';
import { PlaylistData } from '../utils/types';
import { getUserPlaylists } from '../api/backendApiCalls';

function MixPathPage() {
  // State Hooks
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);

  // Effect Hooks
  useEffect(() => {
    getUserPlaylists()
      .then((data) => setPlaylists(data));
  }, []);

  // Render Function
  return (
    <div className="mix-path-page">
      <Header />
      <div className="page-title">[mix path]</div>
      <div className="section-title">1. choose playlist...</div>
      <DropdownButton id="dropdown-button" title="">
        {playlists.map((playlist) => (
          <Dropdown.Item key={playlist.name}>{playlist.name}</Dropdown.Item>
        ))}
      </DropdownButton>
      <div className="section-title">2. choose first song...</div>
      <div className="section-title">3. choose second song...</div>
    </div>
  );
}

export default MixPathPage;
