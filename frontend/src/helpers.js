const formatBPM = (bpm) => {
    if (bpm > 0) {
        return "+" + Math.round(bpm).toString();
    } else {
        return Math.round(bpm).toString();
    }
};
const extractSongData = (data) => {
    return {
        artists: data.artists.map(artist => artist.name),
        name: data.name,
        link: data.external_urls.spotify,
        image: data.album.images[1].url,
        uri: data.uri
    }
};
const extractSongListData = (data) => {
    return data.map(info => extractSongData(info));
};

export { formatBPM, extractSongData, extractSongListData };