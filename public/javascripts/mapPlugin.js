if (document.querySelector("#map-canvas")) {
    var map;
    var markers = {};
    var infowindows = {};
    
    initializeMap();
    markResults();
}

function initializeMap() {
    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(48.3, 4.08333)
    };
    if (document.querySelector("#map-canvas")) {
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    }
}

function markResults() {
    if (map === undefined) {
        return;
    }

    if (geocoder === undefined) {
        geocoder = new google.maps.Geocoder();
    }

    var pin_url1 = "http://labs.google.com/ridefinder/images/mm_20_red.png";
    var pin_image1 = new google.maps.MarkerImage(pin_url1, 
        new google.maps.Size(25, 36),
        new google.maps.Point(0,0)
        // new google.maps.Point(10, 36)
    );

    var pin_url2 = "http://labs.google.com/ridefinder/images/mm_20_green.png";
    var pin_image2 = new google.maps.MarkerImage(pin_url2, 
        new google.maps.Size(25, 36),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 36)
    );


    $.getJSON(window.location.pathname + '/json', function(resultObj) {
        if (resultObj.status == 1) {
            $.getJSON('/queries/' + resultObj.query_id + '/json', function(queryObj) {
                displayStriped(queryObj, false);
            });
        }
        else {
            displayStriped({}, true);
        }
        $.each(resultObj.results, function(index, groups) {
                $.each(groups, function(i, pairs) {
                    setTimeout(function() {
                        if (pairs.length == 0) {
                            return;
                        }
                        for (var index=0; index<pairs.length; index++) {
                            var pair = pairs[index];
                            if (typeof(pair.tweets) == 'undefined' || typeof(pair.tweets) !== 'object') {
                                return;
                            }
                            var lat1 = pair.tweets[0][0].lat;
                            var lng1 = pair.tweets[0][0].lng;

                            var lat2 = pair.tweets[0][1].lat;
                            var lng2 = pair.tweets[0][1].lng;

                            var markers1 = new google.maps.Marker({
                                position: new google.maps.LatLng(lat1, lng1),
                                map: map,
                                // title: pair.users[0][0],
                                icon: pin_image1
                            });
                            var marker2 = new google.maps.Marker({
                                position: new google.maps.LatLng(lat2, lng2),
                                map: map,
                                // title: pair.users[0][1],
                                icon: pin_image1
                            });
                            var lineCoordinates = [
                                new google.maps.LatLng(lat1, lng1),
                                new google.maps.LatLng(lat2, lng2)
                            ];
                            var linePath = new google.maps.Polyline({
                                path: lineCoordinates,
                                strokeColor: "2ECCFA",
                                strokeOpacity: 0.7,
                                strokeWeight: 4
                            });
                            linePath.setMap(map);
                        }
                    }, 1000 * i);
                });
        });
    }, 'json');
}

function displayStriped(queryObj, finished) {
    var content = '';
    if (!finished) {
        var until = new Date(queryObj.end_date).setHours(new Date(queryObj.end_date).getHours(), new Date(queryObj.end_date).getMinutes() + 5);
        var until = new Date(until);
        content += '<div class="alert alert-info">Still in process until ' + until + '</div>';
        content += '<div class="progress progress-striped active">';
        content += '<div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">';
        content += '<span class="sr-only">45% Complete</span>';
        content += '</div></div>';
    }
    else {
        content += '<div class="alert alert-info"> - Finished - </div>';
    }
    $('.info-box').html(content);
}