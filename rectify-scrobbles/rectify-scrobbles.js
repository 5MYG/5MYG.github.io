(function() {

	function getParams() {
		var hashParams = {};
		var e, r = /([^&;=]+)=?([^&;]*)/g,
		q = window.location.search.substring(1);
		while ( e = r.exec(q)) {
			hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
	}


	// function getPlaylists(access_token, limit, offset) {
	// 	return $.ajax({
	// 		url: "https://api.spotify.com/v1/me/playlists",
	// 		headers: { 'Authorization': 'Bearer ' + access_token },
	// 		data: { limit: limit, offset: offset }
	// 	});
	// }

	var params = getParams();
	var token = params.token;

	console.log(params);

	$("#login-button").click(function() {
		var url = 'http://www.last.fm/api/auth/';
		url += '?api_key=70a02ea8943eb91825150b7e4dd6a657';
		// url += '&&cb=http://example.com';
		window.location.href = url;
	});



  $.getJSON("http://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=the_vein&api_key=70a02ea8943eb91825150b7e4dd6a657&limit=10&format=json", function(json) {
      var result = '';

			console.log( json );

      $.each(json.topartists.artist, function(i, item) {
          result += "<p><a href=" + item.url + " target='_blank'>" + item.name + " - " + "Play count : " +item.playcount + "</a></p>";
      });
      $('#result').append(result);
  });


})();
