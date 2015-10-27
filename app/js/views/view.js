var View = function(){
	console.log('I\'m the view');
	this.lastTime = null;
	this.initialTime = null;
}

View.prototype.step = function(time){
	if(!this.lastTime) this.lastTime = time;
	if(!this.initialTime) this.initialTime = time;
	else if(time - this.lastTime > 1000) {
		console.log( ' └────────> I\'m still here after ' + Math.floor(( time - this.initialTime )/ 1000) + ' seconds...');
		this.lastTime = time;
	}
}

module.exports = View;