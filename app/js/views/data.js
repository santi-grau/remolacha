var Dat = require('dat-gui');

var Data = function( parent ){
	this.parent = parent;

	var Params = function() {
		this.temp = 12;
		this.soil = 60;
		this.air = 30;
		this.water = 0.50;
		this.light = 0.50;
		this.substrate = 0.5;
		this.audio = false;

		this.show = false;
		this.segments = 32;
		this.rings = 256;
		this.generators = 4;
		this.idleIntensity = 0.5;
	};

	this.params = new Params();

	var gui = new Dat.GUI();

	var f1 = gui.addFolder('Main data');
	f1.add( this.params, 'temp', -5, 35 ).onChange( function( value ){ this.parent.emitter.emit('temp', value ); }.bind(this) );
	f1.add( this.params, 'soil', 0, 100 ).onChange( function( value ){ this.parent.emitter.emit('soil', value ); }.bind(this) );
	f1.add( this.params, 'air', 0, 100 ).onChange( function( value ){ this.parent.emitter.emit('air', value ); }.bind(this) );
	f1.add( this.params, 'water', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('water', value ); }.bind(this) );
	f1.add( this.params, 'light', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('light', value ); }.bind(this) );
	f1.add( this.params, 'substrate', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('substrate', value ); }.bind(this) );
	f1.add( this.params, 'audio').onChange( function( value ){ this.parent.emitter.emit('audio', value ); }.bind(this) );

	var f2 = gui.addFolder('Debug data');
	
	f2.add( this.params, 'show').onChange( function( value ){ this.parent.emitter.emit('show', value ); }.bind(this) );	
	f2.add( this.params, 'segments', [ 4, 8, 16, 32, 64, 128 ] ).onChange( function( value ){ this.parent.emitter.emit('segments', value ); }.bind(this) );
	f2.add( this.params, 'rings', [ 64, 128, 256, 512, 1024 ] ).onChange( function( value ){ this.parent.emitter.emit('rings', value ); }.bind(this) );
	f2.add( this.params, 'generators', [ 2, 3, 4 ] ).onChange( function( value ){ this.parent.emitter.emit('generators', value ); }.bind(this) );
	f2.add( this.params, 'idleIntensity', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('idleIntensity', value ); }.bind(this) );


	f1.open();
	f2.open();

}

module.exports = Data;