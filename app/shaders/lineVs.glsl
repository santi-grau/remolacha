varying vec4 vColor;

attribute vec4 color;
attribute float ids;
attribute float iids;

uniform float bigRadius;
uniform vec3 pos0[201];
uniform vec3 pos1[201];
uniform vec3 pos2[201];
uniform float temperature;
uniform float soil;
uniform float air;
uniform float waterStep;
uniform float waterPhase;
uniform float waterIntensity;
uniform float lightStep;
uniform float substrate;
uniform float audioData[16];
uniform float rings;
uniform float audioSamples;

// ┌────────────────────────────────────────────────────────────────────┐
// | ASHIMA NOISE
// | Copyright (C) 2011 Ashima Arts. All rights reserved. 
// | Distributed under the MIT License.
// └────────────────────────────────────────────────────────────────────┘
#define M_PI 3.1415926535897932384626433832795
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) { 
	const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
	vec2 i = floor(v + dot(v, C.yy) );
	vec2 x0 = v - i + dot(i, C.xx);
	vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod289(i);
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
	m = m*m*m*m ;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
	vec3 g;
	g.x  = a0.x * x0.x + h.x * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

// ┌────────────────────────────────────────────────────────────────────┐
// | HSV2RGB https://github.com/hughsk/glsl-hsv2rgb
// | No license found. 
// └────────────────────────────────────────────────────────────────────┘
vec3 hsv2rgb( vec3 c ) {
	vec4 K = vec4( 1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0 );
	vec3 p = abs( fract( c.xxx + K.xyz ) * 6.0 - K.www );
	return c.z * mix( K.xxx, clamp( p - K.xxx, 0.0, 1.0 ), c.y );
}

// ┌────────────────────────────────────────────────────────────────────┐
// | Our ♥ vertex shader
// └────────────────────────────────────────────────────────────────────┘
void main() {
	vec3 interpolate;

	// vertex colors
	if( ids < rings / 2.0 ) vColor.rgb = hsv2rgb( vec3( lightStep + ids / rings / 2.0 , 0.9, 0.7 ) );
	else vColor.rgb = hsv2rgb( vec3( lightStep + ( rings - ids ) / rings / 2.0 , 0.9, 0.7 ) );
	vColor.a = color.a;

	// rings
	if( ids < rings * 0.33 ) interpolate = pos0[ int( iids ) ] + ( pos1[ int( iids ) ] - pos0[ int( iids ) ] ) * ids / (rings * 0.33);
	else if( ids >= rings * 0.33 && ids < rings * 0.66 ) interpolate = pos1[ int( iids ) ] + ( pos2[ int( iids ) ] - pos1[ int( iids ) ] ) * (ids - (rings * 0.33)) / (rings * 0.33);
	else interpolate = pos2[ int( iids ) ] + ( pos0[ int( iids ) ] - pos2[ int( iids ) ] ) * (ids - (rings * 0.66)) / (rings * 0.33);

	// ring positions
	vec3 translate = vec3( cos( M_PI * 2.0 * ids / (rings - 1.0) ) * ( bigRadius ), sin( M_PI * 2.0 * ids / (rings - 1.0) ) * ( bigRadius ), 0.0 );
	
	// soil + air
	translate += translate * 0.3 * snoise( vec2( translate.x / 900.0 + air, translate.y / 900.0 ) ) * (soil);
	interpolate *= 1.0 + snoise( vec2( translate.x / 600.0 + air, translate.y / 600.0 ) ) * ( soil - 0.25 * soil ) ;
	
	// water
	float waterDist = snoise( vec2( translate.x / waterPhase + waterStep, translate.y / waterPhase ) );
	interpolate *= 1.0 + waterDist * waterIntensity * 0.4;
	translate += translate * 0.1 * waterDist * waterIntensity;

	//audio
	float count;
	if( ids < rings / 2.0 ) count = ids;
	else count = ( rings - ids );
	float val1 = audioData[ int( floor( audioSamples * ( count / ( rings / 2.0 ) ) ) ) ];
	float val2 = audioData[ int( floor( audioSamples * ( count / ( rings / 2.0 ) ) + 1.0 ) ) ];
	float ringsPerSection =  rings / 2.0 / audioSamples ;
	float smoothed = (( count - floor( count / ringsPerSection ) * ( ringsPerSection ) )) / ( ringsPerSection );
	float audioDef = ( val1 + ( val2 - val1 ) * smoothstep(0.0,1.0,smoothed) );
	interpolate *= 1.0 + audioDef;
	translate -= translate * 0.1 * audioDef;

	vec3 fPos = translate + interpolate;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( fPos, 1.0 );
}