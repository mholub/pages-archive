var xtend = require('xtend')
var number = require('as-number')

module.exports = function(THREE) {
    return function (opt) {
        opt = opt||{}

        var ret = xtend({
            transparent: true,
            uniforms: {
                thickness: { type: 'f', value: number(opt.thickness, 0.1) },
                opacity: { type: 'f', value: number(opt.opacity, 1.0) },
                diffuse: { type: 'c', value: new THREE.Color(opt.diffuse) },
                dashSteps: { type: 'f', value: 12 },
                dashDistance: { type: 'f', value: 0.2 },
                dashSmooth: { type: 'f', value: 0.01 }
            },
            attributes: {
                lineMiter:  { type: 'f', value: 0 },
                lineDistance: { type: 'f', value: 0 },
                lineNormal: { type: 'v2', value: new THREE.Vector2() }
            },
            vertexShader: [
                "uniform float thickness;",
                "attribute float lineMiter;",
                "attribute vec2 lineNormal;",
                "attribute float lineDistance;",
                "varying float lineU;",

                "void main() {",
                    "lineU = lineDistance;",
                    "vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );",
                "}"
            ].join("\n"),
            fragmentShader: [   
                "varying float lineU;",

                "uniform float opacity;",
                "uniform vec3 diffuse;",
                "uniform float dashSteps;",
                "uniform float dashSmooth;",
                "uniform float dashDistance;",

                "void main() {",
                    "float lineUMod = mod(lineU, 1.0/dashSteps) * dashSteps;",
                    "float dash = smoothstep(dashDistance, dashDistance+dashSmooth, length(lineUMod-0.5));",
                    "gl_FragColor = vec4(vec3(dash), opacity * dash);",
                "}"
            ].join("\n")
        }, opt)
        return ret
    }
}