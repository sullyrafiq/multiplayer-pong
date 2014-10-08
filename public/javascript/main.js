//Client Side!!
$(function() {
	
	var socket = io();

    socket.on('connect', function(data) {
      var nickname = prompt("Please enter a nickname!", "nickname");
      if (nickname !== null && nickname.trim() !== '') {
        socket.emit('join', nickname);
      }
    });

    $('form').submit(function() {
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });

    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
      $('.main-room').scrollTop($('.main-room').prop("scrollHeight"));
    });

    var pong = new Common.Pong('pong', null, socket);

    socket.on('status', function(data) {
        pong.update(data);
        var playerScore = $('span#player-score');
        var computerScore = $('span#computer-score');
        playerScore.text(data.player1.score);
        computerScore.text(data.player2.score);
    })

    socket.on('bounce', function(msg) {
        this.snd = new Audio("audio/" + msg + ".wav");
        //this.snd_left = new Audio("audio/bounce-left.wav"); // buffers automatically when created
        this.snd.play();
        console.log("played sound " + "audio/" + msg + ".wav");
    });
		
});