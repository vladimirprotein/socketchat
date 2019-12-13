var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3001, function(){
  console.log('listening on *:3001');
});

io.on('connection', function(socket){
	console.log('A User connected');
	socket.on('disconnect', ()=>{console.log('A user disconnected');});
  	socket.on('message', function(msg){
    	console.log(msg.name+': ' + msg.message);
    	socket.broadcast.emit('message', msg);
  	});
});