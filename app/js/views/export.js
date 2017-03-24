var Export = function( ){
	self.addEventListener('message',function (ev){
		var data = JSON.parse(ev.data);
		self.postMessage(data.temperature.value);
    });
}

module.exports = Export;