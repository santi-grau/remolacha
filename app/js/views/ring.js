var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');

var SimplexNoise = require('simplex-noise');

var Chroma = require('chroma-js');

var Ring = function( parent, segmentRadius, ringRadius ){
	this.parent = parent;
 	this.speed = 0.01;
	this.timeStep = 0;
	this.segmentRadius = segmentRadius;
	this.ringRadius = ringRadius;
	this.generators = [];
	this.noiseInc = 0;
	this.noiseStep = 0.01;

	for( var i = 0 ; i < 3 ; i++ ) this.generators.push( new SimplexNoise( Math.random ) );

	var position = [];
	var ids = [];
	var iids = [];

	for( var j = 0 ; j < 1024 ; j++ ){
		for( var i = 0 ; i < 128 + 3 ; i++ ){
			position.push( 0, 0, 0 );
			ids.push( j );
			iids.push( i );
		}
	}

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( [] ), 4 ) );
	geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( ids ), 1 ) );
	geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( iids ), 1 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			time: { value : 1.0 },
			pos0 : { value : [] },
			pos1 : { value : [] },
			pos2 : { value : [] },
			light : { value : this.parent.data.gui.light },
			water : { value : this.parent.data.gui.water },
			colors : { value : [0,0,0,0,0,0,0,0,0,0,0,0] },
			substrate : { value : 1 },
			saturation : { value : this.parent.data.gui.colorSaturation },
			value : { value : this.parent.data.gui.colorValue },
			noise : { value : this.noiseInc },
			totalColors : { value : 1 },
			ringRadius : { value : this.ringRadius },
			audioData : { value :[] },
			//springVerts : { value : [] },
			totalCircles : { value : this.parent.data.gui.rings }
		},
		transparent : true,
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );

	this.updateColors( );

	this.parent.emitter.on('rings', function( value ) {
		this.mesh.material.uniforms.totalCircles.value = value;
		this.updateColors( );
	}.bind(this));

	this.parent.emitter.on('segments', function( value ) {
		this.updateColors( );
	}.bind(this));

	this.parent.emitter.on('saturation', function( value ) {
		this.mesh.material.uniforms.saturation.value = value;
	}.bind(this));

	this.parent.emitter.on('value', function( value ) {
		this.mesh.material.uniforms.value.value = value;
	}.bind(this));

}

Ring.prototype.updateColors = function( ){
	var color = [];
	for( var j = 0 ; j < this.parent.data.gui.rings; j++ ){
		color.push(0,0,0,0);
		for( var i = 0 ; i < this.parent.data.gui.segments ; i++ ) color.push(0,0,0,1);
		color.push(0,0,0,1,0,0,0,0);
		for( var i = this.parent.data.gui.segments ; i < 128 ; i++ ) color.push(0,0,0,0);
	}
	for( var j = this.parent.data.gui.rings ; j < 1024; j++ ){
		color.push(0,0,0,0);
		for( var i = 0 ; i < this.parent.data.gui.segments ; i++ ) color.push(0,0,0,0);
		color.push(0,0,0,0,0,0,0,0);
		for( var i = this.parent.data.gui.segments ; i < 128 ; i++ ) color.push(0,0,0,0);
	}
	
	this.mesh.geometry.attributes.color.array = new Float32Array( color );
	this.mesh.geometry.attributes.color.needsUpdate = true;
}

Ring.prototype.step = function(time){
	
	this.timeStep += this.speed;
	this.noiseInc += this.parent.data.gui.water / 100;

	this.mesh.material.uniforms.substrate.value = 0.5 + this.parent.data.substrate;
	this.mesh.material.uniforms.light.value = this.parent.data.gui.light;
	this.mesh.material.uniforms.water.value = this.parent.data.gui.water;

	this.mesh.material.uniforms.noise.value = this.noiseInc;

	this.mesh.material.uniforms.audioData.value = this.parent.data.audioData;

	for( var j = 0 ; j < 3 ; j++ ){
		var pos = [], zeropos = [];
		for( var i = 0 ; i < this.parent.data.gui.segments ; i++ ){
			var p = [ Math.cos( Math.PI * 2 * i / ( this.parent.data.gui.segments ) ), Math.sin( Math.PI * 2 * i / ( this.parent.data.gui.segments ) ) ];

			if( i == 0 ){
				var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.parent.data.gui.idleIntensity * this.segmentRadius / 5;
				pos.push( p[0] * ( this.segmentRadius + n ), p[1] * ( this.segmentRadius + n ), 0 );
			}

			var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.parent.data.gui.idleIntensity * this.segmentRadius / 5;
			pos.push( p[0] * ( this.segmentRadius + n ), p[1] * ( this.segmentRadius + n ), 0 );

			if( i == this.parent.data.gui.segments - 1 ){
				pos.push( zeropos[0], zeropos[1], 0, zeropos[0], zeropos[1], 0 );
			}

			if( i == 0 ){
				var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.parent.data.gui.idleIntensity * this.segmentRadius / 5;
				zeropos = [ p[0] * ( this.segmentRadius + n ), p[1] * ( this.segmentRadius + n ), 0 ];
			}
		}
		this.mesh.material.uniforms[ 'pos' + j ].value = pos;
	}
	this.mesh.geometry.attributes.position.needsUpdate = true;

	// var springVerts = [];
	// for( var i = 0 ; i < this.parent.stack.bodies.length ; i++ ){
	// 	springVerts.push(  (this.parent.stack.bodies[i].position.y - this.parent.fixed.bodies[i].position.y)/-40  );
	// }

	// this.mesh.material.uniforms.springVerts.value = springVerts;
}

module.exports = Ring;