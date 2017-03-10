var Dat = require('dat-gui');

var Data = function( parent ){
	var _this = this;
	this.parent = parent;

	this.totalColors = 1;

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
		
		this.color0 = '#000000';
		this.color1 = '#000000';
		this.color2 = '#000000';
		this.color3 = '#000000';
		this.addColor = function() {
			_this.addColor();
		};
		this.removeColor = function() {
			_this.removeColor();
		};
	};

	this.params = new Params();

	var gui = new Dat.GUI();

	this.f1 = gui.addFolder('Main data');
	this.f2 = gui.addFolder('Debug data');
	
	this.f1.add( this.params, 'temp', -5, 35 ).onChange( function( value ){ this.parent.emitter.emit('temp', value ); }.bind(this) );
	this.f1.add( this.params, 'soil', 0, 100 ).onChange( function( value ){ this.parent.emitter.emit('soil', value ); }.bind(this) );
	this.f1.add( this.params, 'air', 0, 100 ).onChange( function( value ){ this.parent.emitter.emit('air', value ); }.bind(this) );
	this.f1.add( this.params, 'water', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('water', value ); }.bind(this) );
	this.f1.add( this.params, 'light', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('light', value ); }.bind(this) );
	this.f1.add( this.params, 'substrate', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('substrate', value ); }.bind(this) );
	this.f1.add( this.params, 'audio').onChange( function( value ){ this.parent.emitter.emit('audio', value ); }.bind(this) );
	
	this.f2.add( this.params, 'show').onChange( function( value ){ this.parent.emitter.emit('show', value ); }.bind(this) );
	this.f2.add( this.params, 'segments', [ 4, 8, 16, 32, 64, 128 ] ).onChange( function( value ){ this.parent.emitter.emit('segments', value ); }.bind(this) );
	this.f2.add( this.params, 'rings', [ 64, 128, 256, 512, 1024 ] ).onChange( function( value ){ this.parent.emitter.emit('rings', value ); }.bind(this) );
	this.f2.add( this.params, 'generators', [ 2, 3, 4 ] ).onChange( function( value ){ this.parent.emitter.emit('generators', value ); }.bind(this) );
	this.f2.add( this.params, 'idleIntensity', 0, 1 ).onChange( function( value ){ this.parent.emitter.emit('idleIntensity', value ); }.bind(this) );
	this.f2.addColor( this.params, 'color0' ).onChange( function( value ){ this.parent.emitter.emit('color0', value ); }.bind(this) );	
	this.addBut = this.f2.add( this.params, 'addColor');

	this.f1.open();
	this.f2.open();

}

Data.prototype.addColor = function(){
	
	if( this.totalColors == 4 ) return;
	
	var name = 'color' + this.totalColors++;
	this.params[name] = '#000000';
	this[name] = this.f2.addColor( this.params, name).onChange( function( value ){ this.parent.emitter.emit(name, value ); }.bind(this) );
	this.addBut.remove();
	if( this.removeBut ) this.removeBut.remove();
	if( this.totalColors < 4 ) this.addBut = this.f2.add( this.params, 'addColor');
	this.removeBut = this.f2.add( this.params, 'removeColor');
	
	this.parent.emitter.emit('totalColors', this.totalColors );
}

Data.prototype.removeColor = function(){
	if( this.totalColors == 1 ) return;
	this.totalColors--;
	var name = 'color' + this.totalColors;
	
	this[name].remove();
	if( this.removeBut ) this.removeBut.remove();
	if( this.totalColors > 2 ) this.addBut = this.f2.add( this.params, 'addColor');
	this.removeBut = this.f2.add( this.params, 'removeColor');
	if( this.totalColors == 1 ){
		this.removeBut.remove();
		this.removeBut = null;
	}

	this.parent.emitter.emit('totalColors', this.totalColors );
}

module.exports = Data;