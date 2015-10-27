var View = require('./views/view');


var App = function(){

	this.view = new View();

	// run it yo!
	this.step();
}

App.prototype.step = function(time) {
	window.requestAnimationFrame(this.step.bind(this));
	this.view.step(time);
};

var app = new App();