window.webkitRequestAnimationFrame = window.requestAnimationFrame;

var Dat = require('dat-gui');
var Matter = require('matter-js');
var SimplexNoise = require('simplex-noise');


var audioSamples = 16;

var SoundCloudAudioSource = function(audioElement, audioFile) {
	this.isPlaying = false;
	var player = document.getElementById(audioElement);
	var self = this;
	var analyser;
	var audioCtx = new (window.AudioContext || window.webkitAudioContext);
	analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = 0.6;
	analyser.minDecibels = -200;
	analyser.maxDecibels = 0;

	analyser.fftSize = audioSamples * 2;
	var source = audioCtx.createMediaElementSource(player);
	source.connect(analyser);
	analyser.connect(audioCtx.destination);
	this.streamData = new Uint8Array(audioSamples);
	this.sampleAudioStream = function() {

		analyser.getByteFrequencyData(self.streamData);
		var total = 0;
		self.volume = total;
	}; 
	this.volume = 0;
	player.setAttribute('src', audioFile);
	this.stopPlayStream = function() {
		if(!this.isPlaying) player.play();
		else player.pause();
	}
};

var audioSmoothing = 0.5

var fftSmooth = []
for( var i = 0 ; i < 128 ; i++ ) fftSmooth[i] = 0;
var minVal = 0.0;
var maxVal = 0.0;
var firstMinDone = false;

var dB = function(x) {
  if (x == 0) {
    return 0;
  }
  else {
    return 10 * Math.log10(x);
  }
}




var Data = function( parent ){
	var _this = this;
	this.parent = parent;

	// main params
	this.bigRadius = 200;
	this.extRadius = 200;
	this.ringRadius = 50;
	this.intRadius = 50;
	this.rings = 256;
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
	this.substrateInc = 0;
	this.audio = false;
	this.speed = 0.01;
	this.timeStep = 0;
	this.audioData = [];
	this.generators = [];
	this.audioSamples = audioSamples;
	for( var i = 0 ; i < 3 ; i++ ) this.generators.push( new SimplexNoise( Math.random ) );

	this.audioSource = new SoundCloudAudioSource('player','media/track' + Math.floor( Math.random() * 2 + 1 ) + '.mp3');

	var GuiParameters = function() {
		this.extRadius = _this.extRadius;
		this.intRadius = _this.intRadius;
		this.temperature = _this.temperature;
		this.soil = _this.soil;
		this.air = _this.airInc;
		this.water = _this.water;
		this.light = _this.light;

		this.rings = _this.rings;
		this.segments = _this.segments;

		this.substrate = function(){
			_this.addSubstrate();
		}

		this.export = function(){
			_this.parent.export();
		}

		this.playPauseAudio = function(){
			_this.audioSource.stopPlayStream();
			_this.audioSource.isPlaying = !_this.audioSource.isPlaying;
		}
	};

	this.gui = new GuiParameters();

	var gui = new Dat.GUI();

	this.f1 = gui.addFolder('Main data');
	this.f1.add( this.gui, 'rings', [ 128, 256, 512, 1024 ] ).listen().onChange( function( value ){ _this.rings = value; }.bind(this) );
	this.f1.add( this.gui, 'segments', [ 32, 64, 128, 256 ] ).listen().onChange( function( value ){ _this.segments = value; }.bind(this) );
	this.f1.add( this.gui, 'extRadius', 100, 400 ).listen().onChange( function( value ){ _this.extRadius = value; }.bind(this) );
	this.f1.add( this.gui, 'intRadius', 5, 100 ).listen().onChange( function( value ){ _this.intRadius = value; }.bind(this) );
	this.f1.add( this.gui, 'temperature', 0, 1 ).listen().onChange( function( value ){ _this.temperature = value; }.bind(this) );
	this.f1.add( this.gui, 'soil', 0, 1 ).listen().onChange( function( value ){ _this.soil = value; }.bind(this) );
	this.f1.add( this.gui, 'air', 0, 1 ).listen().onChange( function( value ){ _this.airInc = value; }.bind(this) );
	this.f1.add( this.gui, 'water' ).listen().onChange( function( value ){ _this.water = value; }.bind(this) );
	this.f1.add( this.gui, 'light' ).listen().onChange( function( value ){ _this.light = value; }.bind(this) );
	this.f1.add( this.gui, 'substrate' );
	this.f1.add( this.gui, 'playPauseAudio');
	this.f1.add( this.gui, 'export');

	this.f1.open();

	var engine = Matter.Engine.create();
	engine.world.gravity.y = 0;

	// var render = Matter.Render.create({
	// 	element: document.getElementById('renderer'),
	// 	engine: engine,
	// 	options : {
	// 		background : '#ffffff00',
	// 		wireframeBackground : "#ffffff00",
	// 		showCollisions : true,
	// 		pixelRatio : 1,
	// 		width : this.parent.containerEl.offsetWidth,
	// 		height : this.parent.containerEl.offsetHeight
	// 	}
	// });

	this.substrateParticle = Matter.Bodies.circle( this.parent.containerEl.offsetWidth / 2, this.parent.containerEl.offsetHeight / 2 - 30, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}});
	this.substrateAnchor = Matter.Bodies.circle( this.parent.containerEl.offsetWidth / 2, this.parent.containerEl.offsetHeight / 2 - 30, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}});
	Matter.Body.setStatic(this.substrateAnchor, true );
	Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.substrateParticle, pointA: { x: 0, y: 0 }, bodyB: this.substrateAnchor, pointB: { x: 0, y: 0 }, stiffness: .05, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));

	this.stack = Matter.Composite.create();
	this.fixed = Matter.Composite.create();
	for (var i = 0; i < audioSamples; i++) {
		Matter.Composite.add( this.fixed, Matter.Bodies.circle( this.parent.containerEl.offsetWidth * i / audioSamples, this.parent.containerEl.offsetHeight / 2, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}}));
		Matter.Composite.add( this.stack, Matter.Bodies.circle( this.parent.containerEl.offsetWidth * i / audioSamples, this.parent.containerEl.offsetHeight / 2, 3, { friction: 0, restitution: .1, density: 1, collisionFilter: {category: undefined}}));
	};

	for ( var i = 0; i < audioSamples; i ++ ) {
		Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.fixed.bodies[i], pointA: { x: 0, y: 0 }, bodyB: this.stack.bodies[i], pointB: { x: 0, y: 0 }, stiffness: .1, render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));
		if( i < audioSamples - 1) Matter.World.add(engine.world, Matter.Constraint.create({bodyA: this.stack.bodies[i], pointA: { x: 0, y: 0 }, bodyB: this.stack.bodies[i+1], pointB: { x: 0, y: 0 }, stiffness: .05 , render: { strokeWidth : .01, strokeStyle:'#00ffff'}}));
		Matter.Body.setStatic(this.fixed.bodies[i], true );
	}

	Matter.World.add( engine.world, [ this.substrateParticle, this.substrateAnchor, this.stack, this.fixed ] );
	Matter.Engine.run(engine);
	// Matter.Render.run(render);

}

Data.prototype.update = function( data ){
	var _this = this;
	var param = JSON.parse(data);
	for( key in param ){
		if( key == 'temperature' ) this.gui.temperature = param[key];
		if( key == 'air' ) this.gui.air = param[key];
		if( key == 'soil' ) this.gui.soil = param[key];

		if( key == 'water'  ) _this.water = key;
		if( key == 'light'  ) _this.light = key;

		if( key == 'substrate'  ) this.addSubstrate();

		if( key == 'audio'  ) {
			if( param[key] ){
				_this.audioSource.isPlaying = false;
				_this.audioSource.stopPlayStream();
				_this.audioSource.isPlaying = true;
				
			} else {
				_this.audioSource.isPlaying = true;
				_this.audioSource.stopPlayStream();
				_this.audioSource.isPlaying = false;
			}
		}
	}
}

Data.prototype.addSubstrate = function(){
	if( this.substrateInc < 0.1 ) this.substrateInc = 0.25;
	else if( this.substrateInc > 0 && this.substrateInc < 0.25 ) this.substrateInc = 0.5;
	else if( this.substrateInc >= 0.25 && this.substrateInc < 0.5 ) this.substrateInc = 0.75;
	else this.substrateInc = 1;
}

Data.prototype.step = function( time ){

	// water
	this.waterStep += 0.01;
	this.waterIntensity += ( this.water - this.waterIntensity ) * 0.05;

	//light
	this.lightInc += ( Math.max( Math.min( this.light, 0.005 ), 0.0001 ) - this.lightInc ) * 0.05;
	( this.lightStep < 1 ) && ( this.lightStep += this.lightInc ) || ( this.lightStep  = 0 );

	//substrate
	Matter.Body.applyForce( this.substrateParticle, this.substrateAnchor.position, { x : 0 , y: -this.substrateInc } );
	if( this.substrateInc > 0 ) this.substrateInc -= 0.001;
	this.substrate = ( this.substrateAnchor.position.y - this.substrateParticle.position.y ) / 250;
	this.bigRadius = this.extRadius + this.extRadius * this.substrate;
	this.ringRadius = this.intRadius + this.intRadius * this.substrate;

	// audio
	this.audioSource.sampleAudioStream();
	
	this.timeStep += this.speed;
	this.air += 0.0005 + 0.003 * this.airInc;
 	

	for( var i = 0 ; i < audioSamples ; i++ ){

		var fftCurr = dB(this.audioSource.streamData[i]);
		fftSmooth[i] = audioSmoothing * fftSmooth[i] + ((1-audioSmoothing)*fftCurr);
		if(fftSmooth[i] > maxVal ) maxVal = fftSmooth[i];
		if(!firstMinDone || (fftSmooth[i] < minVal))  minVal = fftSmooth[i];

	}

	var range = maxVal - minVal;
	var scaleFactor = range + 0.00001;
	var maxHeight = 1;


	for( var i = 0 ; i < audioSamples ; i++ ){
		var fftSmoothDisplay = maxHeight * ((fftSmooth[i] - minVal) / scaleFactor);
		Matter.Body.applyForce( this.stack.bodies[ i ], this.fixed.bodies[ i ].position, { x : 0 , y: -fftSmoothDisplay } );
		this.audioData[i] = (this.fixed.bodies[ i ].position.y - this.stack.bodies[ i ].position.y) / 125 ;
	}


	for( var j = 0 ; j < 3 ; j++ ){
		var pos = [], zeropos = [];
		var audio = 1;
		// if( j == 0 ) audio = this.audioData[0];
		// if( j == 1 ) audio = this.audioData[8];
		// if( j == 2 ) audio = this.audioData[14];
		
		for( var i = 0 ; i < this.segments ; i++ ){
			var p = [ Math.cos( Math.PI * 2 * i / ( this.segments ) ), Math.sin( Math.PI * 2 * i / ( this.segments ) ) ];
			if( i == 0 ){
				var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.temperature * this.ringRadius / 5;
				pos.push( audio * p[0] * ( this.ringRadius + n ), p[1] * ( this.ringRadius + n ), 0 );
			}
			var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.temperature * this.ringRadius / 5;
			pos.push( audio * p[0] * ( this.ringRadius + n ), p[1] * ( this.ringRadius + n ), 0 );
			if( i == this.segments - 1 ) pos.push( zeropos[0], zeropos[1], 0, zeropos[0], zeropos[1], 0 );	
			if( i == 0 ){
				var n = this.generators[j].noise2D( p[0] + this.timeStep, p[1] ) * this.temperature * this.ringRadius / 5;
				zeropos = [ audio * p[0] * ( this.ringRadius + n ), p[1] * ( this.ringRadius + n ), 0 ];
			}
		}
		this[ 'pos' + j ] = pos;
	}
	

}

module.exports = Data;