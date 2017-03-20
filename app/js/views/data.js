var Dat = require('dat-gui');
var Matter = require('matter-js');
var TweenMax = require('gsap');

var Data = function( parent ){
	var _this = this;
	this.parent = parent;

	this.totalColors = 1;

	this.audioData = [];

	this.idleIntensity = 0.5;

	this.substrate = 0;
	this.light = 0;
	this.water = 0;

	this.lightInc = 0.0001;
	this.lightIsOn = false;

	this.waterIsOn = false;

	this.segments = 64;
	this.rings = 512;

	this.waterIntensity = 0.2;
	this.waterPhase = 300;

	var GuiParameters = function() {
		this.water = 0;
		this.light = Math.random();
		this.addWater = function(){
			if( !_this.waterIsOn ){
				TweenMax.to( this, 0.5, { water : 1 });
				_this.waterInterval = setInterval(function(){
					TweenMax.to( this, 2.5, { water : 0, ease: Power3.easeOut });
					_this.waterIsOn = false;
				}.bind(this), 5000);
			} else {
				clearInterval( _this.waterInterval );
				TweenMax.to( this, 2.5, { water : 0, ease: Power3.easeOut });
			}
			
			_this.waterIsOn = !_this.waterIsOn;
		}
		this.switchLight = function(){
			if( !_this.lightIsOn ){
				TweenMax.to( _this, 0.5, { lightInc : 0.005 });
				_this.lightInterval = setInterval(function(){
					TweenMax.to( _this, 0.5, { lightInc : 0.0001 });
				}, 5000);
			} else {
				clearInterval( _this.lightInterval );
				TweenMax.to( _this, 0.5, { lightInc : 0.0001 });
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

		this.playPauseAudio = function(){
			_this.parent.audioSource.stopPlayStream();
			_this.parent.audioSource.isPlaying = !_this.parent.audioSource.isPlaying;
		}
	};

	this.gui = new GuiParameters();

	var gui = new Dat.GUI();

	this.f1 = gui.addFolder('Main data');
	
	this.f1.add( this.gui, 'addWater' );
	this.f1.add( this.gui, 'water', 0, 1 ).listen().onChange( function( value ){ this.parent.emitter.emit('water', value ); }.bind(this) );
	this.f1.add( this.gui, 'switchLight' );
	this.f1.add( this.gui, 'light', 0, 1 ).listen().onChange( function( value ){ this.parent.emitter.emit('light', value ); }.bind(this) );

	this.f1.add( this.gui, 'addSubstrate' );
	this.f1.add( this.gui, 'substrate', 0.0, 1.0 ).listen().onChange( function( value ){ this.parent.emitter.emit('substrate', value ); }.bind(this) );
	this.f1.add( this.gui, 'playPauseAudio');

	this.f1.open();

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


	this.stack = Matter.Composite.create();
	this.fixed = Matter.Composite.create();
	for (var i = 0; i < 128; i++) {
		Matter.Composite.add( this.fixed, Matter.Bodies.circle( this.parent.containerEl.offsetWidth * i / 128, this.parent.containerEl.offsetHeight / 2, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}}));
		Matter.Composite.add( this.stack, Matter.Bodies.circle( this.parent.containerEl.offsetWidth * i / 128, this.parent.containerEl.offsetHeight / 2, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}}));
	};

	for ( var i = 0; i < 128; i ++ ) {
		Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.fixed.bodies[i], pointA: { x: 0, y: 0 }, bodyB: this.stack.bodies[i], pointB: { x: 0, y: 0 }, stiffness: .1, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));
		Matter.Body.setStatic(this.fixed.bodies[i], true );
	}

	Matter.World.add( engine.world, [ this.substrateParticle, this.substrateAnchor, this.stack, this.fixed ] );
	Matter.Engine.run(engine);
	Matter.Render.run(render);

}

Data.prototype.step = function( time ){
	
	if( this.gui.light < 1 ) this.gui.light += this.lightInc;
	else this.gui.light = 0;

	this.parent.audioSource.sampleAudioStream();
	


	for( var i = 0 ; i < 128 ; i++ ){
		Matter.Body.applyForce( this.stack.bodies[ i ], this.fixed.bodies[ i ].position, { x : 0 , y: -this.parent.audioSource.streamData[i] / 255 } );

		this.audioData[i] = (this.fixed.bodies[ i ].position.y - this.stack.bodies[ i ].position.y) / 125
	}

	Matter.Body.applyForce( this.substrateParticle, this.substrateAnchor.position, { x : 0 , y: -this.gui.substrate } );
	if( this.gui.substrate > 0 ) this.gui.substrate -= 0.001;
	this.substrate = ( this.substrateAnchor.position.y - this.substrateParticle.position.y ) / 125;
}

module.exports = Data;