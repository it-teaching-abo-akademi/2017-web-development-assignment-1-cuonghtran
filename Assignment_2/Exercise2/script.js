var map;

$(document).ready(function(){
	$("#btnSearch").on("click", function(){
		let selectedCountry = $("#selectCountry").find(":selected").val();
		let zipCode = $("#txtZip").val();

		// call the Zippopotam API to get places
		$.ajax({
			url: "https://api.zippopotam.us/" + selectedCountry + "/" + zipCode,
			dataType: "json",
			type: "GET",
			success: function(data) {
				// repopulate the result table
				$("div.table").remove();
				// populate places result
				let places = data["places"]
				let lastLatLng;
				places.forEach(place => {
					$('#placeResult').append(
						$('<div class="col-12 table">').append(
							$('<div class="cell">').append(place["place name"]),
							$('<div class="cell">').append(place["longitude"]),
							$('<div class="cell">').append(place["latitude"])
						)
					)

					// add markers on map
					let latLng = new google.maps.LatLng(place["latitude"], place["longitude"]);
					lastLatLng = latLng;
                    let marker = new google.maps.Marker({
                        position: latLng,
                        map: map
                    });
				});
				map.panTo(lastLatLng);

				// store the result into local storage
				storeSearchHistory($("#selectCountry").find(":selected").text() + ";" + zipCode);
				// repopulate search history
				populateSearchHistory();

				// refresh fields
				$("#selectCountry").val($("#selectCountry option:first").val());
				$("#txtZip").val("");
			},
			error: function() {
				alert('Choose another zip code!');
			}
		});
	});

	//populate the search history on load
	populateSearchHistory();
});

function initMap() {
	/* initialize the map */
	let mapCanvas = $("#map")[0];
	let mapOptions = {
		center: new google.maps.LatLng(60.4508869,22.2664146),
		zoom: 12,
		mapTypeId: 'terrain'
	};
	map = new google.maps.Map(mapCanvas, mapOptions);
}

function storeSearchHistory(value) {
	// may need to turn off 'Block third-party cookies' on browser to use webstorage
	try {
		if (typeof(Storage) !== "undefined") {
			let timeNow = new Date().getTime();
			let key = timeNow.toString();
			localStorage.setItem("date-" + key, value);
		}
	}
	catch(e) {
		alert("Allow this site to save and read cookies to use webstorage");
	}
}

function getSearchHistory() {
	if (typeof(Storage) !== "undefined") {
		let history = []
		let keys = Object.keys(localStorage);
		keys = keys.map(function(key) {
			if (key.indexOf("date-") > -1) {
				return key.split("-")[1];
			}
		});
		keys.sort(function(a, b) {return b-a});
		let i = 0;
		while(i < keys.length && i <= 9) {
			let historyString = localStorage["date-" + keys[i]];
			history.push(historyString);
			i++;
		}

		return history;
	}
	return null;
}

function populateSearchHistory() {
	// remove currrent history to display a new one
	$("#listHistory > li").remove();
	let searchHistory = getSearchHistory();
	searchHistory.forEach(element => {
		let parts = element.split(";");
		$("#listHistory").append(
			$("<li>").append(parts[0] + " - " + parts[1])
		);
	});
}
