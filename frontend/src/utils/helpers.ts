const formatBPM = (bpm: number) => {
    if (bpm > 0) {
        return "+" + Math.round(bpm).toString();
    } else {
        return Math.round(bpm).toString();
    }
};
const extractSongData = (data: any) => {
    return {
        artists: data.artists.map((artist: any) => artist.name),
        name: data.name,
        link: data.external_urls.spotify,
        image: data.album.images[1].url,
        uri: data.uri
    }
};
const extractSongListData = (data: any) => {
    return data.map((info: any) => extractSongData(info));
};

export { formatBPM, extractSongData, extractSongListData };