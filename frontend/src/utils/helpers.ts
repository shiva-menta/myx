import { PlaylistTrackData } from "./types";

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

// const modified_dijkstras = (
//   firstSongIdx: number,
//   secondSongIdx: number,
//   allSongs: PlaylistTrackData[],
//   playlistWeightMatrix: number[][]
// ) => {
//   // Initialization
//   const numSongs = allSongs.length;
//   const dist = new Array(numSongs).fill(Number.MAX_VALUE);
//   const parent = new Array(numSongs).fill(null);

//   dist[firstSongIdx] = 0;



// };

const calculateMixList = (
  firstSong: PlaylistTrackData,
  secondSong: PlaylistTrackData,
  allSongs: PlaylistTrackData[],
  playlistWeightMatrix: number[][]
) => {
  return [];
};

export { formatBPM, extractSongData, extractSongListData, calculateMixList };
