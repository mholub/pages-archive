require({
    baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: {
     'vendor/three': { exports: 'THREE' },
     'vendor/threex.windowresize': { exports: 'THREEx' },
     'vendor/FlyControls': {
        deps: ['vendor/three'],
        exports: 'THREE' },
     'vendor/stats': { exports: 'Stats' }
    }
}, [
    'vendor/three', 'vendor/threex.windowresize', 'vendor/stats', 'vendor/FlyControls'
], function(THREE, THREEx, Stats) {

var scene, renderer;
var winResize, controls, stats;
var camera, cameraParent;
var group;

var clock = new THREE.Clock();

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer( {
        antialias: true
    } );
    renderer.setClearColor(0xffe300, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);


    cameraParent = new THREE.Object3D();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 2;
    cameraParent.add(camera);
    winResize   = new THREEx.WindowResize(renderer, camera);

    controls = new THREE.FlyControls( cameraParent, renderer.domElement );
    controls.movementSpeed = 0;
    controls.rollSpeed = 0.2;
    
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffe300, 2, 5 );

    scene.add(cameraParent);

    group = new THREE.Object3D();
                group.position.y = 0;
                scene.add( group );

    var sqLength = 1;

    var squareShape = new THREE.Shape();
    squareShape.moveTo( -sqLength/2, -sqLength/2);
    squareShape.lineTo( -sqLength/2, sqLength/2 );
    squareShape.lineTo( sqLength/2, sqLength/2 );
    squareShape.lineTo( sqLength/2, -sqLength/2 );
    squareShape.lineTo( -sqLength/2, -sqLength/2 );

    var k = 5;
    for (var i = 0; i < 100; i++) {
        var x = THREE.Math.randFloat(-k, k);
        var y = THREE.Math.randFloat(-k, k);
        var z = THREE.Math.randFloat(-5, 0);
        var s = THREE.Math.randFloat(0, 0.2);
        var d = THREE.Math.randFloat(0.1, 2);

        addShape( squareShape, 0x000000, x, y, z, 0, 0, 0, s, d );
    }
}

// hard limit
function limitControls(target) {
    var l = 0.1;
    var k = 0.98;
    target.rotation.z = 0;

    if (Math.abs(target.rotation.x) > l) {
        target.rotation.x = k * target.rotation.x + (1 - k) * THREE.Math.sign(target.rotation.x) * l;
    }
    if (Math.abs(target.rotation.y) > l) {
        target.rotation.y = k * target.rotation.y + (1 - k) * THREE.Math.sign(target.rotation.y) * l;
    }
    // target.rotation.x = THREE.Math.clamp(target.rotation.x, -l, l);
    // target.rotation.y = THREE.Math.clamp(target.rotation.y, -l, l);
}

function addShape( shape, color, x, y, z, rx, ry, rz, s, d ) {
    var points = shape.createPointsGeometry();

    // flat shape

    var geometry = new THREE.ShapeGeometry( shape );

    var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: color } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    group.add( mesh );

    // solid line

    var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: 2 } ) );
    line.position.set( x, y, z - d );
    line.rotation.set( rx, ry, rz );
    line.scale.set( s, s, s );
    group.add( line );
}

function animate() {
    stats.begin();

    var delta = clock.getDelta();
    requestAnimationFrame(animate);

    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;
    controls.update( delta );
    limitControls(cameraParent, controls);

    renderer.render(scene, camera);

    stats.end();
}

});
