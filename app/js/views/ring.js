var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');
var Work = require('webworkify');

var Ring = function( parent, segmentRadius ){
	this.parent = parent;
 	this.speed = 0.01;
	this.timeStep = 0;
	this.segmentRadius = segmentRadius;
	
	this.waterStep = 0.5;

	var position = [], ids = [], iids = [];

	for( var j = 0 ; j < this.parent.data.rings ; j++ ){
		for( var i = 0 ; i < this.parent.data.segments + 3 ; i++ ){
			position.push( 0, 0, 0 );
			ids.push( j );
			iids.push( i );
		}
	}

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( [] ), 4 ) );
	geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( ids ), 1 ) );
	geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( iids ), 1 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			temperature : { value : this.parent.data.gui.temperature  },
			soil : { value : this.parent.data.gui.soil  },
			air : { value : this.parent.data.gui.air  },
			pos0 : { value : [] },
			pos1 : { value : [] },
			pos2 : { value : [] },
			light : { value : this.parent.data.gui.light },
			substrate : { value : 1 },
			waterStep : { value : this.waterStep },
			waterIntensity : { value : this.parent.data.waterIntensity },
			waterPhase : { value : this.parent.data.waterPhase },
			ringRadius : { value : this.parent.data.ringRadius },
			audioData : { value :[] },
			totalCircles : { value : this.parent.data.rings },
			time : { value : 0 }
		},
		transparent : true,
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );

	this.updateColors( );

	this.parent.emitter.on('export', function( value ) {
		this.export();
	}.bind(this));
}
	
Ring.prototype.updateColors = function( ){
	var color = [];
	for( var j = 0 ; j < this.parent.data.rings; j++ ){
		color.push(0,0,0,0);
		for( var i = 0 ; i < this.parent.data.segments ; i++ ) color.push(0,0,0,1);
		color.push(0,0,0,1,0,0,0,0);
	}
	
	this.mesh.geometry.attributes.color.array = new Float32Array( color );
	this.mesh.geometry.attributes.color.needsUpdate = true;
}

Ring.prototype.export = function( ) {
	var w = Work( require('./export.js') );
	
	w.addEventListener('message', function (ev) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(ev.data, "image/svg+xml");
		this.parent.containerEl.appendChild(doc.childNodes[0]);

		// var source = ev.data;

		// var element = document.createElement('a');
		// element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ev.data));
		// element.setAttribute('download', 'SVGexport');

		// element.style.display = 'none';
		// document.body.appendChild(element);

		// element.click();

		// document.body.removeChild(element);

	}.bind(this));

	w.postMessage( JSON.stringify( this.mesh.material.uniforms ) );
};

Ring.prototype.step = function(time){
	this.timeStep += this.speed;
	this.waterStep += 0.001 + this.parent.data.gui.water / 100;

	this.mesh.material.uniforms.substrate.value = 1 + this.parent.data.substrate;
	this.mesh.material.uniforms.light.value = this.parent.data.gui.light;
	this.mesh.material.uniforms.waterStep.value = this.waterStep;
	this.mesh.material.uniforms.waterIntensity.value = 0.1 + 0.9 * this.parent.data.gui.water;

	this.mesh.material.uniforms.waterPhase.value = 300 + 100 * this.parent.data.gui.water;

	this.mesh.material.uniforms.audioData.value = this.parent.data.audioData;
	this.mesh.material.uniforms.time.value += 0.11;

	this.mesh.material.uniforms.temperature.value = this.parent.data.gui.temperature / 50 - 1;
	this.mesh.material.uniforms.soil.value = this.parent.data.gui.soil / 50 - 1;
	this.mesh.material.uniforms.air.value = this.parent.data.gui.air / 50 - 1;

	this.mesh.material.uniforms.pos0.value = this.parent.data.pos0;
	this.mesh.material.uniforms.pos1.value = this.parent.data.pos1;
	this.mesh.material.uniforms.pos2.value = this.parent.data.pos2;
	
	this.mesh.geometry.attributes.position.needsUpdate = true;
}

module.exports = Ring;