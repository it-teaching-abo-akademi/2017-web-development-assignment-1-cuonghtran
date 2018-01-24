var foliGtfsApiUrl = "https://data.foli.fi/gtfs/v0/20180117-130104";
var map;
var drivingRoute;
var shapesList = [];
var markers = [];

$(document).ready(function(){
	/* retrieve list of bus routes from foli */
	$.ajax({
		url: foliGtfsApiUrl + "/routes",
		dataType: "json",
		type: "get",
		success: function(data) {
			$.each(data, function(i, item) {
				$("#selectBusLine").append(
					$("<option>", {
						value: item["route_id"],
						text: item["route_short_name"] + " " + item["route_long_name"]
					})
				)
			});
		},
		error: function() {

		}
	});

	$("#btnShowRoute").on("click", function() {
		var routeId = $("#selectBusLine").find(":selected").val();
		var routeCoordinates = {};

		// clear the previous route
		if (drivingRoute !== undefined)
			drivingRoute.setMap(null);
		shapesList = [];

		// get list of trips of the selected route
		$.ajax({
			url: foliGtfsApiUrl + "/trips/route/" + routeId,
			dataType: "json",
			type: "get",
			success: function(data) {
				// get list of shape id from the trips
				$.each(data, function(i, item) {
					if (jQuery.inArray(item["shape_id"], shapesList) === -1)
						shapesList.push(item["shape_id"]);
				});
				
				// use the first shape to get driving route
				$.ajax({
					url: foliGtfsApiUrl + "/shapes/" + shapesList[0],
					type: "get",
					dataType: "json",
					success: function(data) {
						routeCoordinates = data.map(function(item) {
							return {
								lat: item["lat"],
								lng: item["lon"]
							}
						});
						
						// draw the route on map
						drivingRoute = new google.maps.Polyline({
							path: routeCoordinates,
							geodesic: true,
							strokeColor: '#FF0000',
							strokeOpacity: 1.0,
							strokeWeight: 2
						});
						var latLng = new google.maps.LatLng(routeCoordinates[0]["lat"], routeCoordinates[0]["lng"]);
						map.panTo(latLng);
						drivingRoute.setMap(map);
					}
				});
			}
		});
	});

	$("#btnShowBuses").on("click", function() {
		var busLineName = $("#selectBusLine").find(":selected").text();
		var lineShortName = busLineName.split(" ")[0];
		deleteMarkers();
		getBusesByLineName(lineShortName);
	});

	$("#btnRefresh").on("click", function() {
		var busLineName = $("#selectBusLine").find(":selected").text();
		var lineShortName = busLineName.split(" ")[0];
		deleteMarkers();
		getBusesByLineName(lineShortName);
	});
});

function initMap() {
	/* initialize the map */
	var mapCanvas = $("#map")[0];
	var mapOptions = {
		center: new google.maps.LatLng(60.4508869,22.2664146),
		zoom: 12,
		mapTypeId: 'terrain'
	};
	map = new google.maps.Map(mapCanvas, mapOptions);
}

function getBusesByLineName(lineName) {
	var busesCoords = [];
	$.ajax({
		url: "https://data.foli.fi/siri/vm",
		type: "get",
		dataType: "json",
		success: function(data) {
			if (data["status"] === "OK") {
				var vehicles = data["result"]["vehicles"];
				if (vehicles) {
					$.each(vehicles, function(i, item) {
						if (item["publishedlinename"] === lineName)
							busesCoords.push({"lat": item["latitude"], "lng": item["longitude"]})
					});
				}
				
				if (busesCoords.length > 0) {
					busesCoords.forEach(bus => {
						let latLng = new google.maps.LatLng(bus["lat"], bus["lng"]);
						lastLatLng = latLng;
						let marker = new google.maps.Marker({
							position: latLng,
							map: map
						});
						markers.push(marker);
					});
				}
			}
		}
	})
}

function deleteMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}
