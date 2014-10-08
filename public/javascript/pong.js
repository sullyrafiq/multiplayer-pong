(function(exports) {
    // Key-codes.
    var UP = 38, DOWN = 40;

    if (typeof exports.Events === 'undefined') {
        exports.Events = {'emit': function() {}};
    }


    function Paddle(game, leftOrRight, offset) {
        this.game = game;

        // Distance between paddle and the outer edge.
        this.offset = offset || 4;

        // The paddle width and height are proportional to the size
        // of the game board.
        this.width = Math.ceil(game.width / 100);
        this.height = Math.ceil((game.height / 10) * game.difficulty);

        // Position the paddle, centering it vertically.
        this.leftOrRight = leftOrRight;
        if (leftOrRight == 'left') {
            this.x = this.offset;
        } else {
            this.x = this.game.width - this.width - this.offset;
        }
        this.y = Math.ceil((this.game.height - this.height) / 2);

        this.startY = this.y;

        // The speed at which the paddle moves is proportional to the
        // size of the paddle (1/10th of a paddle per move).
        this.dy = Math.ceil(this.height / 10);
    }

    Paddle.prototype.update = function(paddle) {
        this.x = paddle.x;
        this.y = paddle.y;
    }

    Paddle.prototype.reset = function() {
        this.y = this.startY;
    }

    Paddle.prototype.draw = function(ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    function Ball(game) {
        this.game = game;

        // The size of the ball is 1% of the screen (same as the
        // width of the paddle).
        this.size = Math.ceil(game.width / 100);

        // The ball always starts in the center of the screen.
        this.startX = Math.ceil((this.game.width - this.size) / 2);
        this.startY = Math.ceil((this.game.height - this.size) / 2);

        // Initialize the ball-speed as 0, 0.
        this.dx = 0;
        this.dy = 0;

        // The maximum speed at which the ball can move in any
        // direction is equal to 1% of the screen width.
        this.maxD = this.game.width / 100;

        // Initialize the ball.
        this.reset();
    }

    Ball.prototype.update = function(ball) {
        this.x = ball.x;
        this.y = ball.y;
        this.dx = ball.dx;
        this.dy = ball.dy;
    }

    Ball.prototype.reset = function(direction) {
        direction = direction || -1;

        // Center the ball.
        this.x = this.startX;
        this.y = this.startY;

        // The ball starts out at half the max speed.
        this.dx = (this.maxD / 2) * direction;

        // The vertical velocity is random.
        this.dy = Math.max(
            parseInt(Math.random() * this.maxD),
            this.maxD / 4);
        this.dy *= (Math.random() < .5)? 1 : -1;
    }

    Ball.prototype.draw = function(ctx) {
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }


    function Pong(canvasId, config, socket) {
        this.canvas = document.getElementById(canvasId);

        // Read the width and height directly from the HTML canvas.
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.config = config? config : {};
        this.socket = socket;
        this.interval = this.config.interval || 10;
        // 0.5 == hard, 1.0 == normal, 1.5 == easy
        this.difficulty = this.config.difficulty || 1.0;
        this.color = this.config.color || '#0ce3ac';
        this.background = this.config.background || '#000000';

        // Initialize game, binding event handlers, etc.
        this.initialize();
    }

    Pong.prototype.initialize = function() {
        if (this.canvas.getContext) {
            this.ctx = this.canvas.getContext('2d');
        } else {
            return false;
        }

        // Create paddles for the player and computer.
        var playerSide = this.config.playerSide || 'left';
        this.player = new Paddle(this, playerSide);
        this.computer = new Paddle(this, playerSide == 'left' ? 'right': 'left');

        if (playerSide == 'left') {
            this.left = this.player;
            this.right = this.computer;
        } else {
            this.left = this.computer;
            this.right = this.player;
        }

        // Create the game ball.
        this.ball = new Ball(this);

        this.score = {'left': 0, 'right': 0};

        this.keyState = {};
        var self = this;
        var makeHandler = function(state) {
            return function(e) {
                var keyCode = (e || window.event).keyCode;
                if (state) {
                    self.keyState[keyCode] = true;
                } else {
                    delete self.keyState[keyCode];
                }

                if (keyCode == UP || keyCode == DOWN) {
                     if (keyCode == UP) {
                         self.socket.emit("up", "up");
                     } else if (keyCode == DOWN) {
                         self.socket.emit("down", "down");
                     }
                    return false;
                } else {
                    return true;
                }
            }
        }

        document.onkeydown = makeHandler(true);
        document.onkeyup = makeHandler(false);

        this.newGame();
        this.gameLoop();

        return true;
    }

    Pong.prototype.newGame = function() {
        this.ball.reset();
        this.player.reset();
        this.computer.reset();
    }

    Pong.prototype.rightWins = function() {
        this.score['right'] += 1;
        exports.Events.emit('right-score', this.score);
        this.newGame();
    }

    Pong.prototype.leftWins = function() {
        this.score['left'] += 1;
        exports.Events.emit('left-score', this.score);
        this.newGame();
    }

    Pong.prototype.drawElements = function() {
        // Draw a black background.
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.color;

        this.player.draw(this.ctx);
        this.computer.draw(this.ctx);
        this.ball.draw(this.ctx);
    }

    Pong.prototype.update = function(data) {
        this.ball.update(data.ball);
        this.player.update(data.player1);
        this.computer.update(data.player2);
        this.gameLoop();
    }

    Pong.prototype.gameLoop = function() {
        var self = this;
        this.drawElements();
        // setTimeout(function() { self.gameLoop(); }, this.interval);
    }

    exports.Pong = Pong;
})(Common);