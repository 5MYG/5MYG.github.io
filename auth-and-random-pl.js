(function() {

  var SITE_KEY = "random_spotify_playlist";
  var STATE_KEY = SITE_KEY + ":auth_state";
  var DATE_KEY = SITE_KEY + ":date";
  var ACCESS_TOKEN_KEY = SITE_KEY + ":access_token";
  var EXPIRES_IN_KEY = SITE_KEY + ":expires_in";

  function getHashParams() {
    var hashParams = {};
    var e;
    var r = /([^&;=]+)=?([^&;]*)/g;
    var q = window.location.hash.substring(1);
    while ( e = r.exec(q) ) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  function showLogin() {

    $("#login-button").click(function() {
      var state = generateRandomString(16);
      localStorage.setItem(STATE_KEY, state);
      var dateLogin = Math.floor(Date.now() / 1000);
      localStorage.setItem(DATE_KEY, dateLogin);

      var client_id = "0021f16415934279a9f094535452a760";
      var scope = "playlist-read-private";
      var redirect_uri = "https://5myg.github.io/";

      var url = "https://accounts.spotify.com/authorize" +
        "?response_type=token" +
        "&client_id=" + encodeURIComponent(client_id) +
        "&scope=" + encodeURIComponent(scope) +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&state=" + encodeURIComponent(state);

      window.location.href = url;
    });

    $("#login").show();

  }

  function getPlaylists(access_token, limit, offset) {
      return $.ajax({
        url: "https://api.spotify.com/v1/me/playlists",
        headers: { "Authorization": "Bearer " + access_token},
        data: { limit: limit, offset: offset }
      });
  }

  function showRandomButton(access_token) {

    $("#open-random-button").click(function() {

      $("#messages-for-user") .append("fetching data of playlists...");

      var LIMIT = 50;
      getPlaylists(access_token, LIMIT, 0)
        .then( function (response1) {
          var randomIndex = Math.floor(Math.random() * response1.total);

          if (randomIndex < LIMIT) {
            response1.items = [ response1.items[randomIndex] ];
            return response1;
          }

          return getPlaylists(access_token, 1, randomIndex);
        })
        .then( function (response2) {
          var target = response2.items[0].external_urls.spotify;
//        var target = response2.items[0].uri; //

          $("#messages-for-user") .append("redirecting to spotify...");
          window.location.href = target;
          $("#messages-for-user") .append("bye bye. have fun listening");
        }, function(err) {
          var errorMsg = "unexpected error \n";
          console.log(errorMsg, err);
          errorMsg += " status: " + err.status + "\n";
          errorMsg += " statusText: " + err.statusText + "\n";
          errorMsg += " Please try again later. Or message me / create an issue.";
          $("#messages-for-user") .append(errorMsg);

          $("#open-random").hide();
          showLogin();
        });
    });

    $("#open-random").show();

  }

  var params = getHashParams();

  var storedState = localStorage.getItem(STATE_KEY);
  var storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (storedState == null) {
    // before authentication:
    showLogin();
  }
  else if (storedAccessToken == null) {
    // after authentication:
    if (params.access_token == null || params.state == null || params.state !== storedState) {
      $("#messages-for-user") .append("There was an error during the authentication. Please try again.");
      showLogin();
    }
    else {
      localStorage.setItem(ACCESS_TOKEN_KEY, params.access_token);
      localStorage.setItem(EXPIRES_IN_KEY, params.expires_in);
      showRandomButton(params.access_token);
    }
  }
  else {
    // stored authentication:
    var storedDate = localStorage.getItem(DATE_KEY);
    var storedExpiresIn = localStorage.getItem(EXPIRES_IN_KEY);
    var dateNow = Math.floor(Date.now() / 1000) + 60;
    var isExpired = dateNow > storedDate + storedExpiresIn;

    if (isExpired) {
      showLogin();
    }
    else {
      showRandomButton(storedAccessToken);
    }

  }

})();
