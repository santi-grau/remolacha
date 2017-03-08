#ifdef GL_ES
	precision highp float;
#endif

#define M_PI 3.1415926535897932384626433832795

varying vec4 vColor;

uniform vec3 pos0[131];
uniform vec3 pos1[131];
uniform vec3 pos2[131];
uniform vec3 pos3[131];

uniform float totalCircles;
uniform float totalGens;

attribute vec4 color;
attribute float ids;
attribute float iids;

void main() {
	vColor = color;
	vec3 fPos;
	vec3 interpolate;

	if( totalGens == 2.0 ){
		if( ids < totalCircles / 2.0 ){
			interpolate = pos0[ int( iids ) ] + ( pos1[ int( iids ) ] - pos0[ int( iids ) ] ) * ids / totalCircles;
		} else {
			interpolate = pos1[ int( iids ) ] + ( pos0[ int( iids ) ] - pos1[ int( iids ) ] ) * ids / totalCircles;
		}
	}

	if( totalGens == 3.0 ){
		if( ids < totalCircles / 3.3 ){
			interpolate = pos0[ int( iids ) ] + ( pos1[ int( iids ) ] - pos0[ int( iids ) ] ) * ids / totalCircles;
		} else if( ids >= totalCircles / 3.3 && ids < totalCircles / 6.6 ) {
			interpolate = pos1[ int( iids ) ] + ( pos2[ int( iids ) ] - pos1[ int( iids ) ] ) * ids / totalCircles;
		} else {
			interpolate = pos2[ int( iids ) ] + ( pos0[ int( iids ) ] - pos2[ int( iids ) ] ) * ids / totalCircles;
		}
	}

	if( totalGens == 4.0 ){
		if( ids < totalCircles * 0.25 ){
			interpolate = pos0[ int( iids ) ] + ( pos1[ int( iids ) ] - pos0[ int( iids ) ] ) * ids / totalCircles;
		} else if( ids >= totalCircles * 0.25 && ids < totalCircles * 0.5 ) {
			interpolate = pos1[ int( iids ) ] + ( pos2[ int( iids ) ] - pos1[ int( iids ) ] ) * ids / totalCircles;
		} else if( ids >= totalCircles * 0.5 && ids < totalCircles * 0.75 ) {
			interpolate = pos2[ int( iids ) ] + ( pos3[ int( iids ) ] - pos2[ int( iids ) ] ) * ids / totalCircles;
		} else {
			interpolate = pos3[ int( iids ) ] + ( pos0[ int( iids ) ] - pos3[ int( iids ) ] ) * ids / totalCircles;
		}
	}

	vec3 translate = vec3( cos( M_PI * 2.0 * ids / (totalCircles - 1.0) ) * 300.0, sin( M_PI * 2.0 * ids / (totalCircles - 1.0) ) * 300.0, 0.0 );

	fPos = interpolate + translate;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( fPos, 1.0 );
}