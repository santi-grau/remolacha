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

	this.data = new Data( this );
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
	// this.exporting = true;
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
		// this.exporting = false;
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
}

App.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	// if( this.exporting ) return false;
	
	this.data.step( time );
	this.ring.step( time );
	this.renderer.render( this.scene, this.camera );
};

var app = new App();