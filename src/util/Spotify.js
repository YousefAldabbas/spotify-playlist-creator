const client_id = '#################';
const redirect_uri = '#########';
let usersToken; 
const spotify = {
    getAccessToken: function() {
        if (usersToken) {
            return usersToken;
        } 
    
    //check if user has access token
    const accessToken = window.location.href.match(/access_token=([^&]*)/); // get access token from url
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/); // get expires in from url
    
    if (accessToken && expiresInMatch) {
        usersToken = accessToken[1];
        const expiresIn = Number(expiresInMatch[1]);
        window.setTimeout(() => usersToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return usersToken;
    } else {
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_uri}`;
        window.location = accessUrl;
    }
},
    search: function(searchTerm) {
        const accessToken = this.getAccessToken();
        const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        return fetch(searchUrl, {headers: headers}).then(response => response.json()).then(jsonResponse => {
            if(!jsonResponse.tracks){
                 return []; 
                }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
    })},
    savePlaylist: function(playlistName, trackUris) {
        if (!playlistName || !trackUris.length) {
            return;
        }
        const accessToken = this.getAccessToken();
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        let userId;
        let playlistId;
        const userUrl = 'https://api.spotify.com/v1/me';
        return fetch(userUrl, {headers: headers}).then(response => response.json()).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: playlistName})
            }).then(response => response.json()).then(jsonResponse => {
                playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                });
            });
        });
    }

}





export default spotify