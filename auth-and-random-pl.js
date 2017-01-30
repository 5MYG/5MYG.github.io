var testall;

(function() {

  var spotifyAPI = new SpotifyWebApi();

  var stateKey = 'spotify_auth_state';
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };


  var params = getHashParams();
  var access_token = params.access_token,
      state = params.state,
      storedState = localStorage.getItem(stateKey);
  if (access_token && (state == null || state !== storedState)) {
    alert('There was an error during the authentication');
  } else {
    localStorage.removeItem(stateKey);

    if (access_token) {
      spotifyAPI.setAccessToken(access_token);
      var allPlaylists = [];
      var LIMIT = 50;

      spotifyAPI.getUserPlaylists( {limit: LIMIT, offset: 0} )
        .then(function(firstData) {
          allPlaylists.push.apply(allPlaylists, firstData.items);
          var playlistPromises = [];

          for (var skip = 50; skip < firstData.total; skip += LIMIT) {

//            var request = spotifyAPI.getUserPlaylists( {limit: LIMIT, offset: skip} )
//            .then(function(nextData) {
//              allPlaylists.push.apply(allPlaylists, nextData.items);
//            }, function(err) {
//              console.error(err);
//            });


            var request = $.ajax({
                url: 'https://api.spotify.com/v1/me/playlists',
                data: { limit: LIMIT, offset: skip},
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  allPlaylists.push.apply(allPlaylists, response.items);
                }
            });

            playlistPromises.push(request);
          }

          $.when.apply($, playlistPromises).done(function() {
            $('body').append('All Done!');
            console.log( allPlaylists.length );

            testall = allPlaylists;
            console.log( allPlaylists );

            var randomIndex = Math.floor( Math.random() * allPlaylists.length );
            console.log( allPlaylists[randomIndex] );
            var target = allPlaylists[randomIndex].external_urls.spotify;
//          var target = allPlaylists[randomIndex].uri;   was ist schöner?
//          window.location.href = target; //bye bye. have fun listening

            window.open(target,'_blank');
          })

        }, function(err) {
          console.error(err);
        });


    } else {
        $('#login').show();
        $('#loggedin').hide();
    }
    document.getElementById('login-button').addEventListener('click', function() {
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
      window.location = url;
    }, false);
  }
})();
