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
	socket.on('new user', (obj)=>{
		socket.username = obj.name;
		io.emit('user connected', {name: socket.username});
		console.log(socket.username + ' connected');
	});

	socket.on('disconnect', ()=>{
		if(socket.username){
			console.log(socket.username + ' disconnected');
			io.emit('user disconnected', {name: socket.username});
		}
	});

	socket.on('activity', ()=>{
		socket.broadcast.emit('activity', {name: socket.username});
	});

	socket.on('activitystop', ()=>{
		socket.broadcast.emit('activitystop', {name: socket.username});
	});

  	socket.on('message', function(msg){
    	console.log(socket.username+': ' + msg.message);
    	io.emit('message', {name: socket.username, message: msg.message});
    	socket.broadcast.emit('activitystop', {name: socket.username});
  	});
});