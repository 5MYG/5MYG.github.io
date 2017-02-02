(function() {

  var spotifyAPI = new SpotifyWebApi();

  var stateKey = 'spotify_auth_state';

  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  function getPlaylists(access_token, limit, offset) {
      return $.ajax({
        url: "https://api.spotify.com/v1/me/playlists",
        headers: { 'Authorization': 'Bearer ' + access_token },
        data: { limit: limit, offset: offset }
      });
  }

  var params = getHashParams();
  var access_token = params.access_token,
      state = params.state,
      storedState = localStorage.getItem(stateKey);

  if (storedState == null) {

    $("#login-button").click(function() {
      var client_id = '0021f16415934279a9f094535452a760';
      var redirect_uri = 'https://5myg.github.io/';

      var state = generateRandomString(16);
      localStorage.setItem(stateKey, state);
      var scope = 'playlist-read-private';
      var url = 'https://accounts.spotify.com/authorize';
      url += '?response_type=token';
      url += '&client_id=' + encodeURIComponent(client_id);
      url += '&scope=' + encodeURIComponent(scope);
      url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
      url += '&state=' + encodeURIComponent(state);
      window.location.replace(url);
    });

    $('#login').show();

  }
  else {

    if (access_token == null || state == null || state !== storedState) {
      alert('There was an error during the authentication');
    }
    else {
      localStorage.removeItem(stateKey);

      var LIMIT = 50;
      getPlaylists(access_token, LIMIT, 0)
      .then( function (response) {
        var randomIndex = Math.floor(Math.random() * response.total);

        if (randomIndex < LIMIT) {
          return response.items[randomIndex];
        }

        return getPlaylists(access_token, 1, randomIndex).items[0];
      })
//      .catch( function (error) {
//        console.log("error first playlists", error);
//      })
      .then( function (targetPlaylist) {
        var target = targetPlaylist.external_urls.spotify;
    //  var target = targetPlaylist..uri;   was ist schöner?
        window.location.replace(target); //bye bye. have fun listening
      });
//      .catch(function (error){
//          console.log("error second get", error);
//      });

    }

  }

})();
