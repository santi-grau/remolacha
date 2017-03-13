var lightBut = document.getElementById('light');
var subtrateBut = document.getElementById('substrate');
var waterBut = document.getElementById('water');

var ws = new WebSocket('ws://localhost:3000/');

lightBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "light" }') });
subtrateBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "substrate" }') });
waterBut.addEventListener( 'click' , function(){ ws.send('{ "action" : "water" }') });




// ws.send({ });