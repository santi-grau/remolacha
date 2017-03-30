var Dat = require('dat-gui');
var Matter = require('matter-js');
var TweenMax = require('gsap');
var SimplexNoise = require('simplex-noise');

var Data = function( parent ){
	var _this = this;
	this.parent = parent;

	// main params
	this.bigRadius = 200;
	this.ringRadius = 50;
	this.rings = 512;
	this.segments = 64;
	this.pos0 = [];
	this.pos1 = [];
	this.pos2 = [];
	this.temperature = Math.random();
	this.soil = Math.random();
	this.air = Math.random() * 1000;
	this.airInc = Math.random();
	this.water = false;
	this.waterStep = 0.5;
	this.waterPhase = 300;
	this.waterIntensity = 0;
	this.light = false;
	this.lightStep = Math.random();
	this.lightInc = 0.0001;


	this.substrate = 0;
	this.audio = false;

	this.speed = 0.01;
	this.timeStep = 0;

	this.audioData = [];
	this.generators = [];
	for( var i = 0 ; i < 3 ; i++ ) this.generators.push( new SimplexNoise( Math.random ) );

	var GuiParameters = function() {
		this.bigRadius = _this.bigRadius;
		this.ringRadius = _this.ringRadius;
		this.temperature = _this.temperature;
		this.soil = _this.soil;
		this.air = _this.airInc;
		this.water = _this.water;
		this.light = _this.light;


		this.addSubstrate = function(){
			if( this.substrate < 0.1 ) this.substrate = 0.25;
			else if( this.substrate > 0 && this.substrate < 0.25 ) this.substrate = 0.5;
			else if( this.substrate >= 0.25 && this.substrate < 0.5 ) this.substrate = 0.75;
			else this.substrate = 1;
		}
		this.substrate = 0.0;

		this.export = function(){
			_this.parent.emitter.emit('export', true );
		}

		this.playPauseAudio = function(){
			_this.parent.audioSource.stopPlayStream();
			_this.parent.audioSource.isPlaying = !_this.parent.audioSource.isPlaying;
		}
	};

	this.gui = new GuiParameters();

	var gui = new Dat.GUI();

	this.f1 = gui.addFolder('Main data');
	
	this.f1.add( this.gui, 'bigRadius', 100, 400 ).listen().onChange( function( value ){ _this.bigRadius = value; }.bind(this) );
	this.f1.add( this.gui, 'ringRadius', 5, 100 ).listen().onChange( function( value ){ _this.ringRadius = value; }.bind(this) );
	this.f1.add( this.gui, 'temperature', 0, 1 ).listen().onChange( function( value ){ _this.temperature = value; }.bind(this) );
	this.f1.add( this.gui, 'soil', 0, 1 ).listen().onChange( function( value ){ _this.soil = value; }.bind(this) );
	this.f1.add( this.gui, 'air', 0, 1 ).listen().onChange( function( value ){ _this.airInc = value; }.bind(this) );
	this.f1.add( this.gui, 'water' ).listen().onChange( function( value ){ _this.water = value; }.bind(this) );
	this.f1.add( this.gui, 'light' ).listen().onChange( function( value ){ _this.light = value; }.bind(this) );

	this.f1.add( this.gui, 'addSubstrate' );
	this.f1.add( this.gui, 'playPauseAudio');

	this.f1.add( this.gui, 'export');

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

Data.prototype.update = function( data ){
	var _this = this;
	var param = JSON.parse(data);
	for( key in param ){
		if( key == 'temperature' ) this.gui.temperature = param[key];
		if( key == 'air' ) this.gui.air = param[key];
		if( key == 'soil' ) this.gui.soil = param[key];

		if( key == 'water'  ) {
			_this.water = key;
		}
		if( key == 'light'  ) {
			_this.light = key;
		}

		if( key == 'substrate'  ) {
			if( this.gui.substrate < 0.1 ) this.gui.substrate = 0.25;
			else if( this.gui.substrate > 0 && this.gui.substrate < 0.25 ) this.gui.substrate = 0.5;
			else if( this.gui.substrate >= 0.25 && this.gui.substrate < 0.5 ) this.gui.substrate = 0.75;
			else this.gui.substrate = 1;
		}

		if( key == 'audio'  ) {
			if( param[key] ){
				_this.parent.audioSource.isPlaying = false;
				_this.parent.audioSource.stopPlayStream();
				_this.parent.audioSource.isPlaying = true;
				
			} else {
				_this.parent.audioSource.isPlaying = true;
				_this.parent.audioSource.stopPlayStream();
				_this.parent.audioSource.isPlaying = false;
			}
		}
	}
}

Data.prototype.step = function( time ){

	// water
	if( this.water ) this.waterIntensity += ( 1 - this.waterIntensity ) * 0.05;
	else this.waterIntensity += ( 0 - this.waterIntensity ) * 0.05;

	this.waterStep += 0.01;

	//light
	if( this.light ) this.lightInc += ( 0.005 - this.lightInc ) * 0.05;
	else this.lightInc += ( 0.0001 - this.lightInc ) * 0.05;

	if( this.lightStep < 1 ) this.lightStep += this.lightInc;
	else this.lightStep = 0;

	//substate

	// audio
	this.parent.audioSource.sampleAudioStream();
	

	this.timeStep += this.speed;
	this.air += 0.0005 + 0.003 * this.airInc;

	for( var i = 0 ; i < 128 ; i++ ){
		Matter.Body.applyForce( this.stack.bodies[ i ], this.fixed.bodies[ i ].position, { x : 0 , y: -this.parent.audioSource.streamData[i] / 255 } );
		this.audioData[i] = (this.fixed.bodies[ i ].position.y - this.stack.bodies[ i ].position.y) / 125
	}

	for( var j = 0 ; j < 3 ; j++ ){
		var pos = [], zeropos = [];
		for( var i = 0 ; i < this.segments ; i++ ){
			var p = [ Math.cos( Math.PI * 2 * i / ( this.segments ) ), Math.sin( Math.PI * 2 * i / ( this.segments ) ) ];
			if( i == 0 ){
				var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.temperature * this.ringRadius / 5;
				pos.push( p[0] * ( this.ringRadius + n ), p[1] * ( this.ringRadius + n ), 0 );
			}
			var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.temperature * this.ringRadius / 5;
			pos.push( p[0] * ( this.ringRadius + n ), p[1] * ( this.ringRadius + n ), 0 );
			if( i == this.segments - 1 ) pos.push( zeropos[0], zeropos[1], 0, zeropos[0], zeropos[1], 0 );	
			if( i == 0 ){
				var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.temperature * this.ringRadius / 5;
				zeropos = [ p[0] * ( this.ringRadius + n ), p[1] * ( this.ringRadius + n ), 0 ];
			}
		}
		this[ 'pos' + j ] = pos;
	}

	Matter.Body.applyForce( this.substrateParticle, this.substrateAnchor.position, { x : 0 , y: -this.gui.substrate } );
	if( this.gui.substrate > 0 ) this.gui.substrate -= 0.001;
	this.substrate = 1 + ( this.substrateAnchor.position.y - this.substrateParticle.position.y ) / 125;
}

module.exports = Data;