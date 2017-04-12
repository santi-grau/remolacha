var lineVs = require('./../../shaders/lineVs.glsl');
var lineFs = require('./../../shaders/lineFs.glsl');

String.prototype.replaceAll = function(search, replacement){
	var target = this;
	return target.replace(new RegExp(search,'g'),replacement);
}

var Ring = function( parent ){
	this.parent = parent;

	var geometry = new THREE.BufferGeometry();
	var attributes = this.getAttributes();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( attributes.position ), 3 ) );
	geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( attributes.ids ), 1 ) );
	geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( attributes.iids ), 1 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( attributes.color ), 4 ) );

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
			rings : { value : this.parent.data.rings },
			audioSamples : { value : 0 }
		},
		transparent : true,
		vertexShader: lineVs.replaceAll( 'segmentsNum', ' ' + ( this.parent.data.segments + 3 ) + ' ' ),
		fragmentShader: lineFs
	} );

	this.mesh = new THREE.Line( geometry, material );
	console.log( geometry)
}

Ring.prototype.getAttributes = function(){
	var position = [], ids = [], iids = [], color = [];
	for( var i = 0 ; i < this.parent.data.rings - 1 ; i++ ){
		for( var j = 0 ; j < this.parent.data.segments + 3 ; j++ ){
			position.push( 0, 0, 0 );
			ids.push( i );
			iids.push( j );
		}
	}

	for( var j = 0 ; j < this.parent.data.rings - 1; j++ ){
		color.push(0,0,0,0);
		for( var i = 0 ; i < this.parent.data.segments ; i++ ) color.push(0,0,0,1);
		color.push(0,0,0,1,0,0,0,0);
	}

	return { position : position, ids : ids, iids : iids, color : color };
}

Ring.prototype.onResizeEnd = function(){
	// var attributes = this.getAttributes();

	// this.mesh.geometry.removeAttribute( 'position' );
	// this.mesh.geometry.removeAttribute( 'ids' );
	// this.mesh.geometry.removeAttribute( 'iids' );
	// this.mesh.geometry.removeAttribute( 'color' );

	// this.mesh.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( attributes.position ), 3 ) );
	// this.mesh.geometry.addAttribute( 'ids', new THREE.BufferAttribute( new Float32Array( attributes.ids ), 1 ) );
	// this.mesh.geometry.addAttribute( 'iids', new THREE.BufferAttribute( new Float32Array( attributes.iids ), 1 ) );
	// this.mesh.geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( attributes.color ), 4 ) );

	// this.mesh.geometry.attributes.position.needsUpdate = true;
	// this.mesh.geometry.attributes.ids.needsUpdate = true;
	// this.mesh.geometry.attributes.iids.needsUpdate = true;
	// this.mesh.geometry.attributes.color.needsUpdate = true;
}

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
	this.mesh.material.uniforms.audioData.value = this.parent.data.audioData;
	this.mesh.material.uniforms.audioSamples.value = this.parent.data.audioSamples;
}

module.exports = Ring;