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
		
});