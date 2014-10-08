var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = {};

app.use("/css", express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(client){
  console.log('a user connected');

  client.on('chat message', function(msg){
  	io.emit('chat message', msg);
  });


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