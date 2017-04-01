var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');
var exportFS = require('./../../shaders/exportFS.glsl');
var Work = require('webworkify');

var Ring = function( parent ){
	this.parent = parent;

	var position = [], ids = [], iids = [], tids = [];

	var inc = 0;
	for( var j = 0 ; j < this.parent.data.rings - 1 ; j++ ){
		for( var i = 0 ; i < this.parent.data.segments + 3 ; i++ ){
			position.push( 0, 0, 0 );
			ids.push( j );
			iids.push( i );
			tids.push(inc);
			inc++;
		}
	}

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( position ), 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( [] ), 4 ) );
	geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( ids ), 1 ) );
	geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( iids ), 1 ) );
	geometry.addAttribute( 'tids', new THREE.BufferAttribute( new Float32Array( tids ), 1 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			bigRadius : { value : 0 },
			pos0 : { value : [] },
			pos1 : { value : [] },
			pos2 : { value : [] },
			temperature : { value : 0  },
			soil : { value : 0  },
			air : { value : 0  },
			waterStep : { value : 0 },
			waterPhase : { value : 0 },
			waterIntensity : { value : 0 },
			lightStep : { value : 0 },
			substrate : { value : 1 },
			audioData : { value :[] },
			rings : { value : this.parent.data.rings }
		},
		transparent : true,
		vertexShader: lineVs,
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );
	
	var color = [];
	for( var j = 0 ; j < this.parent.data.rings - 1; j++ ){
		color.push(0,0,0,0);
		for( var i = 0 ; i < this.parent.data.segments ; i++ ) color.push(0,0,0,1);
		color.push(0,0,0,1,0,0,0,0);
	}
	this.mesh.geometry.attributes.color.array = new Float32Array( color );
	this.mesh.geometry.attributes.color.needsUpdate = true;

	this.parent.emitter.on('export', this.export.bind(this));

	var totalVertices = this.parent.data.rings * ( this.parent.data.segments + 3);
	// console.log(totalVertices);

	var renderTarget = new THREE.WebGLRenderTarget( 512, 512, {
		wrapS: null,
		wrapT: null,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
		stencilBuffer: false
	} );

	this.planeGeometry = new THREE.PlaneBufferGeometry( 512, 512 );
	this.planeMaterial = new THREE.ShaderMaterial( {
		uniforms: {

		},
		vertexShader: lineVs,
		fragmentShader: exportFS
	} );

	// this.planeMaterial = new THREE.MeshBasicMaterial({ color : 0xff0000 })
	this.plane = new THREE.Mesh( this.planeGeometry, this.planeMaterial );
}

Ring.prototype.export = function( ) {
	var w = Work( require('./export.js') );
	this.exporting = true;
	w.addEventListener('message', function (ev) {

		// var parser = new DOMParser();
		// var doc = parser.parseFromString(ev.data, "image/svg+xml");
		// this.parent.containerEl.appendChild(doc.childNodes[0]);

		
		var source = ev.data;

		var element = document.createElement('a');
		element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ev.data));
		element.setAttribute('download', 'SVGexport');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);

	}.bind(this));

	w.postMessage( JSON.stringify( this.mesh.material.uniforms ) );
};

Ring.prototype.step = function(time){
	this.mesh.material.uniforms.bigRadius.value = this.parent.data.bigRadius;
	this.mesh.material.uniforms.pos0.value = this.parent.data.pos0;
	this.mesh.material.uniforms.pos1.value = this.parent.data.pos1;
	this.mesh.material.uniforms.pos2.value = this.parent.data.pos2;
	this.mesh.material.uniforms.temperature.value = this.parent.data.temperature;
	this.mesh.material.uniforms.soil.value = this.parent.data.soil;
	this.mesh.material.uniforms.air.value = this.parent.data.air;
	this.mesh.material.uniforms.waterIntensity.value = this.parent.data.waterIntensity;
	this.mesh.material.uniforms.waterPhase.value = this.parent.data.waterPhase;
	this.mesh.material.uniforms.waterStep.value = this.parent.data.waterStep;
	this.mesh.material.uniforms.lightStep.value = this.parent.data.lightStep;
	this.mesh.material.uniforms.substrate.value = this.parent.data.substrate;

	this.plane.material.uniforms = this.mesh.material.uniforms;
	// this.mesh.material.uniforms.audioData.value = this.parent.data.audioData;

	this.plane.geometry.attributes.position.needsUpdate = true;
	this.mesh.geometry.attributes.position.needsUpdate = true;
}

module.exports = Ring;