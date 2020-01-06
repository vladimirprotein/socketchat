var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var people = {};
var rooms = {}

app.set('view engine', 'jade');
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/chatroom/:roomID', function(req, res){
  res.render('room', {'roomID': req.params.roomID});
});
app.get('/chatroom', function(req, res){
  console.log(req.query);
  res.sendFile(__dirname+'/chatroom.html');
});


http.listen(3001, function(){
  console.log('listening on *:3001');
});

io.on('connection', function(socket){
	socket.on('new user', (obj, callback)=>{
		obj.name = obj.name.toLowerCase();
		if(obj.name in people){
			callback(false);
			return;
		}
		people[obj.name] = socket;
		socket.username = obj.name;
		callback(true);
		io.emit('people online', Object.keys(people));
		io.emit('user connected', {name: socket.username});
		console.log(socket.username + ' connected');
	});

	socket.on('disconnect', ()=>{
		if(socket.username){
			console.log(socket.username + ' disconnected');
			delete people[socket.username];
			io.emit('user disconnected', {name: socket.username});
			io.emit('people online', Object.keys(people));
		}
	});

  socket.on('new room', (obj, callback1)=>{
    if(socket.username in people){
      if(obj.id in rooms){
        callback1(false);
        return;
      }
      rooms[obj.id] = 1;
      callback1(true);
      socket.join(obj.id);

    }
    else{
      ;
    }
  })

  socket.on('join room', (obj, callback)=>{
    if(socket.username in people){
      if(!(obj.id in rooms)){
        callback(false);
        return;
      }
      callback(true);
      socket.join(obj.id);
    }
    else{
      ;
    }
  })

	socket.on('activity', ()=>{
		if(socket.username in people){
  			socket.broadcast.emit('activity', {name: socket.username});
  		}
	});

	socket.on('activitystop', ()=>{
		if(socket.username in people){
  			socket.broadcast.emit('activitystop', {name: socket.username});
  		}
	});

  	socket.on('message', (msg, callback)=>{
  		if(socket.username in people){
  			msg.message = msg.message.trim();
  			if(msg.message == ''){
  				return;
  			}
  			console.log(socket.username+': ' + msg.message);
    		io.emit('message', {name: socket.username, message: msg.message});
    		socket.broadcast.emit('activitystop', {name: socket.username});
  		}
  		else{
  			callback('Get a username first.');
  		}
  	});

    socket.on('room message', (msg, callback)=>{
      if(socket.username in people){
        msg.message = msg.message.trim();
        if(msg.message == ''){
          return;
        }
        console.log(msg);
        console.log('Room message in room: '+msg.roomID+'___'+ socket.username+': ' + msg.message);
        io.to(msg.roomID).emit('room message', {name: socket.username, message: msg.message});
        socket.broadcast.emit('activitystop', {name: socket.username});
      }
      else{
        callback('Get a username first.');
      }
    })

  	socket.on('dm', (msg, callback)=>{
  		if(socket.username in people){
  			msg.message = msg.message.trim();
  			if(msg.message == ''){
  				return;
  			}
  			if(msg.to in people){
  				var dmsocket = people[msg.to];
  				dmsocket.emit('dm', {name: socket.username, message: msg.message});
  			}
  			else{
  				callback('The user does not exist');
  			}
  		}
  		else{
  			callback('Get a username first');
  		}
  	})
});