var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');

var SimplexNoise = require('simplex-noise');

var Ring = function( parent ){
	this.parent = parent;
	this.segmentsPerCircle = 64;
 	this.variation = 5;
 	this.speed = 0.01;
	this.totalCircles = 300;

	var circlesRadius = 0.035;
	var circlesDistance = 0.34;

	this.timeStep = 0;

	this.radius = 50;

	this.simplex = new SimplexNoise( Math.random );
	this.simplex2 = new SimplexNoise( Math.random );
	this.simplex3 = new SimplexNoise( Math.random );

	var position = [];
	var color = [];
	var ps = [];
	var ids = [];
	var iids = [];
	var prePos = [];
	var zeroPos = [];
	this.pos1 = [];
	this.pos2 = [];

	for( var j = 0 ; j < this.totalCircles ; j++ ){

		var pt = -300 + 600 * j / (this.totalCircles - 1);

		for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
			var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]

			if( i == 0 ){
				position.push( pos[0] * ( this.radius ), pos[1] * ( this.radius ), 0 );
				ps.push( pt );
				color.push(1,0,0,0);
				ids.push( j );
				iids.push( i );

				if( j == 0 ){
					var n = this.simplex.noise2D( pos[0], pos[1] ) * this.variation;
					this.pos1.push( pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 );
				}

				if( j == this.totalCircles - 1 ){
					var n = this.simplex2.noise2D( pos[0], pos[1] ) * this.variation;
					this.pos2.push( pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 );
				}
			}

			position.push( pos[0] * ( this.radius ), pos[1] * ( this.radius ), 0 );
			color.push(1,1,1,1);
			ps.push( pt );
			ids.push( j );
			iids.push( i + 1 );

			if( j == 0 ){
				var n = this.simplex.noise2D( pos[0], pos[1] ) * this.variation;
				this.pos1.push( pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 );
			}

			if( j == this.totalCircles - 1 ){
				var n = this.simplex2.noise2D( pos[0], pos[1] ) * this.variation;
				this.pos2.push( pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 );
			}

			if( i == this.segmentsPerCircle - 1 ){
				position.push( zeroPos[0], zeroPos[1], zeroPos[2] );
				color.push(1,1,1,1);
				ps.push( pt );
				ids.push( j );
				iids.push( i + 2 );

				if( j == 0 ){
					this.pos1.push( zeroPos[0], zeroPos[1], 0 );
				}

				if( j == this.totalCircles - 1 ){
					this.pos2.push( zeroPos[0], zeroPos[1], 0 );
				}
			
				position.push( zeroPos[0], zeroPos[1], zeroPos[2] );
				color.push(1,1,1,0);
				ps.push( pt );
				ids.push( j );
				iids.push( i + 3 );

				if( j == 0 ){
					this.pos1.push( zeroPos[0], zeroPos[1], 0 );
				}
				if( j == this.totalCircles - 1 ){
					this.pos2.push( zeroPos[0], zeroPos[1], 0 );
				}
			}

			if( i == 0 ){
				var n = 0;
				if( j == 0 ) n = this.simplex.noise2D( pos[0], pos[1] ) * this.variation;
				if( j == this.totalCircles - 1 ) n = this.simplex2.noise2D( pos[0], pos[1] ) * this.variation;
				zeroPos = [ pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 ];
			}

		}
	}

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( color ), 4 ) );
	geometry.addAttribute( 'ps', new THREE.BufferAttribute( new Float32Array( ps ), 1 ) );
	geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( ids ), 1 ) );
	geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( iids ), 1 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			time: { value: 1.0 },
			pos1 : { value : this.pos1 },
			pos2 : { value : this.pos2 },
			totalCircles : { value : this.totalCircles }
		},
		transparent : true,
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );

}

Ring.prototype.step = function(time){
	
	this.timeStep += this.speed;
	this.pos1 = [];
	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ];
		
		if( i == 0 ){
			var n = this.simplex.noise2D( pos[0] + this.timeStep, pos[1] ) * this.variation;
			this.pos1.push( pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 );
		}

		var n = this.simplex.noise2D( pos[0] + this.timeStep, pos[1] ) * this.variation;
		this.pos1.push( pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 );

		if( i == this.segmentsPerCircle - 1 ){
			this.pos1.push( zeroPos[0], zeroPos[1], 0 );
			this.pos1.push( zeroPos[0], zeroPos[1], 0 );
		}

		if( i == 0 ){
			var n = this.simplex.noise2D( pos[0] + this.timeStep, pos[1] ) * this.variation;
			zeroPos = [ pos[0] * ( this.radius + n ), pos[1] * ( this.radius + n ), 0 ];
		}
	}

	this.mesh.material.uniforms.pos1.value = this.pos1;

	this.mesh.geometry.attributes.position.needsUpdate = true;

}

module.exports = Ring;