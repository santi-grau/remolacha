var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');

var SimplexNoise = require('simplex-noise');

var Chroma = require('chroma-js');

var Ring = function( parent ){
	this.parent = parent;

 	this.speed = 0.01;

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
			colors : { value : [0,0,0,0,0,0,0,0,0,0,0,0] },
			totalColors : { value : 1 },
			springVerts : { value : [] },
			totalGens : { value : this.parent.data.params.generators },
			totalCircles : { value : this.parent.data.params.rings }
		},
		transparent : true,
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );

	this.updateColors( );

	this.parent.emitter.on('rings', function( value ) {
		
		this.mesh.material.uniforms.totalCircles.value = value;
		this.updateColors( value );
	}.bind(this));

	this.parent.emitter.on('segments', function( value ) {
		this.updateColors( );
	}.bind(this));

	this.parent.emitter.on('totalColors', function( value ) {
		this.mesh.material.uniforms.totalColors.value = value;
	}.bind(this));

	this.parent.emitter.on('color0', function( value ) {
		var c = Chroma(value).rgb();

		this.mesh.material.uniforms.colors.value[0] = c[0]/255;
		this.mesh.material.uniforms.colors.value[1] = c[1]/255;
		this.mesh.material.uniforms.colors.value[2] = c[2]/255;
		// this.updateColors( );
	}.bind(this));

	this.parent.emitter.on('color1', function( value ) {
		var c = Chroma(value).rgb();
		this.mesh.material.uniforms.colors.value[3] = c[0]/255;
		this.mesh.material.uniforms.colors.value[4] = c[1]/255;
		this.mesh.material.uniforms.colors.value[5] = c[2]/255;
	}.bind(this));

	this.parent.emitter.on('color2', function( value ) {
		var c = Chroma(value).rgb();
		this.mesh.material.uniforms.colors.value[6] = c[0]/255;
		this.mesh.material.uniforms.colors.value[7] = c[1]/255;
		this.mesh.material.uniforms.colors.value[8] = c[2]/255;
	}.bind(this));

	this.parent.emitter.on('color3', function( value ) {
		var c = Chroma(value).rgb();
		this.mesh.material.uniforms.colors.value[9] = c[0]/255;
		this.mesh.material.uniforms.colors.value[10] = c[1]/255;
		this.mesh.material.uniforms.colors.value[11] = c[2]/255;
	}.bind(this));

}

Ring.prototype.updateColors = function( ){
	var color = [];

	// var c1 = Chroma(this.parent.data.params.color0).rgb();
	// var c2 = Chroma(this.parent.data.params.color1).rgb();
	// var c3 = Chroma(this.parent.data.params.color2).rgb();
	// var c4 = Chroma(this.parent.data.params.color3).rgb();

	// if( this.parent.data.totalColors == 2 ){
	// 	var cols = Chroma.bezier( [ c1, c2, c1 ] ).scale().colors(this.parent.data.params.rings);
	// }

	// if( this.parent.data.totalColors == 3 ){
	// 	var cols = Chroma.bezier( [ c1, c2, c3, c1 ] ).scale().colors(this.parent.data.params.rings);
	// }

	// if( this.parent.data.totalColors == 4 ){
	// 	var cols = Chroma.bezier( [ c1, c2, c3, c4, c1 ] ).scale().colors(this.parent.data.params.rings);
	// }

	var c = [ 0,0,0 ];

	for( var j = 0 ; j < this.parent.data.params.rings; j++ ){
		// var c = [ c1[ 0 ] / 255, c1[ 1 ] / 255,  c1[ 2 ] / 255 ];
		// if( this.parent.data.totalColors > 1 ){
		// 	var cs = Chroma(cols[j]).rgb();
		// 	var c = [ cs[ 0 ] / 255, cs[ 1 ] / 255,  cs[ 2 ] / 255 ];
		// }

		color.push(c[0],c[1],c[2],0);
		for( var i = 0 ; i < this.parent.data.params.segments ; i++ ) color.push(c[0],c[1],c[2],1);
		color.push(c[0],c[1],c[2],1,c[0],c[1],c[2],0);
		for( var i = this.parent.data.params.segments ; i < 128 ; i++ ) color.push(c[0],c[1],c[2],0);
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

	var springVerts = [];
	for( var i = 0 ; i < this.parent.stack.bodies.length ; i++ ){
		springVerts.push(  (this.parent.stack.bodies[i].position.y - this.parent.fixed.bodies[i].position.y)/-40  );
	}

	this.mesh.material.uniforms.springVerts.value = springVerts;

	// console.log();
}

module.exports = Ring;