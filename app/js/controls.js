var lightBut = document.getElementById('light');
var subtrateBut = document.getElementById('substrate');
var waterBut = document.getElementById('water');

var host;
if( location.origin.indexOf( 'localhost' ) !== -1 ) host = 'ws://localhost:5000/';
else host = location.origin.replace(/^http/, 'ws');

var ws;

// setTimeout( function(){
	ws = new WebSocket( host );
// },1000);

// var HOST = location.origin.replace(/^http/, 'ws')
// var ws = new WebSocket(HOST);

lightBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "light" }') });
subtrateBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "substrate" }') });
waterBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "water" }') });