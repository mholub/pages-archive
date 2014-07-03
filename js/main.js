require({
    baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: {
     'vendor/three': { exports: 'THREE' },
     'vendor/threex.windowresize': { exports: 'THREEx' },
     'vendor/FlyControls': {
        deps: ['vendor/three'],
        exports: 'THREE' },
     'vendor/stats': { exports: 'Stats' },
     'other/OBJLoader': {
        deps: ['vendor/three'],
        exports: 'THREE' },
    'other/ColladaLoader': {
        deps: ['vendor/three'],
        exports: 'THREE' },
 }
}, [
    'vendor/three', 'vendor/threex.windowresize', 'vendor/stats', 'vendor/FlyControls',
    'other/OBJLoader', 'other/ColladaLoader'
], function(THREE, THREEx, Stats) {

var textures = {};
var skills = [];

var scene, renderer;
var winResize, controls, stats;
var camera;
var group, uiGroup;

// ui
var logo, header;

// interaction
var mouse = new THREE.Vector2();
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();

// other
var clock = new THREE.Clock();

preloadAssets();
animate();

function preloadAssets() {
    var openGLTex = THREE.ImageUtils.loadTexture( 'images/opengl.png', THREE.UVMapping, function() {
    } );
    openGLTex.magFilter = THREE.NearestFilter;
    openGLTex.minFilter = THREE.NearestFilter;
    openGLTex.generateMipmaps = false;
    textures.opengl = openGLTex;

    var openGLTex2 = THREE.ImageUtils.loadTexture( 'images/opengl2.png', THREE.UVMapping, function() {
    } );
    openGLTex2.magFilter = THREE.NearestFilter;
    openGLTex2.minFilter = THREE.NearestFilter;
    openGLTex2.generateMipmaps = false;
    textures.opengl2 = openGLTex2;
    init();
}

function init() {
    renderer = new THREE.WebGLRenderer( {
        antialias: true
    } );
    renderer.setClearColor(0xffe300, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    //renderer.setFaceCulling(THREE.CullFaceBack);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);


    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = 2;
    winResize   = new THREEx.WindowResize(renderer, camera);
    
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffe300, 2, 5 );

    group = new THREE.Object3D();
                    group.position.y = 0;
                    scene.add( group );

    initUI();
    initHeader();
    initSkills();

    controls = new THREE.FlyControls( group, renderer.domElement );
    controls.movementSpeed = 0;
    controls.rollSpeed = -0.2;

    initAmbientShapes();

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'click', onDocumentClick, false );
}

function onDocumentMouseMove( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentClick( event ) {
    event.preventDefault();

    checkInteraction(function(obj) {
        console.log('click', obj);
        if (obj.name === 'logo') {
            //document.location.href = 'http://interactivelab.ru';
            blowSkill(skills[0]);
            blowSkill(skills[1]);
            blowSkill(skills[2]);
        }
    });
}

function initHeader() {
    header = new THREE.Object3D();
    header.name = 'header';
    header.position.y = 0.6;
    header.position.z = 0.5;
    header.scale.set(0.0007, 0.0007, 0.0007);
    uiGroup.add( header );

    var loader = new THREE.JSONLoader();
    loader.load( 'models/header2.js', function ( geometry ) {
        var piece = new THREE.Line(geometry, new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 2, wireframe: true } ), THREE.LineStrip);
        header.add(piece);
        console.log('header loaded');
    } );
}

function initSkills() {
    var loader = new THREE.ColladaLoader();
    loader.load( 'models/grid.dae', function ( collada ) {
        skills = [];

        var gridObj = collada.scene.children[0];
        gridObj.position.z = 0.5;

        gridObj.rotation.x = Math.PI/2;
        gridObj.rotation.y = Math.PI/2;

        var k = 0.03;
        gridObj.scale.set(k, k, k);

        console.log(gridObj);

        for (var i = 0; i < 3; i++) {
            var cs = gridObj.clone();
            cs.userData.alive = false;

            var mat = new THREE.MeshBasicMaterial( { color: new THREE.Color().setHSL(THREE.Math.randFloat(0, 1), 1, 0.5), transparent: true } );
             //mat.color = 0x000000;
            console.log(mat);
            mat.map = THREE.Math.randFloat(0, 1) > 0.5 ? textures.opengl : textures.opengl;
            cs.userData.sharedMaterial = mat;
            setSkillMaterial(cs, mat);
            cs.position.x = -1 + i * 1;
            cs.position.z = 0.5 + 0.0001 * i; // avoid z-fighting
            skills.push(cs);
            uiGroup.add(cs);

            for (var l = cs.children.length - 1; l >= 0; l--) {
                var c = cs.children[l];
                c.userData.origPos = c.position.clone();
                c.userData.acceleration = new THREE.Vector3();
                c.userData.velocity = new THREE.Vector3();
            }
        }
    } );
}

function updateSkills(delta) {
    for (var i = skills.length - 1; i >= 0; i--) {
        var skill = skills[i];
        var reallyAlive = false;
        var readyToSwap = 0;
        if (skill.userData.alive) {
           // skill.userData.sharedMaterial.opacity -= 0.05;          
            for (var l = skill.children.length - 1; l >= 0; l--) {
                var p = skill.children[l];

                    reallyAlive = true;
                    p.userData.velocity.add(p.userData.acceleration.clone().multiplyScalar(delta));
                    //p.userData.velocity.multiplyScalar(0.95);
                    p.position.add(p.userData.velocity.clone().multiplyScalar(delta));

                    if (p.position.distanceTo(p.userData.origPos) > 30) {
                        //p.userData.velocity.set(0, 0, 0);
                        readyToSwap+=1;

                        p.userData.acceleration.set(0, 0, 0);
                    }
                    if (p.userData.acceleration.lengthSq() < 1) {
                        p.userData.velocity.multiplyScalar(0.8);
                        if (p.userData.velocity.lengthSq() < 0.001) {
                            p.position.lerp(p.userData.origPos, 0.2);
                        }
                    }
                             
            }
            // if (readyToSwap > 200 && skill.userData.state === 'blowStart') {
            //     skill.userData.state = 'blowSwap';        
            //     skill.userData.sharedMaterial.map = 
            //       skill.userData.sharedMaterial.map === textures.opengl ? textures.opengl2 : textures.opengl;
            // } else if (skill.userData.state === 'blowSwap') {
            //     skill.userData.sharedMaterial.opacity += 0.1;          
            // }
            if (!reallyAlive) {
               // console.log('Turn off alive', skill);
                //skill.userData.alive = false;
            }
        }
    }
}

function blowSkill(skill) {
    skill.userData.alive = true;
    skill.userData.state = 'blowStart';
    for (var l = skill.children.length - 1; l >= 0; l--) {
        var p = skill.children[l];
        var v = new THREE.Vector3( THREE.Math.randFloatSpread(50), 0, THREE.Math.randFloatSpread(50) )
        .normalize();
        v.multiplyScalar(THREE.Math.randFloat(40, 50));
        v.y = THREE.Math.randFloatSpread(30);
        p.userData.velocity = v.clone();
        p.userData.acceleration = v.clone();
        // setTimeout(function() {
        //     console.log('Fire', p);
            
        // }, l * 10);
    }
    console.log('Blow: ', skill);
}

function setSkillMaterial(skill, mat) {
    skill.traverse(function(obj) {
        if (obj instanceof THREE.Mesh) {
            obj.material = mat;
        }
    });
}

function initAmbientShapes() {
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
        var sx = THREE.Math.randFloat(0, 0.2);
        var sy = sx + THREE.Math.randFloat(0, 0.2);
        var ss = THREE.Math.randFloat(0, 1);
        var d = THREE.Math.randFloat(0.05, 0.2);
        var flat = THREE.Math.randFloat(0, 1) > 0.3;

        if (ss > 0.8) {
            addShape( squareShape, 0x000000, x, y, z, 0, 0, 0, sx, sy, d, flat );
        } else {
            addShape( squareShape, 0x000000, x, y, z, 0, 0, 0, sx, sx, d, flat );
        }
    }
}

function initLogo() {
    var logoTexture = THREE.ImageUtils.loadTexture( 'images/logo.png', THREE.UVMapping, function() {
        console.log('Logo loaded');
        var geometry = new THREE.PlaneGeometry( 0.222, 0.022 );
        //var geometry = new THREE.BoxGeometry( 0.222, 0.022, 0.022 );
        var materialLogo = new THREE.MeshBasicMaterial( { color: 0xffe300, map: logoTexture } );
        logo = new THREE.Mesh( geometry, materialLogo );
        logo.name = 'logo';
        logo.position.set(0, 0, 0);
        logo.position.y = -0.8;
        logo.position.z = 0.5;
        logo.scale.set(2, 2, 2);
        //logo.scale.set(5, 5, 5);
        uiGroup.add(logo);
    } );
}

function initUI() {
    uiGroup = new THREE.Object3D();
    uiGroup.name = 'UI';
    scene.add(uiGroup);
    console.log('uiGroup', uiGroup);

    initLogo();
    initHeader();
}

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

    target.rotation.x = THREE.Math.clamp(target.rotation.x, -5 * l, 5 * l);
    target.rotation.y = THREE.Math.clamp(target.rotation.y, -5 * l, 5 * l);
}

function addShape( shape, color, x, y, z, rx, ry, rz, sx, sy, d, flat ) {
    var points = shape.createPointsGeometry();

    // flat shape

    if (flat) {
        var geometry = new THREE.ShapeGeometry( shape );

        var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: color } ) ] );
        mesh.position.set( x, y, z );
        mesh.rotation.set( rx, ry, rz );
        mesh.scale.set( sx, sy, 1 );
        group.add( mesh );
    }
    

    // solid line

    var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: 2 } ) );
    line.position.set( x, y, z - d );
    line.rotation.set( rx, ry, rz );
    line.scale.set( sx, sy, 1 );
    group.add( line );
}

function checkInteraction(callback, noCallback) {
    //console.log('checking');

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( uiGroup.children );

    if ( intersects.length > 0 ) {
        // if (intersects[0].object !== uiGroup) {
             callback(intersects[0].object);
        // }
    } else {
        if (noCallback) {
            noCallback();
        }
    }
}

function animate() {
    stats.begin();
    var delta = clock.getDelta();

    updateSkills(delta);

    requestAnimationFrame(animate);

    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;
    controls.update( delta );
    limitControls(group, controls);

    var k = 0.05;
    var s = 0.2;
    uiGroup.rotation.set(uiGroup.rotation.x * (1 - k) + s * k * group.rotation.x,
        uiGroup.rotation.y * (1 - k) + s * k * group.rotation.y,
        uiGroup.rotation.z * (1 - k) + s * k * group.rotation.z);

    checkInteraction(function() {
        document.body.style.cursor = 'pointer';
    }, function() {
        document.body.style.cursor = 'auto';
    });

    renderer.render(scene, camera);

    stats.end();
}

});
