type SongData = {
  artists: string[];
  name: string;
  link: string;
  image: string;
  uri: string;
};
type SongResultData = {
  artists: string[];
  name: string;
  link: string;
  image: string;
  uri: string;
  instrumentalness: number;
  energy: number;
};
type AcapellaData = {
  artists: string[];
  name: string;
  link: string;
  image: string;
  uri: string;
  key_shift: string;
  bpm_shift: number;
};
type MashupData = {
  acap_song_name: string;
  acap_artist_name: string;
  acap_uri: string;
  acap_image: string;
  acap_link: string;
  instr_song_name: string;
  instr_artist_name: string;
  instr_uri: string;
  instr_image: string;
  instr_link: string;
};
type MashupDataAdd = {
  acap_uri: string;
  acap_name: string;
  instr_uri: string;
  instr_name: string;
};
type MashupDataRemove = {
  acap_uri: string;
  instr_uri: string;
};
type AcapellaURI = [string, string, number];
type PlaylistData = {
  name: string;
  image: string;
  link: string;
  num_songs: number;
  playlist_id: string;
}
type SongAudioFeatures = {
  acousticness: number;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  tempo: number;
  valence: number;
}
type PlaylistTrackData = {
  name: string;
  artists: string[];
  id: string;
  audio_features: SongAudioFeatures;
}
type MixInstructionData = {
  song_name: string;
  artists: string[];
  instruction: string;
};

export type {
  SongData,
  SongResultData,
  AcapellaData,
  AcapellaURI,
  MashupData,
  MashupDataAdd,
  MashupDataRemove,
  PlaylistData,
  SongAudioFeatures,
  PlaylistTrackData,
  MixInstructionData,
};
