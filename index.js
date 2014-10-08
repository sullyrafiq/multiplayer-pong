var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pongGame = require('./game.js').pongGame;
var game = game || {};

app.use("/css", express.static(__dirname + '/css'));
app.use("/javascript", express.static(__dirname + '/javascript'));
app.use("/images", express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 3000))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

//console.log(gamePlay);

//gamePlay.gamePlay.testThis();
//var stuff = gamePlay.gamePlay;
pongGame.initialize();

io.on('connection', function(client){
	client.on('join', function(name) {
		client.nickname = name;
		io.emit('chat message', client.nickname + ": has joined the group!")
	});	

	client.on('chat message', function(msg){
		io.emit('chat message', client.nickname + ": " + msg);
	});

	client.on('disconnect', function(client){
		io.emit('chat message', client.nickname + ": has left the group!")
	})

    game.statusTimer=setInterval(game.sendStatus, 1000); //1000 will  run it every 1 second
});

http.listen(app.get('port'), function(){
  console.log('listening on *:3000');
});

game.sendStatus = function()
{
    io.emit('game status', pongGame.nextMove());
}


