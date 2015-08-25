var map;
var newMarker = [];
var allMarkers = [];
var result;

$(document).ready(function() {

  if($('#scene').length) {
    $(this).find('#longitude').hide();
    $(this).find('#latitude').hide();
    var longitude = $(this).find('#longitude').text();
    var latitude = $(this).find('#latitude').text();
    loadMapProfile(latitude, longitude);
  }

  if($('#sceneNew').length) {
    $('#enterMovie').hide();
    $('#confirm-marker').hide();

    loadMap();
    autoCompleteGoogleMaps();
    getMarkers();

    $('#mapDestination').click(function(){
      $('#enterMovie').show('slow');
      $('#confirm-marker').show('slow');
    });

    $('#add-marker').click(function(){
      if ($('#enterDestination').val()) {
        $('#enterMovie').show('slow');
        $('#confirm-marker').show('slow');
      }
    });

    $('#submitDestination').click(function(){
      codeAddress();
    });

    $('#add-marker').click(function(){
      placeMarker(map.getCenter());
    });

    $('#confirm-marker').click(function(){
      confirmLocation(newMarker[0]);
    });

    $("#noResultsMsg").hide();

    $('#selectDBLocation').click(function(){
      selectDBLocation();
    });
  }

});

function addMovie() {
  var film = $('#enterMovie').val()
  var location = $('#location').text()
  if (film) {
    window.open("/movies/new?name=" + film + "&location=" + location, "_self")
  } else {
    $('body').append("Please enter a film")
  }
};

function acquireMovies() {
  var url = 'https://www.omdbapi.com/?s='
  var movieValue = document.getElementById("enterMovie").value
  $.getJSON(url + movieValue + '*', function (data) {
    var movieArray = data['Search'];
    var availableMovies = [];

    if (movieArray) {
      movieArray.forEach(function(movie) {
        availableMovies.push(movie['Title'] + ' (' + movie['Year'] + ')');
      });

      $("#enterMovie").autocomplete({
        source: availableMovies
      });
    }
  });
}

function loadMapProfile(latitude, longitude) {
  var myOptions2 = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var latlng = new google.maps.LatLng(latitude, longitude);
  map = new google.maps.Map(document.getElementById("mapDestination"), myOptions2);
  map.setCenter(latlng);
  map.setOptions({ draggableCursor: 'crosshair' });
  placeMarkerProfile(map.getCenter());
};

function placeMarkerProfile(location) {
  var marker = new google.maps.Marker({
    position: location,
    icon:'/images/clapper.png',
    animation: google.maps.Animation.DROP,
    map: map
  });
  google.maps.event.addListener(marker, 'mouseover', function() {
    this.setAnimation(google.maps.Animation.BOUNCE);
  });
  google.maps.event.addListener(marker, 'mouseout', function() {
    this.setAnimation(null);
  });
}

function loadMap() {
  var myOptions2 = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggableCursor: 'crosshair'
  };
  if(navigator.geolocation) {
    map = new google.maps.Map(document.getElementById("mapDestination"), myOptions2);
    navigator.geolocation.getCurrentPosition(function(position) {
      var initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
    });
  } else { // Browser doesn't support Geolocation
    var latlng = new google.maps.LatLng(51.517307, -0.073403);
    map = new google.maps.Map(document.getElementById("mapDestination"), myOptions2);
    map.setCenter(latlng);
  }
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });
}

function autoCompleteGoogleMaps() {
  var input = document.getElementById('enterDestination');
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  google.maps.event.addListener(autocomplete, 'place_changed', function () {
    var place = autocomplete.getPlace();
  });
}

function getMarkers() {
  var url = '/locations/api'
  $.getJSON(url, function (data) {
    allMarkers = data
  })
  .done(function() {
    allMarkers.forEach(function(marker) {
      var coords = new google.maps.LatLng(marker.latitude, marker.longitude)
        new google.maps.Marker({
        position: coords,
        icon:'/images/clapper.png',
        animation: google.maps.Animation.DROP,
        map: map
      });
    });
  })
}

function getAddress() {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='
  var lat = newMarker[0].position.G
  var lng = newMarker[0].position.K
  $.getJSON(url + lat + "," + lng + '&sensor=true', function (data) {
    result = data.results[0].formatted_address;
    document.getElementById("enterDestination").value = result;
  });
}

function codeAddress() {
  var geocoder = new google.maps.Geocoder();
  var sAddress = document.getElementById("enterDestination").value;
  geocoder.geocode( { 'address': sAddress}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      alert("Geocode failed for the following reason: " + status);
    }
  });
}

function removeMarker() {
  marker = newMarker.pop();
  marker.setMap(null);
};

function placeMarker(location) {
  if(newMarker.length > 0) {
    removeMarker();
  }
  var marker = new google.maps.Marker({
    position: location,
    icon:'/images/clapper.png',
    animation: google.maps.Animation.DROP,
    map: map
  });
  newMarker.push(marker)
  getAddress();
  google.maps.event.addListener(marker, 'mouseover', function() {
    this.setAnimation(google.maps.Animation.BOUNCE);
  });
  google.maps.event.addListener(marker, 'mouseout', function() {
    this.setAnimation(null);
  });
}

function confirmLocation(marker) {
  var film = document.getElementById('enterMovie').value;
  $.ajax({ url: '/scenes',
    type: 'POST',
    beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
    data: {
            "posa" : marker.position.G,
            "posf" : marker.position.K,
            "address" : result,
            "film" : film
          },
    success: function() {
      var url = "/scenes/api?posa=" + marker.position.G + "&posf=" + marker.position.K + "&address=" + result + "&film=" + film;
      $.getJSON(url, function(data) {
        var scene_id = data['id'];
        window.open(scene_id + "/visits/new", "_self")
      });
    }
  });
}

function acquireDBLocations() {
  $("#noResultsMsg").fadeOut(500);
  var url = '/locations/api'
  var locationDBValue = document.getElementById("enterDBLocation").value
  $.getJSON(url, function (data) {
    var DBlocationArray = data;
    var availableDBLocations = [];
    if(DBlocationArray) {
      DBlocationArray.forEach(function(DBlocation) {
        availableDBLocations.push(DBlocation['address']);
      });
      $("#enterDBLocation").autocomplete({
        source: availableDBLocations
      });
    }
  })
}

function selectDBLocation() {
  var url = '/locations/api'
  var DBlocationValue = document.getElementById('enterDBLocation').value
  $.getJSON(url, function (data) {
    var DBlocationArray = data;
    var matches = []
    if(DBlocationArray) {
      DBlocationArray.forEach(function(DBlocation) {
        if(DBlocation['address'] === DBlocationValue) {
          window.open('/locations/' + DBlocation['id'] + '/scenes','_self')
          matches.push('1');
        };
      });
    }
    if(matches.length === 0) {
      $("#noResultsMsg").fadeIn(500);
    }
  });
}
