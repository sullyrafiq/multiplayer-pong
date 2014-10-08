var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/css", express.static(__dirname + '/css'));
app.use("/javascript", express.static(__dirname + '/javascript'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(client){
	client.on('join', function(name) {
		console.log(name);
		client.nickname = name;
		io.emit('chat message', client.nickname + ": has joined the group!")
	});	

	client.on('chat message', function(msg){
		console.log(msg);
		io.emit('chat message', client.nickname + ": " + msg);
	});
	
	client.on('disconnect', function(client){
		io.emit('chat message', client.nickname + ": has left the group!")
	})
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});