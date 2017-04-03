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

	params.bigRadius = Math.min( this.containerEl.offsetWidth, this.containerEl.offsetHeight ) / 4.8;
	
	if( params.bigRadius < 50 ) params.rings = 64;
	else if( params.bigRadius >= 50 && params.bigRadius < 100 ) params.rings = 128;
	else if( params.bigRadius >= 100 && params.bigRadius < 200 ) params.rings = 256;
	else if( params.bigRadius >= 200 && params.bigRadius < 400 ) params.rings = 512;
	else if( params.bigRadius >= 400 && params.bigRadius < 800 ) params.rings = 1024;
	else params.rings = 2048;

	this.data = new Data( this, params );
	this.ring = new Ring( this );
	
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.containerEl.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera( );

	this.scene.add( this.ring.mesh );

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
	this.resizeStart = setTimeout( this.onResizeEnd.bind(this), 400 );
}

App.prototype.onResizeEnd = function(e) {
	// var params = {};
	// this.data.bigRadius = Math.min( this.containerEl.offsetWidth, this.containerEl.offsetHeight ) / 4.8;
	// this.data.rings = 64 * 2;
	// if( Math.abs( this.data.bigRadius - 128 ) < Math.abs( this.data.bigRadius - 256 ) ) this.data.rings = 128 * 2;
	// else if( Math.abs( this.data.bigRadius - 256 ) < Math.abs( this.data.bigRadius - 512 ) ) this.data.rings = 256 * 2;
	// else if( Math.abs( this.data.bigRadius - 512 ) < Math.abs( this.data.bigRadius - 1024 ) ) this.data.rings = 512 * 2;
	// else if( Math.abs( this.data.bigRadius - 1024 ) < Math.abs( this.data.bigRadius - 2048 ) ) this.data.rings = 1024 * 2;
	// else this.data.rings = 2048 * 2;

	// this.ring.onResizeEnd();

}

App.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	
	this.data.step( time );
	this.ring.step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();