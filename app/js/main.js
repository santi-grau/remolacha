window.THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var Matter = require('matter-js');

var EventEmitter = require('events').EventEmitter;

var Ring = require('./views/ring');
var Data = require('./views/data');

var App = function() {

	this.emitter = new EventEmitter();

	this.data = new Data( this );

	this.rings = [];
	this.rings.push( new Ring( this ) );

	this.containerEl = document.getElementById('main');
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 60, this.containerEl.offsetWidth / this.containerEl.offsetHeight, .1, 10000 );

	this.scene.add( this.rings[0].mesh );

	// matter
	var engine = Matter.Engine.create();
	engine.world.gravity.y = 0;


	var render = Matter.Render.create({
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

	Matter.World.add( engine.world, [ this.stack ] );

	this.mouse = 0;
	this.mouse2 = 0;

	Matter.Engine.run(engine);
	Matter.Render.run(render);

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
	if( this.mouse > 1 - range ) this.mouse2 = this.mouse - 1;
	else if( this.mouse < range ) this.mouse2 = this.mouse + 1;
	else this.mouse2 = 0;
	for( var i = 0 ; i < this.totalParticles; i++ ){
		var val = Math.max( 0 , ( range - Math.abs( i / this.totalParticles - this.mouse) / range ) );
		var val2 = Math.max( 0 , ( range - Math.abs( i / this.totalParticles - this.mouse2) / range ) );
		Matter.Body.applyForce( this.stack.bodies[ i ], this.stack.bodies[ i ].position, { x : 0 , y: -( Math.sin( val * Math.PI ) * 0.001) / 2 } );
		Matter.Body.applyForce( this.stack.bodies[ i ], this.stack.bodies[ i ].position, { x : 0 , y: -( Math.sin( val2 * Math.PI ) * 0.001) / 2 } );
	}

	this.rings[0].step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();