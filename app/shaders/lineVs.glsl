#ifdef GL_ES
	precision highp float;
#endif

uniform vec3 pos1[128];
uniform vec3 pos2[128];

attribute float ps;
attribute float ids;
attribute float iids;

void main() {
	vec3 ps2  = position + vec3( ps, 0.0, 0.0 );
	
	if( ids == 1.0 ) ps2 = ( pos1[int(iids)] + pos2[int(iids)] ) / 2.0;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( ps2, 1.0 );
}