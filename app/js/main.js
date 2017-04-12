window.THREE = require('three');

var Work = require('webworkify');

var Ring = require('./views/ring');
var Data = require('./views/data');


var App = function() {
	var _this = this;
	
	var host;
	if( location.origin.indexOf( 'localhost' ) !== -1 ) host = 'ws://localhost:5000/';
	else host = location.origin.replace(/^http/, 'ws')
	var ws = new WebSocket( host );

	ws.onmessage = function (event) {
		_this.data.update( event.data );
	};

	this.containerEl = document.getElementById('main');

	var params = {};

	params.bigRadius = Math.min( this.containerEl.offsetWidth, this.containerEl.offsetHeight ) / 4.2;
	
	if( params.bigRadius < 50 ) params.rings = 64;
	else if( params.bigRadius >= 50 && params.bigRadius < 100 ) params.rings = 128;
	else if( params.bigRadius >= 100 && params.bigRadius < 200 ) params.rings = 256;
	else if( params.bigRadius >= 200 && params.bigRadius < 400 ) params.rings = 512;
	else if( params.bigRadius >= 400 && params.bigRadius < 800 ) params.rings = 1024;
	else params.rings = 2048;

	if( params.bigRadius < 50 ) params.segments = 8;
	else if( params.bigRadius >= 50 && params.bigRadius < 100 ) params.segments = 16;
	else if( params.bigRadius >= 100 && params.bigRadius < 400 ) params.segments = 64;
	else params.segments = 128;

	var isiPad = navigator.userAgent.match(/iPad/i) != null;
	if(isiPad) params.segments = 32;

	this.data = new Data( this, params );
	this.ring = new Ring( this );
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera( );


	this.container = new THREE.Object3D();
	this.container.add( this.ring.mesh );
	this.scene.add( this.container );
	
	this.firstResize = true;
	window.onresize = this.onResize.bind( this );

	this.onResize(); 

	this.step();
}

App.prototype.export = function(){
	var w = Work( require('./views/export.js') );
	w.addEventListener('message', function (ev) {

		// var parser = new DOMParser();
		// var doc = parser.parseFromString(ev.data, "image/svg+xml");
		// this.parent.containerEl.appendChild(doc.childNodes[0]);

		csvData = new Blob([ev.data], { type: 'image/svg+xml', charset : 'utf-8' }); 
		var csvUrl = URL.createObjectURL(csvData);
		var element = document.createElement('a');
		element.setAttribute('href', csvUrl);
		element.setAttribute('download', 'SVGexport');
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}.bind(this));

	w.postMessage( JSON.stringify( this.ring.mesh.material.uniforms ) );
}

App.prototype.onResize = function(e) {
	this.renderer.setSize( this.containerEl.offsetWidth * 2, this.containerEl.offsetHeight * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + this.containerEl.offsetWidth + 'px; height:' + this.containerEl.offsetHeight + 'px' );
	this.camera.left = this.containerEl.offsetWidth / - 2;
	this.camera.right = this.containerEl.offsetWidth / 2;
	this.camera.top = this.containerEl.offsetHeight / 2;
	this.camera.bottom = this.containerEl.offsetHeight / - 2;
	this.camera.position.z = 1;
	this.camera.updateProjectionMatrix();
	clearTimeout( this.resizeStart );
	if( !this.firstResize ) this.resizeStart = setTimeout( this.onResizeEnd.bind(this), 400 );
	this.firstResize = false;
	this.container.position.x = this.containerEl.offsetWidth / 6;
}

App.prototype.onResizeEnd = function(e) {
	// this.ring.onResizeEnd();
	// for( var i = 0 ; i < this.scene.children.length ; i++ ){
	// 	this.scene.remove( this.scene.children[i] );
	// }
	// this.container = new THREE.Object3D();
	// this.container.add( this.ring.mesh );
	// this.scene.add( this.container );
}

App.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	
	this.data.step( time );
	this.ring.step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();