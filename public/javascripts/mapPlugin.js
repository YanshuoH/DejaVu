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

    var pin_url1 = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569";
    var pin_image1 = new google.maps.MarkerImage(pin_url1, 
        new google.maps.Size(25, 36)
        // new google.maps.Point(0,0)
        // new google.maps.Point(10, 36)
    );

    // var pin_url2 = "http://labs.google.com/ridefinder/images/mm_20_green.png";
    // var pin_image2 = new google.maps.MarkerImage(pin_url2, 
    //     new google.maps.Size(25, 36),
    //     new google.maps.Point(0,0),
    //     new google.maps.Point(10, 36)
    // );

    var path = window.location.pathname.split('/');
    path[path.length-1] = 'json';
    path = path.join('/');
    $.getJSON(path, function(resultObj) {
        if (resultObj.status == 1) {
            $.getJSON('/queries/' + resultObj.query_id + '/json', function(queryObj) {
                displayStriped(queryObj, false);
            });
        }
        else {
            displayStriped({}, true);
        }
        var infowindows = [];
        var markers = [];
        $.each(resultObj.results, function(result_index, groups) {
            $.each(groups.groups, function(index, pair) {
                if (typeof(pair.tweets) == 'undefined' || typeof(pair.tweets) !== 'object') {
                    return;
                }
                var tweet1 = pair.tweets[0][0];
                var lat1 = tweet1.lat;
                var lng1 = tweet1.lng;

                var tweet2 = pair.tweets[0][1];
                var lat2 = tweet2.lat;
                var lng2 = tweet2.lng;

                var marker1 = new google.maps.Marker({
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

                if (markers[tweet1.id] === undefined) {
                    markers[tweet1.id] = {};
                }
                markers[tweet1.id] = marker1;
                if (markers[tweet2.id] === undefined) {
                    markers[tweet2.id] = {};
                }
                markers[tweet1.id] = marker2;

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

                var infowindows1 = new google.maps.InfoWindow({
                    content: '<div><p>' + tweet1.text + '</p></div>'
                });
                var infowindows2 = new google.maps.InfoWindow({
                    content: '<div><p>' + tweet2.text + '</p></div>'
                });

                if (infowindows[tweet1.id] === undefined) {
                    infowindows[tweet1.id] = {}
                }
                infowindows[tweet1.id] = infowindows1;

                if (infowindows[tweet2.id] === undefined) {
                    infowindows[tweet2.id] = {}
                }
                infowindows[tweet2.id] = infowindows2;
                google.maps.event.addListener(markers[tweet1.id], 'click', function() {
                    infowindows[tweet1.id].open(map, markers[tweet1.id]);
                });
                google.maps.event.addListener(markers[tweet2.id], 'click', function() {
                    infowindows[tweet2.id].open(map, markers[tweet2.id]);
                });
            });
        });
    }, 'json');
}

function displayStriped(queryObj, finished) {
    var content = '';
    if (!finished) {
        if (new Date(queryObj.end_date) > new Date()) {
            var until = new Date(queryObj.end_date).setHours(new Date(queryObj.end_date).getHours(), new Date(queryObj.end_date).getMinutes() + 5);
            var until = new Date(until);
            content += '<div class="alert alert-info">Still in process until ' + until + '</div>';
        }
        else {
            content += '<div class="alert alert-info">Still in process, plase wait about 5 minutes</div>';
        }

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