var lineVs = require('./../shaders/lineVs.glsl');
var lineFs = require('./../shaders/lineFs.glsl');

window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var SimplexNoise = require('simplex-noise');

var App = function() {

 	this.segmentsPerCircle = 64;
 	this.variation = 10;
 	this.speed = 0.01;
	var totalCircles = 400;
	var circlesRadius = 0.035;
	var circlesDistance = 0.34;

	this.timeStep = 0;

	this.containerEl = document.getElementById('main');
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, this.containerEl.offsetWidth / this.containerEl.offsetHeight, .1, 10000 );

	var radius = 50;

	this.simplex = new SimplexNoise( Math.random );
	this.simplex2 = new SimplexNoise( Math.random );

	var position = [];
	var ps = [];
	var ids = [];
	var iids = [];
	var prePos = [];
	var zeroPos = [];
	var pos1 = [];

	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]
		var n = this.simplex.noise2D( pos[0], pos[1] ) * this.variation;

		if( i > 0 ) position.push( prePos[0], prePos[1], 0, pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		if( i == this.segmentsPerCircle - 1 ) position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0, zeroPos[0], zeroPos[1], 0 );
		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];

		ps.push( -100, -100 );

		ids.push( 0, 0 );
		iids.push( i * 2 , i * 2 + 1 )
	}

	console.log(iids);

	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]
		var n = 0;

		if( i > 0 ) position.push( prePos[0], prePos[1], 0, pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		if( i == this.segmentsPerCircle - 1 ) position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0, zeroPos[0], zeroPos[1], 0 );
		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];

		ps.push( 0, 0 );
		ids.push( 1, 1 );
		iids.push( i * 2 , i * 2 + 1 )
	}

	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]
		var n = this.simplex2.noise2D( pos[0], pos[1] ) * this.variation;

		if( i > 0 ) position.push( prePos[0], prePos[1], 0, pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		if( i == this.segmentsPerCircle - 1 ) position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0, zeroPos[0], zeroPos[1], 0 );
		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];

		ps.push( 100, 100 );
		ids.push( 2, 2 );
		iids.push( i * 2 , i * 2 + 1 )
	}

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );
	geometry.addAttribute( 'ps', new THREE.BufferAttribute( new Float32Array( ps ), 1 ) );
	geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( ids ), 1 ) );
	geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( iids ), 1 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			time: { value: 1.0 },
			pos1 : { value : position.slice().splice( 0 , this.segmentsPerCircle * 6 ) },
			pos2 : { value : position.slice().splice( -this.segmentsPerCircle * 6, this.segmentsPerCircle * 6 ) }
		},
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.LineSegments( geometry, material );

	this.scene.add( this.mesh );

	window.onresize = this.onResize.bind( this );

	this.onResize();

	this.step();
}

App.prototype.onResize = function(e) {
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px' );
	var vFOV = this.camera.fov * Math.PI / 180;
	this.camera.position.z = this.containerEl.offsetHeight / ( 2 * Math.tan( vFOV / 2 ) );
	this.camera.updateProjectionMatrix();
}

App.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	this.renderer.render( this.scene, this.camera );

	this.timeStep += this.speed;

	var radius = 50;

	var position = [];
	var prePos = [];
	var zeroPos = [];

	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]
		var n = this.simplex.noise2D( Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) + this.timeStep , Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ) * this.variation;
		if( i > 0 ) position.push( prePos[0], prePos[1], 0, pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		if( i == this.segmentsPerCircle - 1 ) position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0, zeroPos[0], zeroPos[1], 0 );
		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
	}

	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]
		var n = 0;
		if( i > 0 ) position.push( prePos[0], prePos[1], 0, pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		if( i == this.segmentsPerCircle - 1 ) position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0, zeroPos[0], zeroPos[1], 0 );
		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
	}

	for( var i = 0 ; i < this.segmentsPerCircle ; i++ ){
		var pos = [ Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ]
		var n = this.simplex2.noise2D( Math.cos( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) + this.timeStep , Math.sin( Math.PI * 2 * i / ( this.segmentsPerCircle ) ) ) * this.variation;
		if( i > 0 ) position.push( prePos[0], prePos[1], 0, pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		if( i == this.segmentsPerCircle - 1 ) position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0, zeroPos[0], zeroPos[1], 0 );
		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
	}

	this.mesh.material.uniforms.pos1.value = position.slice().splice( 0 , this.segmentsPerCircle * 6 );
	this.mesh.material.uniforms.pos2.value = position.slice().splice( -this.segmentsPerCircle * 6, this.segmentsPerCircle * 6 );

	for( var i = 0 ; i < position.length ; i++ ) this.mesh.geometry.attributes.position.array[i] = position[i];
	this.mesh.geometry.attributes.position.needsUpdate = true;
};

var app = new App();