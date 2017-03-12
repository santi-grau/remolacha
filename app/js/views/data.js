var Dat = require('dat-gui');
var Matter = require('matter-js');
var TweenMax = require('gsap');

var Data = function( parent ){
	var _this = this;
	this.parent = parent;

	this.totalColors = 1;

	this.substrate = 0;
	this.light = 0;
	this.water = 0;

	this.lightInc = 0.0001;
	this.lightIsOn = false;

	var GuiParameters = function() {
		this.temp = 12;
		this.soil = 60;
		this.air = 30;
		this.water = 0;
		this.light = Math.random();
		this.addWater = function(){
			TweenMax.to( this, 0.2, { water : 1 });
		}
		this.switchLight = function(){
			if( !_this.lightIsOn ){
				_this.lightInc = 0.01;
				_this.lightInterval = setInterval(function(){
					_this.lightInc = 0.0001;
				}, 5000);
			} else {
				clearInterval( _this.lightInterval );
				_this.lightInc = 0.0001;
			}
			_this.lightIsOn = !_this.lightIsOn;

		}

		this.addSubstrate = function(){
			if( this.substrate < 0.1 ) this.substrate = 0.25;
			else if( this.substrate > 0 && this.substrate < 0.25 ) this.substrate = 0.5;
			else if( this.substrate >= 0.25 && this.substrate < 0.5 ) this.substrate = 0.75;
			else this.substrate = 1;
		}
		this.substrate = 0.0;
		this.audio = false;

		this.show = false;
		this.segments = 64;
		this.rings = 512;
		this.generators = 4;
		this.idleIntensity = 0.5;
	
	};

	this.gui = new GuiParameters();

	var gui = new Dat.GUI();

	this.f1 = gui.addFolder('Main data');
	this.f2 = gui.addFolder('Debug data');
	
	this.f1.add( this.gui, 'temp', -5, 35 ).onChange( function( value ){ this.parent.emitter.emit('temp', value ); }.bind(this) );
	this.f1.add( this.gui, 'soil', 0, 100 ).onChange( function( value ){ this.parent.emitter.emit('soil', value ); }.bind(this) );
	this.f1.add( this.gui, 'air', 0, 100 ).onChange( function( value ){ this.parent.emitter.emit('air', value ); }.bind(this) );
	this.f1.add( this.gui, 'addWater' );
	this.f1.add( this.gui, 'water', 0, 1 ).listen().onChange( function( value ){ this.parent.emitter.emit('water', value ); }.bind(this) );
	this.f1.add( this.gui, 'switchLight' );
	this.f1.add( this.gui, 'light', 0, 1 ).listen().onChange( function( value ){ this.parent.emitter.emit('light', value ); }.bind(this) );

	this.f1.add( this.gui, 'addSubstrate' );
	this.f1.add( this.gui, 'substrate', 0.0, 1.0 ).listen().onChange( function( value ){ this.parent.emitter.emit('substrate', value ); }.bind(this) );
	this.f1.add( this.gui, 'audio').onChange( function( value ){ this.parent.emitter.emit('audio', value ); }.bind(this) );
	
	this.f2.add( this.gui, 'show').onChange( function( value ){ this.parent.emitter.emit('show', value ); }.bind(this) );
	this.f2.add( this.gui, 'segments', [ 4, 8, 16, 32, 64, 128 ] ).onChange( function( value ){ this.parent.emitter.emit('segments', value ); }.bind(this) );
	this.f2.add( this.gui, 'rings', [ 64, 128, 256, 512, 1024 ] ).onChange( function( value ){ this.parent.emitter.emit('rings', value ); }.bind(this) );
	this.f2.add( this.gui, 'generators', [ 2, 3, 4 ] ).onChange( function( value ){ this.parent.emitter.emit('generators', value ); }.bind(this) );
	this.f2.add( this.gui, 'idleIntensity', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('idleIntensity', value ); }.bind(this) );

	this.f1.open();
	this.f2.open();


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
			width : this.parent.containerEl.offsetWidth,
			height : this.parent.containerEl.offsetHeight
		}
	});

	this.substrateParticle = Matter.Bodies.circle( this.parent.containerEl.offsetWidth / 2, this.parent.containerEl.offsetHeight / 2 - 30, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}});
	this.substrateAnchor = Matter.Bodies.circle( this.parent.containerEl.offsetWidth / 2, this.parent.containerEl.offsetHeight / 2 - 30, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}});
	Matter.Body.setStatic(this.substrateAnchor, true );
	Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.substrateParticle, pointA: { x: 0, y: 0 }, bodyB: this.substrateAnchor, pointB: { x: 0, y: 0 }, stiffness: .05, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));

	Matter.World.add( engine.world, [ this.substrateParticle, this.substrateAnchor ] );
	Matter.Engine.run(engine);
	Matter.Render.run(render);

}

Data.prototype.step = function( time ){
	
	if( this.gui.light < 1 ) this.gui.light += this.lightInc;
	else this.gui.light = 0;

	Matter.Body.applyForce( this.substrateParticle, this.substrateAnchor.position, { x : 0 , y: -this.gui.substrate } );
	if( this.gui.substrate > 0 ) this.gui.substrate -= 0.001;
	this.substrate = ( this.substrateAnchor.position.y - this.substrateParticle.position.y ) / 125;
}

module.exports = Data;