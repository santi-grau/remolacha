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
			background : '#ffffff00',
			wireframeBackground : "#ffffff00",
			showCollisions : true,
			pixelRatio : 2,
			width : this.containerEl.offsetWidth,
			height : this.containerEl.offsetHeight
		}
	});

	this.totalParticles = 64;

	this.stack = Matter.Composite.create();
	this.fixed = Matter.Composite.create();

	this.substrate = Matter.Bodies.circle( this.containerEl.offsetWidth / 2, this.containerEl.offsetHeight / 2 - 30, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}});
	this.substrateAnchor = Matter.Bodies.circle( this.containerEl.offsetWidth / 2, this.containerEl.offsetHeight / 2 - 30, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}});
	Matter.Body.setStatic(this.substrateAnchor, true );
	Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.substrate, pointA: { x: 0, y: 0 }, bodyB: this.substrateAnchor, pointB: { x: 0, y: 0 }, stiffness: .1, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));

	for (var i = 0; i < this.totalParticles; i++) {
		Matter.Composite.add( this.fixed, Matter.Bodies.circle( this.containerEl.offsetWidth * i / this.totalParticles, this.containerEl.offsetHeight / 2, .1, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}}));
		Matter.Composite.add( this.stack, Matter.Bodies.circle( this.containerEl.offsetWidth * i / this.totalParticles, this.containerEl.offsetHeight / 2, .1, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}}));
	};

	for ( var i = 0; i < this.totalParticles; i ++ ) {
		Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.fixed.bodies[i], pointA: { x: 0, y: 0 }, bodyB: this.stack.bodies[i], pointB: { x: 0, y: 0 }, stiffness: .1, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));
		Matter.Body.setStatic(this.fixed.bodies[i], true );
	}

	Matter.World.add( engine.world, [ this.stack, this.substrate, this.substrateAnchor ] );

	this.temp = 0;
	this.temp2 = 0;
	this.subs = 0;

	Matter.Engine.run(engine);
	Matter.Render.run(render);

	window.onresize = this.onResize.bind( this );

	this.emitter.on('temp', function( value ) {
		this.temp = ( value + 5 ) / 40
	}.bind(this));

	this.emitter.on('substrate', function( value ) {
		this.subs = value
	}.bind(this));

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
	var range = 0.5;
	if( this.temp > 1 - range ) this.temp2 = this.temp - 1;
	else if( this.temp < range ) this.temp2 = this.temp + 1;
	else this.temp2 = 0;
	for( var i = 0 ; i < this.totalParticles; i++ ){
		var val = Math.max( 0 , ( range - Math.abs( i / this.totalParticles - this.temp) / range ) );
		var val2 = Math.max( 0 , ( range - Math.abs( i / this.totalParticles - this.temp2) / range ) );
		Matter.Body.applyForce( this.stack.bodies[ i ], this.stack.bodies[ i ].position, { x : 0 , y: -( Math.sin( val * Math.PI ) * 0.001) / 2 } );
		Matter.Body.applyForce( this.stack.bodies[ i ], this.stack.bodies[ i ].position, { x : 0 , y: -( Math.sin( val2 * Math.PI ) * 0.001) / 2 } );
	}

	Matter.Body.applyForce( this.substrate, this.substrateAnchor.position, { x : 0 , y: -this.subs } );

	this.rings[0].step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();