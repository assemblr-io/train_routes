


var Ireland = 'Flinders Street Station, Victoria, Australia';
var origin = 'Flinders Street Station, Victoria, Australia';
var destination = 'Windsor Train Station, South Yarra, Victoria';
var latLngArray = [];
var directionDisplay;
var directionsService;
var map;
var enviro='UAT'

function loadScript() {
  var API_KEY = enviro== 'UAT' ? "AIzaSyBimsO-5HTfzRdKwgBin2iLWaHX5ubokuk" : config.MAPS_PRIVATE_API_KEY
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&callback=initialize";
  document.body.appendChild(script);
}
window.onload = loadScript;

function initialize() {
  directionsService = new google.maps.DirectionsService();

  directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: false
  });
  starting_loc = new google.maps.LatLng(-37.81140248999094, 144.96189031993913);
  var myOptions = {
      zoom: 13,
      center: starting_loc,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
  }

  map = new google.maps.Map(document.getElementById("map"), myOptions);
  directionsDisplay.setMap(map);

}

function calcRoute(orig, dest, wayPts) {

  //departure time needed to stop it using the current time to calc routes which ignore trains if they're not running!
  var request = {
      origin: orig,
      destination: dest,
      //waypoints arent allowed it turns out for TRANSIT travelModes! can stull use the lat lng to place icon if i want too on those stations.
      // waypoints: wayPts,
      travelMode: google.maps.DirectionsTravelMode.TRANSIT,
      transitOptions: {
        departureTime: new Date('December 13, 2021 07:00:00'),
        modes: ['TRAIN'],
        routingPreference: 'FEWER_TRANSFERS'}
  };

  directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          var route = response.routes[0];
      }
  });
}

function createMarker(latlng) {

  var marker = new google.maps.Marker({
      position: latlng,
      map: map
  });
}


