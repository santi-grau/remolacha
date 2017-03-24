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
    var audioCtx = new (window.AudioContext || window.webkitAudioContext); // this is because it's not been standardised accross browsers yet.
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256; // see - there is that 'fft' thing. 
    var source = audioCtx.createMediaElementSource(player); // this is where we hook up the <audio> element
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    this.streamData = new Uint8Array(128);
    this.sampleAudioStream = function() {

        analyser.getByteFrequencyData(self.streamData);
        // calculate an overall volume value
        var total = 0;
        //self.streamData = analyser;
 
        self.volume = total;
    }; 
    // public properties and methods
    this.volume = 0;
     // This just means we will have 128 "bins" (always half the analyzer.fftsize value), each containing a number between 0 and 255. 
   
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

	this.ring = new Ring( this, 50, 300 );
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 20, this.containerEl.offsetWidth / this.containerEl.offsetHeight, .1, 10000 );

	this.scene.add( this.ring.mesh );

	window.onresize = this.onResize.bind( this );

	this.onResize();

	// var dataJSON = {
	// 	temperature : 30,
	// 	air : 60,
	// 	soil : 40,
	// 	water : false,
	// 	light : false,
	// 	substrate : true
	// };
	// this.data.update( JSON.stringify(dataJSON) );

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

	this.ring.step( time );
	this.data.step( time )
	this.renderer.render( this.scene, this.camera );
};

var app = new App();