window.THREE = require('three');
var TweenMax = require('gsap');
var EventEmitter = require('events').EventEmitter;

window.webkitRequestAnimationFrame = window.requestAnimationFrame;

var Ring = require('./views/ring');
var Data = require('./views/data');


var SoundCloudAudioSource = function(audioElement, audioFile) {
	this.isPlaying = false;
	var player = document.getElementById(audioElement);
	var self = this;
	var analyser;
	var audioCtx = new (window.AudioContext || window.webkitAudioContext);
	analyser = audioCtx.createAnalyser();
	analyser.fftSize = 256;
	var source = audioCtx.createMediaElementSource(player);
	source.connect(analyser);
	analyser.connect(audioCtx.destination);
	this.streamData = new Uint8Array(128);
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


var App = function() {
	var _this = this;
	
	var host;
	if( location.origin.indexOf( 'localhost' ) !== -1 ) host = 'ws://localhost:5000/';
	else host = location.origin.replace(/^http/, 'ws')
	var ws = new WebSocket( host );
	
	this.audioSource = new SoundCloudAudioSource('player','media/track' + Math.floor( Math.random() * 2 + 1 ) + '.mp3');

	ws.onmessage = function (event) {
		_this.data.update( event.data );
	};

	this.emitter = new EventEmitter();

	this.containerEl = document.getElementById('main');

	this.data = new Data( this );
	this.ring = new Ring( this );
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 20, this.containerEl.offsetWidth / this.containerEl.offsetHeight, .1, 10000 );

	this.scene.add( this.ring.mesh );

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

	
	this.data.step( time );
	this.ring.step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();