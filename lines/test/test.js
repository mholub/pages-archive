require('domready')(run)

var THREE = require('three')
var OrbitViewer = require('three-orbit-viewer')(THREE)
var Line = require('../')(THREE)
var BasicShader = require('../shaders/basic')(THREE)
var DashShader = require('./shader-dash')(THREE)
var GradientShader = require('./shader-gradient')(THREE)

var normalize = require('normalize-path-scale')
var arc = require('arc-to')
var curve = require('adaptive-bezier-curve')

var curvePath = path1(0)


function run() {
    var app = OrbitViewer({
        clearColor: 0x000000,
        clearAlpha: 1.0,
        fov: 65,
        position: new THREE.Vector3(1, 1, -2),
        contextAttributes: {
            antialias: true
        }
    })

    //////// Our bezier curve 
    var curveGeometry = Line()
    var mat = new THREE.ShaderMaterial(BasicShader({
        side: THREE.DoubleSide,
        transparent: true,
        diffuse: 0x5cd7ff,
        opacity: 0.3
    }))
    var mesh = new THREE.Mesh(curveGeometry, mat)
    app.scene.add(mesh)


    //testing delayed update of buffers
    setTimeout(function() {
        curveGeometry.update(curvePath) 
    }, 500)

    var time = 0
    app.on('tick', function(dt) {
        time += dt/1000
        //animate some thickness stuff
        mat.uniforms.thickness.value = 0.01;
        curvePath = path1(time)
        curveGeometry.update(curvePath, false) 
    })
}

function path1(time) {
    var curvePath = [];
    for (var i = 0; i < 1000; i++) {
        curvePath.push([Math.pow(Math.cos(i / 50.0 + time), 2), Math.sin(i / 37.0 + time), 0]);
    }
    
    //a bezier curve, normalized to -1.0 to 1.0
    return curvePath
}