
function distanceXY(x0, y0, x1, y1) {
    this.dx = x1 - x0;
    this.dy = y1 - y0;

    return Math.sqrt(dx * dx + dy * dy);
}


function Clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
};


function circlePointCollision(x, y, vec, rad) {
    return distanceXY(x, y, vec.x, vec.y) < rad;
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
};

function randomRangeRound(min, max) {
    return Math.round(randomRange(min, max));
};

function frac(f) {
    return f % 1;
};

function Normalize(min, max, value) {
    return (value - min) / (max - min);
};

function Clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
};

function pointInRect(x, y, p1, p2) {
    //x range check
    //y range check
    //if both are true the point is inside the range

    return inRange(x, p1.x, p2.x) &&
        inRange(y, p1.y, p2.y);
};

function inRange(value, min, max) {

    //checks the ranges from x1 to x2 , returning true if the point is within range
    //Mathf.min and mathf.Max are used in the case of negetive values

    //Mathf.min is used when value is smallest value
    //instead of just checking value with min
    //and vice versa
    //if max is negetive it will be the smallest value istead
    return value >= Math.min(min, max) && value <= Math.max(min, max);
};

function GetMagnitude(vector) {
    return Math.sqrt((vector.x * vector.x) +
        (vector.y * vector.y) +
        (vector.z * vector.z));
}

function GetVectorNormalize(vector) {
    var mag = GetMagnitude(vector);

    return new THREE.Vector3(vector.x / mag, vector.y / mag, vector.z / mag);
}



function RingGeoCreate(ringData, centre, auScale) {
    geo = new THREE.Geometry();

    var gridY = 27;//numSegs || 10;

    var twopi = 2 * Math.PI;
    var iVer = Math.max(2, gridY);

    var origin = new THREE.Vector3(0, 0, 0);

    var first, second;

    for (var i = 0; i < (iVer); i++) {
        var v1 = returnOrbitionPosition(ringData, i, true, origin, false);
        var v2 = returnOrbitionPosition(ringData, i, false, origin, false);
        var v3 = returnOrbitionPosition(ringData, i + 1, true, origin, false);
        var v4 = returnOrbitionPosition(ringData, i + 1, false, origin, false);

        geo.vertices.push(v1);
        geo.vertices.push(v2);
        geo.vertices.push(v4);
        geo.vertices.push(v3);
    }

    for (var i = 0; i < iVer; i++) {
        geo.faces.push(new THREE.Face3(i * 4, i * 4 + 1, i * 4 + 2));
        geo.faces.push(new THREE.Face3(i * 4, i * 4 + 2, i * 4 + 3));

        geo.faceVertexUvs[0].push
            (
            [
                new THREE.Vector2(0, 1),
                new THREE.Vector2(1, 1),
                new THREE.Vector2(1, 0),
            ]
            );

        geo.faceVertexUvs[0].push
            (
            [
                new THREE.Vector2(0, 1),
                new THREE.Vector2(1, 0),
                new THREE.Vector2(0, 0),
            ]
            )
    }

    geo.computeFaceNormals();
    return geo;
}


/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 * source : https://gist.github.com/gre/1650294
 */
EasingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t * t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t * (2 - t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t * t * t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t) * t * t + 1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t * t * t * t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t * t * t * t * t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
}



