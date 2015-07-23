function circlePoint(radius, nangle) { // angle is [0, 1]
  return new THREE.Vector3(radius * Math.cos(nangle * 2 * Math.PI), radius * Math.sin(nangle * 2 * Math.PI), 0);
}

function circlePoint2(radius, xangle, yangle) { // angle is [0, 1]
  return new THREE.Vector3(radius * Math.cos(xangle * 2 * Math.PI), radius * Math.sin(yangle * 2 * Math.PI), 0);
}

function updatePoints(geometry, data) {
  for ( i = 0; i < geometry.vertices.length; i ++ ) {
    var t = i / (geometry.vertices.length - 1);
    var p = data.getPosition(t);

    geometry.vertices[i] = p;
  }
  geometry.verticesNeedUpdate = true;
}

function Figure1Data() {
  this.primCount = 40; // how many shapes (ex: triangles)
  this.radius = 0.8; // main circle radius (which connects centers of shapes)
  this.phaseOffset = 0;
  this.primPointsCount = 8; // how many points in shape (3 for triangle)
  this.primRadius = 0.6;
  this.primPhaseOffset = 0.0;
  this.orientPrims = true;
  this.distortCorners = true;

  this.getPosition = function(t) {
    var primNum = Math.floor(t * this.primCount); // index of figure (triangle, pentagon, etc) [0, primCount]
    var nt = t * this.primCount - primNum; // normalized t inside the figure [0, 1]

    var primPhase = primNum / this.primCount + this.phaseOffset;
    var centerOfPrim =  circlePoint(this.radius, primPhase);

    var primPointNum = Math.floor(nt * this.primPointsCount);


    var k = 0 + primNum;//primNum + 5;
    var pointNT = nt * this.primPointsCount - primPointNum;

    var prevPointInPrim = circlePoint(this.primRadius, (primPointNum + k) / this.primPointsCount
     + (this.orientPrims ? primPhase + 0.5 : 0) + this.primPhaseOffset);
    var nextPointInPrim = circlePoint(this.primRadius, (primPointNum + 1 + k) / this.primPointsCount
    + (this.orientPrims ? primPhase + 0.5 : 0) + this.  primPhaseOffset);

    if (this.distortCorners) {
      if (pointNT <= 1 / this.primPointsCount) {
        pointNT += 0.02;
      } else if (pointNT > 1 - 1 / this.primPointsCount) {
        pointNT -= 0.2;
      }
    }

    var pointInPrim = new THREE.Vector3();
    pointInPrim.lerpVectors(prevPointInPrim, nextPointInPrim, pointNT);

    var p = new THREE.Vector3();
    p.addVectors(centerOfPrim, pointInPrim);
    return p;
  }
  this.animate = function(time) {
    this.primPhaseOffset = 0.1 * time;
    this.phaseOffset = 0.1 * time;
    this.radius = Math.sin(0.3 * time);
    this.primRadius = 0.2 + 0.6 * Math.cos(0.1 * time);
  }
}

function Figure3Data() {
  this.primCount = 3; // how many shapes (ex: triangles)
  this.radius = 1; // main circle radius (which connects centers of shapes)
  this.phaseOffset = 0;
  this.primPointsCount = 100; // how many points in shape (3 for triangle)
  this.primRadius = 0.15;
  this.primPhaseOffset = 0.0;
  this.orientPrims = true;
  this.distortCorners = true;

  this.getPosition = function(t) {
    var primNum = Math.floor(t * this.primCount); // index of figure (triangle, pentagon, etc) [0, primCount]
    var nt = t * this.primCount - primNum; // normalized t inside the figure [0, 1]

    var primPhase = primNum / this.primCount + this.phaseOffset;
    var centerOfPrim =  circlePoint(this.radius, primPhase);

    var primPointNum = Math.floor(nt * this.primPointsCount);

    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle( centerOfPrim, -Math.PI/2 + 2 * Math.PI * this.phaseOffset );

    var quaternion2 = new THREE.Quaternion();
    quaternion2.setFromAxisAngle( new THREE.Vector3(0, 0, 1), -Math.PI/2 );

    nt += this.primPhaseOffset;

    var pointInPrim = circlePoint(this.primRadius * Math.cos(this.primPointsCount * nt) + 0.1 * Math.cos(this.phaseOffset), nt);
    pointInPrim.setZ(0.8 * Math.cos(this.primPointsCount * nt));
    pointInPrim.applyQuaternion(quaternion);
    pointInPrim.applyQuaternion(quaternion2);

    var p = new THREE.Vector3();
    p.addVectors(centerOfPrim, pointInPrim);
    return p;
  }
  this.animate = function(time) {

    this.primPhaseOffset = -0.15;
    this.phaseOffset = 0.1 * time;
    this.radius = Math.sin(0.3 * time);
    this.primRadius = 0.2 + 0.6 * Math.cos(0.1 * time);
    var primPointCounts = [3, 4, 5, 8, 10];
    var period = Math.ceil(time / 3) % primPointCounts.length;

    this.primCount = primPointCounts[period];
    this.primPointsCount = 10 * primPointCounts[period];
  }
}

// Figure presets
LissajousNgons1 = new Figure1Data();

// this.primCount = 40; // how many shapes (ex: triangles)
// this.radius = 0.8; // main circle radius (which connects centers of shapes)
// this.phaseOffset = 0;
// this.primPointsCount = 8; // how many points in shape (3 for triangle)
// this.primRadius = 0.6;
// this.primPhaseOffset = 0.0;

LissajousNgons2 = new Figure1Data();
LissajousNgons2.primCount = 6;
LissajousNgons2.primPointsCount = 4;
LissajousNgons2.radius = 0.5;
LissajousNgons2.primRadius = 0.6;
LissajousNgons2.orientPrims = false;
LissajousNgons2.distortCorners = false;
LissajousNgons2.animate = function(time) {
  this.primPhaseOffset = 0.03 * time;
  this.phaseOffset = 0.25 * time;
  this.primRadius = 0.6 * Math.cos(0.4 * time);

  var primPointCounts = [3, 4, 5, 8, 10];
  var period = Math.ceil(time / 3) % primPointCounts.length;

  this.primPointsCount = primPointCounts[period];
  this.primCount = 2 * primPointCounts[period];
}

LissajousNgons3 = new Figure3Data();
