#ifdef GL_ES
	precision highp float;
#endif

uniform vec3 center1;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position + center1, 1.0 );
}