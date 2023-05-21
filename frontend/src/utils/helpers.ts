import { PlaylistTrackData, MixInstructionData } from './types';
import MinHeap from './minHeap';

// Type Defaults
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

const formatBPM = (bpm: number) => {
  if (bpm > 0) {
    return `+${Math.round(bpm).toString()}`;
  } else {
    return Math.round(bpm).toString();
  }
};
const extractSongData = (data: any) => ({
  artists: data.artists.map((artist: any) => artist.name),
  name: data.name,
  link: data.external_urls.spotify,
  image: data.album.images[1].url,
  uri: data.uri,
});
const extractSongListData = (data: any) => (
  data.map((info: any) => extractSongData(info))
);

// Mix Path Helpers

const modified_dijkstras = (
  firstSongIdx: number,
  secondSongIdx: number,
  numSongs: number,
  playlistWeightMatrix: number[][],
) => {
  // Initialization
  const dist = new Array(numSongs).fill(Number.MAX_VALUE);
  const parent = new Array(numSongs).fill(null);

  dist[firstSongIdx] = 0;
  parent[firstSongIdx] = firstSongIdx;

  const visited = new Set();
  const minHeap = new MinHeap();
  for (let i = 0; i < dist.length; i += 1) {
    minHeap.insert(dist[i], i);
  }

  // Path Finding Loop
  let node = null;
  let newWeight = null;

  while (minHeap.getSize() !== 0) {
    node = minHeap.extractMin();
    visited.add(node[1]);
    for (let vert = 0; vert < numSongs; vert += 1) {
      newWeight = dist[node[1]]
        + playlistWeightMatrix[Math.min(vert, node[1])][Math.max(vert, node[1])];
      if (!visited.has(vert) && dist[vert] > newWeight) {
        dist[vert] = newWeight;
        minHeap.decreaseKey(vert, newWeight);
        parent[vert] = node[1];
      }
    }
  }

  // Return Song Number Path
  const path = [];
  let current = secondSongIdx;
  while (current !== firstSongIdx) {
    path.push(current);
    current = parent[current];
  }
  path.push(firstSongIdx);
  return path.reverse();
};

const calculateMixList = (
  firstSongIdx: number,
  secondSongIdx: number,
  allSongs: PlaylistTrackData[],
  playlistWeightMatrix: number[][],
) => {
  // Call Modified Dijkstra's
  const mixPath = modified_dijkstras(
    firstSongIdx,
    secondSongIdx,
    allSongs.length,
    playlistWeightMatrix,
  );

  // Create Mixing Instruction List
  const instructionList = [];
  const pattern = /^\|\s*\+\d+$/;
  let currInstructions = '';
  let songIdx = 0;
  let nextSongIdx = 0;
  let currSong: PlaylistTrackData = noPlaylistTrack;
  let nextSong: PlaylistTrackData = noPlaylistTrack;
  for (let i = 0; i < mixPath.length - 1; i += 1) {
    songIdx = mixPath[i];
    nextSongIdx = mixPath[i + 1];
    currSong = allSongs[songIdx];
    nextSong = allSongs[songIdx + 1];
    if (pattern.test(currSong.name)) {
      currInstructions += `key shift ${currSong.name.slice(currSong.name.length - 2, currSong.name.length)} |`;
    }
    currInstructions += `change bpm ${formatBPM(nextSong.audio_features.tempo - currSong.audio_features.tempo)}`;
    if (playlistWeightMatrix[Math.min(songIdx, nextSongIdx)][Math.max(songIdx, nextSongIdx)] > 10) {
      currInstructions += ' | hard stop and fade out';
    }
    instructionList.push({
      song_name: currSong.name,
      artists: currSong.artists,
      instruction: currInstructions,
    });
    currInstructions = '';
  }

  songIdx = mixPath[mixPath.length - 1];
  currSong = allSongs[songIdx];
  if (pattern.test(currSong.name)) {
    currInstructions += `key shift ${currSong.name.slice(currSong.name.length - 2, currSong.name.length)} |`;
  }
  instructionList.push({
    song_name: currSong.name,
    artists: currSong.artists,
    instruction: currInstructions,
  });

  return instructionList;
};

export {
  formatBPM,
  extractSongData,
  extractSongListData,
  calculateMixList,
};
