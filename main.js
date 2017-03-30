'use strict';

// ┌────────────────────────────────────────────────────────────────────┐
// | Filename: main.js
// └────────────────────────────────────────────────────────────────────┘

// ┌────────────────────────────────────────────────────────────────────┐
// | Require modules
// └────────────────────────────────────────────────────────────────────┘
var browserify = require('browserify-middleware');
var stringify = require('stringify');
var figlet = require('figlet');
var express = require("express");
var stylus = require('stylus');
var bodyParser = require('body-parser');
var nib = require('nib');
var fs = require('fs');
var pckg = require('./package.json');
var jade = require('jade');
var http = require("http");
var WebSocketServer = require('ws').Server;
var cors = require('cors');

// ┌────────────────────────────────────────────────────────────────────┐
// | Initialize vars + constants
// └────────────────────────────────────────────────────────────────────┘
var app = express();
var port = Number( process.env.PORT || 5000 );
var wsport = Number( process.env.WSPORT || 5001 );

// ┌────────────────────────────────────────────────────────────────────┐
// | App setup
// └────────────────────────────────────────────────────────────────────┘

browserify.settings({ transform: [stringify(['.svg', '.glsl'])]});

app.set('views', __dirname + '/app/views');
app.use('/js', browserify('./app/js'));
app.set('view engine', 'jade');
app.use('/*.css', function(req, res){
	var reqUrl = req.originalUrl.split('/');
	var file = reqUrl[reqUrl.length-1].slice(0, -4);
	res.set('Content-Type', 'text/css').send( stylus.render( fs.readFileSync(__dirname + '/app/css/' + file + '.styl', 'utf-8') )); 
});

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(__dirname + '/app'));
// ┌────────────────────────────────────────────────────────────────────┐
// | Routes
// └────────────────────────────────────────────────────────────────────┘

app.get('/', function(req, res){
	res.render( 'main', {title: pckg.name});
});

app.get('/exporter', function(req, res){
	res.render( 'main', {title: pckg.name});
});

app.post('/api', function (req, res, next) {
	wss.clients.forEach(function each(client) {
		client.send(JSON.stringify(req.body));
	});
	res.json('ok');
});

// ┌────────────────────────────────────────────────────────────────────┐
// | Init!!
// └────────────────────────────────────────────────────────────────────┘

var server = http.createServer(app);
var wss = new WebSocketServer({ server });

server.listen(port);

figlet.fonts(function(err, fonts) {
	var font = fonts[Math.floor(Math.random() * fonts.length)];
	figlet(pckg.name, { font : font},function(err, data) {
		console.log(data);
		console.log('└─────> ' + pckg.description);
		console.log('└─────> v ' + pckg.version);
		console.log('└─────> Listening on port: ' + port);
	});
});


