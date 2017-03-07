#ifdef GL_ES
	precision highp float;
#endif

#define M_PI 3.1415926535897932384626433832795

varying vec4 vColor;

uniform vec3 pos1[67];
uniform vec3 pos2[67];
uniform float totalCircles;

attribute float ps;
attribute vec4 color;
attribute float ids;
attribute float iids;

void main() {
	vColor = color;

	vec3 ps2 = pos1[ int( iids ) ] + ( pos2[ int( iids ) ] - pos1[ int( iids ) ] ) * ids / totalCircles + vec3( cos( M_PI * ids / totalCircles ) * 300.0, sin( M_PI * ids / totalCircles ) * 300.0, 0.0 );
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( ps2, 1.0 );
}