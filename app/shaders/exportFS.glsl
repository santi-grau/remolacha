varying vec4 vColor;
varying vec4 vtx_out;

// ┌────────────────────────────────────────────────────────────────────┐
// | Our ♥ fragment shader
// └────────────────────────────────────────────────────────────────────┘
void main( ){
	//gl_FragData [0] = vtx_out;
	gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}