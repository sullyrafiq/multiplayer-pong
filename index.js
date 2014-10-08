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

pongGame.initialize();

io.on('connection', function(client){

    client.on('join', function(name) {
		client.nickname = name;
		io.emit('chat message', client.nickname + ": has joined the group!")

        if (!pongGame.isRunning()) {
            pongGame.addPlayer(client.nickname);
        }
	});

	client.on('chat message', function(msg){
		io.emit('chat message', client.nickname + ": " + msg);
	});

	client.on('disconnect', function(msg){
		io.emit('chat message', client.nickname + ": has left the group!")
	});

    client.on('up', function(move){
        if (client.nickname === pongGame.playerOne.nickname) {
            pongGame.movePlayerOne(-1);

        } else if (client.nickname === pongGame.playerTwo.nickname) {
            pongGame.movePlayerTwo(-1);
        }

        io.emit('status', pongGame.status());
    });

    client.on('down', function(move){
        if (client.nickname === pongGame.playerOne.nickname) {
            pongGame.movePlayerOne(1);

        } else if (client.nickname === pongGame.playerTwo.nickname) {
            pongGame.movePlayerTwo(1);
        }

        io.emit('status', pongGame.status());
    });

    setInterval(function() {
        pongGame.gameLoop();
        io.emit('status', pongGame.status());

    }, 50);

});

http.listen(app.get('port'), function(){
  console.log('listening on *:3000');
});


