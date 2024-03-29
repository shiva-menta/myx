// Imports
import { MashupData, MashupDataAdd, MashupDataRemove } from '../utils/types';

// Constants
const BACKEND_URL = process.env.REACT_APP_API_URL;
const MASHUPS_URL = `${BACKEND_URL}/mashups`;
const ACAPELLAS_URL = `${BACKEND_URL}/get-acapellas?`;
const SPOT_MASHUPS_URL = `${BACKEND_URL}/add-spotify-mashup`;
const PLAYLISTS_URL = `${BACKEND_URL}/get-user-playlists`;
const PLAYLISTS_WEIGHTS_URL = `${BACKEND_URL}/get-playlist-weights`;
const AUTHENTICATE_URL = `${BACKEND_URL}/api/authenticate`;

// Functions
const authenticateUser = async () => {
  const response = await fetch(AUTHENTICATE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return response.json();
};
const getMashups = async () => {
  const mashups = await fetch(MASHUPS_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return mashups.json();
};
const addMashupToSpotify = async (data: MashupDataAdd) => {
  const mashups = await fetch(SPOT_MASHUPS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return mashups.json();
};
const removeSavedMashup = async (data: MashupDataRemove) => {
  const mashups = await fetch(MASHUPS_URL, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return mashups.json();
};
const getMatchingAcapellas = async (
  uri: string,
  bpm: string,
  genre: string,
  decade: string,
  key: string,
  energy: number,
) => {
  const acapellas = await fetch(`${ACAPELLAS_URL}uri=${encodeURIComponent(uri)}&bpm=${bpm}&genre=${encodeURIComponent(genre)}&decade=${decade}&key=${key}&energy=${energy}&limit=10`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!acapellas.ok) {
    throw Error(acapellas.statusText);
  }
  return acapellas.json();
};
const addMashupToDB = async (data: MashupData) => {
  const res = await fetch(MASHUPS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res.json();
};
const getUserPlaylists = async () => {
  const playlists = await fetch(PLAYLISTS_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return playlists.json();
};
const getPlaylistWeights = async (playlist_id: string, num_songs: number) => {
  const playlistData = await fetch(`${PLAYLISTS_WEIGHTS_URL}?playlist_id=${playlist_id}&num_songs=${num_songs}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return playlistData.json();
};

export {
  authenticateUser,
  getMashups,
  addMashupToSpotify,
  removeSavedMashup,
  getMatchingAcapellas,
  addMashupToDB,
  getUserPlaylists,
  getPlaylistWeights,
};
