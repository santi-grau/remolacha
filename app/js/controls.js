var lightBut = document.getElementById('light');
var subtrateBut = document.getElementById('substrate');
var waterBut = document.getElementById('water');

var host;
if( location.origin.indexOf( 'localhost' ) !== -1 ) host = 'ws://localhost:5001/';
else host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket( host );

lightBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "light" }') });
subtrateBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "substrate" }') });
waterBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "water" }') });