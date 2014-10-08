var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gamePlay = require('./game.js');
var game = game || {};

app.use("/css", express.static(__dirname + '/css'));
app.use("/javascript", express.static(__dirname + '/javascript'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

console.log(gamePlay);
//gamePlay.gamePlay();

gamePlay.gamePlay.testThis();
//.testThis();

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

   // var gamePlay = gamePlay.gamePlay()
   // var pong = new gamePlay.Pong();
   // pong.Events.on('left-score', function(score) {
   //     console.log("hello");
   // });
    game.statusTimer=setInterval(game.sendStatus, 1000); //1000 will  run it every 1 second
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

game.sendStatus = function()
{
    io.emit('game status', game.Status);
}

game.Status = {
    paddles: [0.9, 0.8],
    ball: [0.5, 0.2],
    score: { player1: 100, player2: 200}
}
