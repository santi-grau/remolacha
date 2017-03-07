window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var Ring = require('./views/ring');

var Matter = require('matter-js');

var Dat = require('dat-gui');

var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;

var App = function() {

	var Params = function() {
		this.generators = 3;
		this.temp = 12;
		this.soil = 60;
		this.air = 30;
		this.water = 0.50;
		this.light = 0.50;
		this.substrate = 0.5;
		this.music = 0.5;
		this.audio = false;
	};

	var text = new Params();
	var gui = new Dat.GUI();
	gui.add(text, 'generators', [ 2, 3, 4, 5, 6, 7, 8 ] );
	gui.add(text, 'temp', -5, 35 );
	gui.add(text, 'soil', 0, 100 );
	gui.add(text, 'air', 0, 100 );
	gui.add(text, 'water', 0, 1 );
	gui.add(text, 'light', 0, 1 );
	gui.add(text, 'water', 0, 1 );
	gui.add(text, 'substrate', 0, 1 );
	gui.add(text, 'audio');
	


	this.rings = [];
	this.rings.push( new Ring() );

	this.containerEl = document.getElementById('main');
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, this.containerEl.offsetWidth / this.containerEl.offsetHeight, .1, 10000 );

	this.scene.add( this.rings[0].mesh );

	// matter
	var engine = Engine.create();
	engine.world.gravity.y = 0;

	console.log(engine)
	var render = Render.create({
		element: document.getElementById('renderer'),
		engine: engine,
		options : {
			background : '#ffffff',
			wireframeBackground : "#000000",
			showCollisions : true,
			pixelRatio : 2,
			width : this.containerEl.offsetWidth,
			height : this.containerEl.offsetHeight
		}
	});
	console.log(render);

	this.totalParticles = 100;

	this.stack = Matter.Composite.create();
	this.fixed = Matter.Composite.create();

	var group;
	for (var i = 0; i < this.totalParticles; i++) {
		Matter.Composite.add( this.fixed, Matter.Bodies.circle( this.containerEl.offsetWidth * i / this.totalParticles, this.containerEl.offsetHeight / 2, .1, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: group}}));
		Matter.Composite.add( this.stack, Matter.Bodies.circle( this.containerEl.offsetWidth * i / this.totalParticles, this.containerEl.offsetHeight / 2, .1, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: group+1}}));
		group+=2;
	};

	for ( var i = 0; i < this.totalParticles; i ++ ) {
		Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.fixed.bodies[i], pointA: { x: 0, y: 0 }, bodyB: this.stack.bodies[i], pointB: { x: 0, y: 0 }, stiffness: .1, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));
		Matter.Body.setStatic(this.fixed.bodies[i], true );
	}

	World.add( engine.world, [ this.stack ] );

	this.mouse = 0;
	this.mouse2 = 0;

	Engine.run(engine);
	Render.run(render);

	window.onresize = this.onResize.bind( this );

	this.containerEl.addEventListener("mousemove", this.mouseMove.bind(this) );

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

App.prototype.mouseMove = function(e) {
	this.mouse = ( e.offsetX - this.containerEl.offsetWidth / 2) / this.containerEl.offsetWidth + 0.5;
};

App.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	var range = 0.5;
	// if( this.mouse > 1 - range ) this.mouse2 = this.mouse - 1;x
	for( var i = 0 ; i < this.totalParticles; i++ ){
		var val = Math.max( 0 , ( range - Math.abs( i / this.totalParticles - this.mouse) / range ) );
		// var val2 = Math.max( 0 , ( range - Math.abs( i / this.totalParticles - this.mouse2) / range ) );
		Matter.Body.applyForce( this.stack.bodies[ i ], this.stack.bodies[ i ].position, { x : 0 , y: -( Math.sin( val * Math.PI ) * 0.001) / 2 } );
		// Matter.Body.applyForce( this.stack.bodies[ i ], this.stack.bodies[ i ].position, { x : 0 , y: -( Math.sin( val2 * Math.PI ) * 0.001) / 2 } );
	}

	this.rings[0].step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();