import { mod_dijkstras } from "../utils/helpers";

describe('Modified Dijkstras Tests', () => {

  it('should return the shortest path', () => {
    const firstSongIdx = 0;
    const secondSongIdx = 2;
    const numSongs = 3;
    const playlistWeightMatrix = [[0, 1, 4], [0, 0, 1], [0, 0, 0]]; // make weight from 0 to 2 greater than 0 to 1 + 1 to 2
    const pathLengthPenalty = 1;
  
    const result = mod_dijkstras(firstSongIdx, secondSongIdx, numSongs, playlistWeightMatrix, pathLengthPenalty);
  
    expect(result).toEqual([0, 1, 2]);
  });  

  it('should return an empty array if the firstSongIdx and secondSongIdx are the same', () => {
    const firstSongIdx = 1;
    const secondSongIdx = 1;
    const numSongs = 3;
    const playlistWeightMatrix = [[0, 1, 2], [1, 0, 1], [2, 1, 0]];
    const pathLengthPenalty = 1;

    const result = mod_dijkstras(firstSongIdx, secondSongIdx, numSongs, playlistWeightMatrix, pathLengthPenalty);

    expect(result).toEqual([1]);
  });

  it('should handle single-element playlist', () => {
    const firstSongIdx = 0;
    const secondSongIdx = 0;
    const numSongs = 1;
    const playlistWeightMatrix = [[0]];
    const pathLengthPenalty = 1;

    const result = mod_dijkstras(firstSongIdx, secondSongIdx, numSongs, playlistWeightMatrix, pathLengthPenalty);

    expect(result).toEqual([0]);
  });

});