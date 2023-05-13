// Imports
import ApiInfo from '../config.json';

// Constants
const BACKEND_URL = process.env.REACT_APP_API_URL;
const BASE_URL = 'https://accounts.spotify.com/';
const BASE_API_URL = 'https://api.spotify.com/v1/';
const CLIENT_ID = ApiInfo['CLIENT_ID'];
const CLIENT_SECRET = ApiInfo['CLIENT_SECRET'];

// Params
const authParameters = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
}
const searchParameters = (accessToken: string) => {
    return {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    }
};

// Functions
const authenticateUser = () => {
    const redirectUri = BACKEND_URL + "/callback";
    const scopes = "user-read-private user-read-email playlist-modify-private playlist-modify-public";
    const authorizationUrl = BASE_URL + `authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
    
    window.location.assign(authorizationUrl);
};
const getAccessToken = async () => {
    const token = await fetch(BASE_URL + 'api/token', authParameters)
    return token.json();
}
const searchSongs = async (searchInput: string, accessToken: string) => {
    const params = searchParameters(accessToken);
    const trackIDs = await fetch(BASE_API_URL + 'search?q=' + searchInput + '&type=track&limit=10', params)
    
    return trackIDs.json();
};
const getAcapellaDataFromURI = async (trackUri: string, accessToken: string) => {
    var trackId = trackUri.split(":")[2]
    const params = searchParameters(accessToken)
    const response = await fetch(BASE_API_URL + 'tracks/' + trackId, params)
  
    return response.json();
};
const getTrackFeaturesFromURIs = async (trackURIs: string[], accessToken: string) => {
    const params = searchParameters(accessToken);
    const response = await fetch(BASE_API_URL + `audio-features/?ids=${trackURIs.join(',')}`, params)

    return response.json()
};

export { authenticateUser, getAccessToken, searchSongs, getAcapellaDataFromURI, getTrackFeaturesFromURIs };