$(function() {
	
	var socket = io();

    socket.on('connect', function(data) {
      nickname = prompt("Please enter a nickname!", "nickname");
      socket.emit('join', nickname);
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

    var playerScore = $('span#player-score');
    var computerScore = $('span#computer-score');
    Common.Events.on('left-score', function(score) {
        playerScore.text(score.left);
    });
    Common.Events.on('right-score', function(score) {
        computerScore.text(score.right);
    });

    socket.on('status', function(data) {
        console.log(data);
        pong.ball.update(data.ball);
        pong.player.update(data.player1);
        pong.computer.update(data.player2);
    })
		
});