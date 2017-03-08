var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');

var SimplexNoise = require('simplex-noise');

var Ring = function( parent ){
	this.parent = parent;

 	this.speed = 0.01;
	
	var circlesRadius = 0.035;
	var circlesDistance = 0.34;

	this.timeStep = 0;

	this.radius = 50;

	this.generators = [];

	for( var i = 0 ; i < 7 ; i++ ) this.generators.push( new SimplexNoise( Math.random ) );

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
			gens : { value : [] },
			pos0 : { value : [] },
			pos1 : { value : [] },
			pos2 : { value : [] },
			pos3 : { value : [] },
			totalGens : { value : this.parent.data.params.generators },
			totalCircles : { value : this.parent.data.params.rings }
		},
		transparent : true,
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );

	this.updateColors( this.parent.data.params.segments );

	this.parent.emitter.on('rings', function( value ) {
		this.updateColors( value );
		this.mesh.material.uniforms.totalCircles.value = value;
	}.bind(this));

	this.parent.emitter.on('segments', function( value ) {
		this.updateColors( value );
	}.bind(this));

}

Ring.prototype.updateColors = function( ){
	var color = [];

	for( var j = 0 ; j < this.parent.data.params.rings; j++ ){
		color.push(1,1,1,0);
		for( var i = 0 ; i < this.parent.data.params.segments ; i++ ) color.push(1,1,1,1);
		color.push(1,1,1,1,1,1,1,0);
		for( var i = this.parent.data.params.segments ; i < 128 ; i++ ) color.push(1,1,1,0);
	}
	for( var j = this.parent.data.params.rings ; j < 1024; j++ ){
		color.push(0,0,0,0);
		for( var i = 0 ; i < this.parent.data.params.segments ; i++ ) color.push(0,0,0,0);
		color.push(0,0,0,0,0,0,0,0);
		for( var i = this.parent.data.params.segments ; i < 128 ; i++ ) color.push(0,0,0,0);
	}
	
	this.mesh.geometry.attributes.color.array = new Float32Array( color );
	this.mesh.geometry.attributes.color.needsUpdate = true;
}

Ring.prototype.step = function(time){
	
	this.timeStep += this.speed;

	for( var j = 0 ; j < 4 ; j++ ){
		var zeropos = [];
		var pos = [];
		for( var i = 0 ; i < this.parent.data.params.segments ; i++ ){
			var p = [ Math.cos( Math.PI * 2 * i / ( this.parent.data.params.segments ) ), Math.sin( Math.PI * 2 * i / ( this.parent.data.params.segments ) ) ];

			if( i == 0 ){
				var n = this.generators[0].noise2D( p[0] + this.timeStep, p[1] ) * this.parent.data.params.idleIntensity * this.radius / 5;
				pos.push( p[0] * ( this.radius + n ), p[1] * ( this.radius + n ), 0 );
			}

			var n = this.generators[0].noise2D( p[0] + this.timeStep, p[1] ) * this.parent.data.params.idleIntensity * this.radius / 5;
			pos.push( p[0] * ( this.radius + n ), p[1] * ( this.radius + n ), 0 );

			if( i == this.parent.data.params.segments - 1 ){
				pos.push( zeropos[0], zeropos[1], 0 );
				pos.push( zeropos[0], zeropos[1], 0 );
			}

			if( i == 0 ){
				var n = this.generators[0].noise2D( p[0] + this.timeStep, p[1] ) * this.parent.data.params.idleIntensity * this.radius / 5;
				zeropos = [ p[0] * ( this.radius + n ), p[1] * ( this.radius + n ), 0 ];
			}
		}
		this.mesh.material.uniforms[ 'pos' + j ].value = pos;
	}
	this.mesh.geometry.attributes.position.needsUpdate = true;
}

module.exports = Ring;