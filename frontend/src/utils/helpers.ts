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

// Other Constants
const pattern = /^\|\s*\+\d+$/;
const harmonicPitchmap = new Map(Object.entries({
  0: [5, 7, 21],
  1: [6, 8, 22],
  2: [7, 9, 23],
  3: [8, 10, 12],
  4: [9, 11, 13],
  5: [0, 10, 14],
  6: [1, 11, 15],
  7: [0, 2, 16],
  8: [1, 3, 17],
  9: [2, 4, 18],
  10: [3, 5, 19],
  11: [4, 6, 20],
  12: [17, 19, 3],
  13: [18, 20, 4],
  14: [19, 21, 5],
  15: [20, 22, 6],
  16: [21, 23, 7],
  17: [12, 22, 8],
  18: [13, 23, 9],
  19: [12, 14, 10],
  20: [13, 15, 11],
  21: [14, 16, 0],
  22: [15, 17, 1],
  23: [16, 18, 2],
}));

// Functions
const retryUntilSuccess = async (func: any, retries: number = 5, delay: number = 1500) => {
  for (let i = 0; i < retries; i += 1) {
    try {
      const result = await func();
      return result;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Function failed after ${retries} attempts`);
};

const formatBPM = (bpm: number) => {
  if (bpm > 0) {
    return `+${bpm.toFixed(1)}`;
  } else {
    return bpm.toFixed(1);
  }
};
const formatKey = (key: number, mode: number) => (12 * (1 - mode) + key);
const cutString = (string: string, maxLength: number) => {
  if (string.length > maxLength) {
    return `${string.substring(0, maxLength)}..`;
  }
  return string;
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
const getWeightPosition = (
  i: number,
  j: number,
  size: number,
) => (size * i - ((i * (i + 1)) / 2) + (j - i - 1));

const mod_dijkstras = (
  firstSongIdx: number,
  secondSongIdx: number,
  numSongs: number,
  playlistWeights: number[],
  pathLengthPenalty: number,
) => {
  // Initialization
  const dist = new Array(numSongs).fill(Number.MAX_VALUE);
  const parent = new Array(numSongs).fill(null);
  const pathLength = new Array(numSongs).fill(0);

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
        + playlistWeights[getWeightPosition(
          Math.min(vert, node[1]),
          Math.max(vert, node[1]),
          numSongs,
        )]
        + pathLength[node[1]] * pathLengthPenalty;
      if (!visited.has(vert) && dist[vert] > newWeight) {
        dist[vert] = newWeight;
        minHeap.decreaseKey(vert, newWeight);
        parent[vert] = node[1];
        pathLength[vert] = pathLength[node[1]] + 1;
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

const isMixableKey = (
  firstSongMode: number,
  firstSongKey: number,
  secondSongMode: number,
  secondSongKey: number,
) => {
  const firstKey = formatKey(firstSongKey, firstSongMode);
  const keys = harmonicPitchmap.get(firstKey.toString());
  if (keys !== undefined) {
    const secondKey = formatKey(secondSongKey, secondSongMode);
    return keys.includes(secondKey) || firstKey === secondKey;
  } else {
    throw new Error();
  }
};

const createMixInstruction = (
  firstSong: PlaylistTrackData,
  secondSong: PlaylistTrackData,
  mixWeight: number,
) => {
  let currInstructions = '';
  if (mixWeight > 100) {
    currInstructions = 'hard stop and fade out';
  } else {
    if (pattern.test(firstSong.name)) {
      currInstructions += `key shift ${firstSong.name.slice(firstSong.name.length - 2, firstSong.name.length)} |`;
    }
    const tempoDifferences = [
      secondSong.audio_features.tempo - firstSong.audio_features.tempo,
      secondSong.audio_features.tempo / 2 - firstSong.audio_features.tempo,
      secondSong.audio_features.tempo - firstSong.audio_features.tempo / 2,
    ];
    const absValTempoDifferences = tempoDifferences.map((item) => Math.abs(item));
    currInstructions += `change bpm ${formatBPM(tempoDifferences[absValTempoDifferences.indexOf(Math.min(...absValTempoDifferences))])}`;
    if (!isMixableKey(
      firstSong.audio_features.mode,
      firstSong.audio_features.key,
      secondSong.audio_features.mode,
      secondSong.audio_features.key,
    )) {
      currInstructions += ' (non-harmonic)';
    }
  }

  return {
    song_name: firstSong.name,
    artists: firstSong.artists,
    tempo: Math.round(firstSong.audio_features.tempo),
    key: formatKey(firstSong.audio_features.key, firstSong.audio_features.mode),
    instruction: currInstructions,
  };
};

const calculateMixList = (
  firstSongIdx: number,
  secondSongIdx: number,
  allSongs: PlaylistTrackData[],
  playlistWeights: number[],
) => {
  // Call Modified Dijkstra's
  const numSongs = allSongs.length;
  const mixPath = mod_dijkstras(
    firstSongIdx,
    secondSongIdx,
    numSongs,
    playlistWeights,
    3,
  );

  // Create Mixing Instruction List
  const instructionList = [];
  let songIdx = mixPath[0];
  let nextSongIdx = 0;
  let currSong: PlaylistTrackData = allSongs[songIdx];
  let nextSong: PlaylistTrackData = noPlaylistTrack;

  for (let i = 1; i < mixPath.length; i += 1) {
    nextSongIdx = mixPath[i];
    nextSong = allSongs[nextSongIdx];
    instructionList.push(createMixInstruction(
      currSong,
      nextSong,
      playlistWeights[getWeightPosition(
        Math.min(songIdx, nextSongIdx),
        Math.max(songIdx, nextSongIdx),
        numSongs,
      )],
    ));
    songIdx = nextSongIdx;
    currSong = nextSong;
  }

  songIdx = mixPath[mixPath.length - 1];
  currSong = allSongs[songIdx];
  instructionList.push({
    song_name: currSong.name,
    artists: currSong.artists,
    tempo: Math.round(currSong.audio_features.tempo),
    key: formatKey(currSong.audio_features.key, currSong.audio_features.mode),
    instruction: (pattern.test(currSong.name) ? `key shift ${currSong.name.slice(currSong.name.length - 2, currSong.name.length)}` : ''),
  });

  return instructionList;
};

export {
  formatBPM,
  extractSongData,
  extractSongListData,
  calculateMixList,
  cutString,
  mod_dijkstras,
  getWeightPosition,
  retryUntilSuccess,
};
