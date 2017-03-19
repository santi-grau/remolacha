varying vec4 vColor;

attribute vec4 color;
attribute float ids;
attribute float iids;

uniform vec3 pos0[131];
uniform vec3 pos1[131];
uniform vec3 pos2[131];

uniform float substrate;
uniform float totalCircles;
uniform float ringRadius;
uniform float light;
uniform float saturation;
uniform float value;
uniform float water;
uniform float noise;
uniform float audioData[128];



#define M_PI 3.1415926535897932384626433832795

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) { 
	const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);
	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;

	i = mod289(i);
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}



vec3 hsv2rgb( vec3 c ) {
	vec4 K = vec4( 1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0 );
	vec3 p = abs( fract( c.xxx + K.xyz ) * 6.0 - K.www );
	return c.z * mix( K.xxx, clamp( p - K.xxx, 0.0, 1.0 ), c.y );
}

void main() {
	
	vec3 fPos;
	vec3 interpolate;

	// vertex colors
	if( ids < totalCircles / 2.0 ) vColor.rgb = hsv2rgb( vec3( light + ids / totalCircles / 2.0 , saturation, value ) );
	else vColor.rgb = hsv2rgb( vec3( light + ( totalCircles - ids ) / totalCircles / 2.0 , saturation, value ) );
	vColor.a = color.a;

	//interpolate = pos0[ int( iids ) ] + ( pos1[ int( iids ) ] - pos0[ int( iids ) ] ) * ids / totalCircles;
	if( ids < totalCircles * 0.33 ){
		interpolate = pos0[ int( iids ) ] + ( pos1[ int( iids ) ] - pos0[ int( iids ) ] ) * ids / (totalCircles * 0.33);
	} else if( ids >= totalCircles * 0.33 && ids < totalCircles * 0.66 ) {
		interpolate = pos1[ int( iids ) ] + ( pos2[ int( iids ) ] - pos1[ int( iids ) ] ) * (ids - (totalCircles * 0.33)) / (totalCircles * 0.33);
	} else {
		interpolate = pos2[ int( iids ) ] + ( pos0[ int( iids ) ] - pos2[ int( iids ) ] ) * (ids - (totalCircles * 0.66)) / (totalCircles * 0.33);
	}

	vec3 translate = vec3( cos( M_PI * 2.0 * ids / (totalCircles - 1.0) ) * ( ringRadius ), sin( M_PI * 2.0 * ids / (totalCircles - 1.0) ) * ( ringRadius ), 0.0 );
	
	//float waterDisplacement = ( snoise( vec2( translate.x / 400.0 + noise, translate.y / 400.0 ) ) + 1.0 ) + translate + translate * 0.1 * snoise( vec2( translate.x / 400.0 + noise, translate.y / 400.0 ) );
	fPos = translate + interpolate * substrate;
	//fPos = interpolate * substrate * ( snoise( vec2( translate.x / 400.0 + noise, translate.y / 400.0 ) ) + 1.0 ) + translate + translate * 0.1 * snoise( vec2( translate.x / 400.0 + noise, translate.y / 400.0 ) );
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( fPos, 1.0 );
}