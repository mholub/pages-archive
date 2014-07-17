/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.DiscardShader = {

	uniforms: {

		"map": { type: "t", value: null },
		"color":    { type: "c", value: new THREE.Color( 0xffffff ) },
		"opacity":    { type: "f", value: 1.0 }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D map;",
		"uniform float opacity;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( map, vUv );",
			'if (texel.a < 0.5) {',
				'discard;',
			'}',

			"gl_FragColor = vec4( texel.rgb * color, texel.a * opacity );",

		"}"

	].join("\n")

};