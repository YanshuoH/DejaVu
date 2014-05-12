exports.getDistance = function(source, target) {
    var R = 6371;
    var dLat = deg2rad(target.lat - source.lat);
    var dLng = deg2rad(target.lng - source.lng);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(source.lat)) * Math.cos(deg2rad(target.lat)) *
        Math.sin(dLng/2) * Math.sin(dLng/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km

    return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}