var lineVs = require('./../shaders/lineVs.glsl');
var lineFs = require('./../shaders/lineFs.glsl');

window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var SimplexNoise = require('simplex-noise');

var App = function() {

	var segmentsPerCircle = 16;
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

	this.circle = new THREE.Object3D();
	this.circle2 = new THREE.Object3D();


	var position = [];
	var prePos = [];
	var zeroPos = [];

	for( var i = 0 ; i < segmentsPerCircle ; i++ ){
		var geometry = new THREE.SphereBufferGeometry( 1 );
		var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		var sphere = new THREE.Mesh( geometry, material );
		var pos = [ Math.cos( Math.PI * 2 * i / ( segmentsPerCircle ) ), Math.sin( Math.PI * 2 * i / ( segmentsPerCircle ) ) ]
		var n = this.simplex.noise2D( pos[0], pos[1] ) * 3;
		sphere.position.set( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
		this.circle.add( sphere );

		if( i > 1 ) position.push( prePos[0], prePos[1], 0 );
		
		
		position.push( pos[0] * ( radius + n ), pos[1] * ( radius + n ), 0 );
			

		prePos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == 0 ) zeroPos = [ pos[0] * ( radius + n ), pos[1] * ( radius + n ) ];
		if( i == segmentsPerCircle - 1 )  position.push( zeroPos[0], zeroPos[1], 0 );
	}

	this.scene.add( this.circle );
	this.scene.add( this.circle2 );

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			time: { value: 1.0 },
			resolution: { value: new THREE.Vector2() }
		},
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	var mesh = new THREE.LineSegments( geometry, material );

	this.scene.add( mesh )

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

	this.timeStep += 0.01;

	var radius = 50;
	for( var i = 0 ; i < this.circle.children.length ; i++ ){
		// var n = this.simplex.noise2D( Math.cos( Math.PI * 2 * i / ( this.circle.children.length ) ) + this.timeStep , Math.sin( Math.PI * 2 * i / ( this.circle.children.length ) ) ) * 3;
		// this.circle.children[i].position.set( Math.cos( Math.PI * 2 * i / ( this.circle.children.length ) ) * ( radius + n ), Math.sin( Math.PI * 2 * i / ( this.circle.children.length ) ) * ( radius + n ), 0 );
	}
};

var app = new App();