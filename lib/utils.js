if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {
                return i;
            }
        }
        return -1;
    };
}


exports.getAround = function(source, raidus) {
    var latitude = source[1];
    var longitude = source[0];

    var degree = (24901*1609)/360.0;
    var raidusMile = raidus * 1000;

    var dpmLat = 1/degree;
    var radiusLat = dpmLat*raidusMile;
    var minLat = latitude - radiusLat;
    var maxLat = latitude + radiusLat;

    var mpdLng = degree*Math.cos(latitude * (Math.PI/180));
    var dpmLng = 1 / mpdLng;
    var radiusLng = dpmLng*raidusMile;
    var minLng = longitude - radiusLng;
    var maxLng = longitude + radiusLng;

    var around = {
        minLat: minLat,
        minLng: minLng,
        maxLat: maxLat,
        maxLng: maxLng
    }
    return around;
}


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

/*
 * list format:
 * {users: [u_user, v_user], tweets: [[u_tweet, v_tweet]]}
 * element format:
 * {u: tweet, v: tweet, d: distance}
 */
exports.checkUserExisting = function checkExisting(element, list) {
    if (list.length === 0) {
        return -1;
    }
    for (var index=0; index<list.length; index++) {
        if (this.compareArrays(list[index].users, [element.u.content.user.id, element.v.content.user.id])) {
            return index;
        }
    }
    return -1;
}

/*
 *  list = [[t1, t2]]
 *  element format:
 * {u: tweet, v: tweet, d: distance}
 */
exports.checkTweetExisting = function(element, list) {
    for (var index=0; index<list.length; index++) {
        if (this.compareArrays(
            [list[index][0].id.toString(), list[index][1].id.toString()],
            [element.u._id, element.v._id]
        )) {
            return 1;
        }
    }
    return -1;
}

// Only one dimension
exports.compareArrays = function (arr1, arr2, field) {
    if (!arr1 || !arr2) {
        return false;
    }

    if (arr1.length != arr2.length) {
        return false;
    }

    for (var i=0; i<arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) == -1) {
            return false
        }
    }

    return true;
}