window.webkitRequestAnimationFrame = window.requestAnimationFrame;

var Dat = require('dat-gui');
var Matter = require('matter-js');
var SimplexNoise = require('simplex-noise');
var TweenMax = require('gsap');

var audioSamples = 16;

var SoundCloudAudioSource = function(audioElement, audioFile) {
	this.isPlaying = false;
	this.player = document.getElementById(audioElement);
	
	var self = this;
	var analyser;
	var audioCtx = new (window.AudioContext || window.webkitAudioContext);
	analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = 0.0;
	analyser.minDecibels = -200;
	analyser.maxDecibels = 0;

	analyser.fftSize = audioSamples * 2;
	var source = audioCtx.createMediaElementSource(this.player);
	source.connect(analyser);
	analyser.connect(audioCtx.destination);
	this.streamData = new Uint8Array(audioSamples);
	this.sampleAudioStream = function() {
		analyser.getByteFrequencyData(self.streamData);
		var total = 0;
		self.volume = total;
	}; 
	this.player.setAttribute('src', audioFile);
	this.playStream = function(){ this.player.play(); }
	
	this.stopStream = function() { this.player.pause(); }

};

var audioSmoothing = 0.5

var fftSmooth = []
for( var i = 0 ; i < 128 ; i++ ) fftSmooth[i] = 0;
var minVal = 0.0;
var maxVal = 0.0;
var firstMinDone = false;

var dB = function(x) {
	if (x == 0) return 0;
	else return 10 * Math.log10(x);
}


function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}



var lightAudio = new Audio('media/light.mp3');
var waterAudio = new Audio('media/water.mp3');
var substrateAudio = new Audio('media/substrate.mp3');


var Data = function( parent, params ){
	var _this = this;
	this.parent = parent;

	// main params
	this.bigRadius = params.bigRadius || 200;
	this.extRadius = params.bigRadius || 200;
	this.ringRadius = params.ringRadius || this.bigRadius / 3.2;
	this.intRadius = params.ringRadius || this.bigRadius / 3.2;
	this.rings = params.rings || 256;
	this.segments = params.segments || 64;
	this.pos0 = [];
	this.pos1 = [];
	this.pos2 = [];
	this.temperature = Math.random();
	this.soil = Math.random();
	this.air = Math.random();
	this.airInc = Math.random();
	this.prevWater = false;
	this.water = false;
	this.waterStep = 0.5;
	this.waterPhase = 300;
	this.waterIntensity = 0;
	this.waterDuration = 5000;
	this.waterTimerIsOn = false;
	this.waterTimer = 0;
	this.prevLight = false;
	this.light = false;
	this.lightStep = Math.random();
	this.lightInc = 0.0001;
	this.lightDuration = 5000;
	this.lightTimerIsOn = false;
	this.lightTimer = 0;
	this.substrateAnimate = false;
	this.substrate = 0;
	this.substrateInc = 0;
	this.prevAudio = false;
	this.audioTimerIsOn = false;
	this.audioTimer = 0;
	this.audio = false;
	this.speed = 0.01;
	this.timeStep = 0;
	this.audioData = [];
	this.generators = [];
	this.audioSamples = audioSamples;
	this.sliders = {};
	for( var i = 0 ; i < 3 ; i++ ) this.generators.push( new SimplexNoise( Math.random ) );

	this.audioSource = new SoundCloudAudioSource('player','media/audio1.mp3');
	
	this.stop1 = document.getElementById('stop1');
	this.stop2 = document.getElementById('stop2');
	

	var inners = document.getElementsByClassName('inner');
	for( var i = 0 ; i < inners.length ; i++ ) this.sliders[inners[i].getAttribute('id')] = inners[i];

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
			_this.audio = !_this.audio;
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

	this.f1.close();

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
		if( key == 'temperature' ) this.gui.temperature = this.temperature = param[key];
		if( key == 'air' ) this.gui.air = this.air = param[key];
		if( key == 'soil' ) this.gui.soil = this.soil = param[key];
		if( key == 'water'  ){
			this.gui.water = this.water = param[key];
			if( param[key] ) waterAudio.play();
		}
		if( key == 'light'){
			this.gui.light = this.light = param[key];
			if( param[key] ) lightAudio.play();
		}
		if( key == 'substrate'  ){
			if( param[key] ) this.addSubstrate();
			else this.removeSubstrate();
		}
		if( key == 'audio'  ) {
			if( param[key] ){
				// _this.audioSource.playStream();
				this.audio = true;
			} else {
				// _this.audioSource.stopStream();
				this.audio = false;
			}
		}
	}
}

Data.prototype.addSubstrate = function(){
	var val;
	substrateAudio.play();
	if( this.substrate < 0.1 ) val = 0.25;
	else if( this.substrate > 0 && this.substrate < 0.25 ) val = 0.5;
	else if( this.substrate >= 0.25 && this.substrate < 0.5 ) val = 0.75;
	else val = 1;

	this.substrateAnimate = true;

	this.substrateTimerTween = TweenMax.to(this, 1, { 
		substrate: val,
		ease: Elastic.easeOut.config(1, 0.4),
		onComplete : function(){
			this.substrateAnimate = false;
		}.bind(this)
	} );
}


Data.prototype.removeSubstrate = function(){
	var val;
	if( this.substrate > 0.75 ) val = 0.75;
	else if( this.substrate > 0.5 && this.substrate <= 0.75 ) val = 0.5;
	else if( this.substrate > 0.25 && this.substrate <= 0.5 ) val = 0.25;
	else val = 0;

	this.substrateAnimate = true;

	this.substrateTimerTween = TweenMax.to(this, 1, { 
		substrate: val,
		ease: Elastic.easeOut.config(1, 0.4),
		onComplete : function(){
			this.substrateAnimate = false;
		}.bind(this)
	} );
}

Data.prototype.waterSwitch = function( val ){
	this.waterTimerTween = TweenMax.to(this, 1, { 
		waterTimer: val,
		ease: Power3.easeOut,
		onComplete : function(){
			if( val ) this.waterTimerIsOn = true;
			else this.waterTimerIsOn = false;
		}.bind(this)
	} );
}

Data.prototype.lightSwitch = function( val ){
	this.lightSwitchTween = TweenMax.to(this, 1, { 
		lightTimer: val,
		ease: Power3.easeOut,
		onComplete : function(){
			if( val ) this.lightTimerIsOn = true;
			else this.lightTimerIsOn = false;
		}.bind(this)
	} );
}

Data.prototype.audioSwitch = function( val ){
	if(!val) this.audioSource.stopStream();
	if( val) this.audioSource.player.currentTime = 0;
	this.audioSwitchTween = TweenMax.to(this, 1, { 
		audioTimer: val,
		ease: Power3.easeOut,
		onComplete : function(){
			if( val ) {
				this.audioSource.playStream();
				this.audioSource.isPlaying = !this.audioSource.isPlaying;
				this.audioTimerIsOn = true;
			}else{
				this.audioSource.stopStream();
				this.audioTimerIsOn = false;
				
			}
		}.bind(this)
	} );
}

Data.prototype.step = function( time ){
	this.sliders.temperature.style['transform'] = 'scale(' + this.temperature + ',1)';
	this.sliders.soil.style['transform'] = 'scale(' + this.soil + ',1)';
	this.sliders.airInc.style['transform'] = 'scale(' + this.airInc + ',1)';
	this.sliders.waterTimer.style['transform'] = 'scale(' + this.waterTimer + ',1)';
	this.sliders.substrate.style['transform'] = 'scale(' + this.substrate + ',1)';
	this.sliders.lightTimer.style['transform'] = 'scale(' + this.lightTimer + ',1)';
	this.sliders.audioTimer.style['transform'] = 'scale(' + this.audioTimer + ',1)';

	// water
	if( this.prevWater !== this.water && !this.prevWater ) this.waterSwitch( 1 );
	if( this.prevWater !== this.water && this.prevWater ) this.waterSwitch( 0 );
	if( this.waterTimerIsOn ) this.waterTimer -= ( 1 / 60 ) / ( this.waterDuration / 1000 );
	if( this.waterTimerIsOn && this.waterTimer <= 0 ) this.waterTimerIsOn = this.gui.water = this.water = false;
	this.waterStep += 0.01;
	this.waterIntensity += ( this.water - this.waterIntensity ) * 0.05;
	this.prevWater = this.water;

	//light
	this.lightInc += ( Math.max( Math.min( this.light, 0.005 ), 0.0001 ) - this.lightInc ) * 0.05;
	( this.lightStep < 1 ) && ( this.lightStep += this.lightInc ) || ( this.lightStep  = 0 );

	if( this.prevLight !== this.light && !this.prevLight ) this.lightSwitch( 1 );
	if( this.prevLight !== this.light && this.prevLight ) this.lightSwitch( 0 );
	if( this.lightTimerIsOn ) this.lightTimer -= ( 1 / 60 ) / ( this.lightDuration / 1000 );
	if( this.lightTimerIsOn && this.lightTimer <= 0 ) this.lightTimerIsOn = this.gui.light = this.light = false;
	this.prevLight = this.light;

	//update logo color
	var c1 = HSVtoRGB(this.lightStep + 0.2,0.9,0.7);
	var c2 = HSVtoRGB(this.lightStep,0.9,0.7);
	this.stop1.style['stop-color'] = 'rgb('+c1.r+','+c1.g+','+c1.b+')';
	this.stop2.style['stop-color'] = 'rgb('+c2.r+','+c2.g+','+c2.b+')';

	//substrate
	if( this.substrate > 0 && !this.substrateAnimate ) this.substrate -= 0.001;
	this.bigRadius = this.extRadius + this.extRadius * this.substrate;
	this.ringRadius = this.intRadius + this.intRadius * this.substrate;


	// audio
	this.audioSource.sampleAudioStream();
	if( this.prevAudio !== this.audio && !this.prevAudio ) this.audioSwitch( 1 );
	if( this.prevAudio !== this.audio && this.prevAudio ) this.audioSwitch( 0 );
	if( this.audioTimerIsOn ) {
		var audioPosition = this.audioSource.player.currentTime / this.audioSource.player.duration;
		this.audioTimer = 1 - audioPosition;
	}
	this.prevAudio = this.audio;

	
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
}

module.exports = Data;