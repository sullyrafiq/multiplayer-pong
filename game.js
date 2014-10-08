var pongGame = new PongGame();

function PongGame() {

};

PongGame.prototype.isRunning = function() {
    return (typeof this.playerOne.nickname !== "undefined") && (typeof this.playerTwo.nickname !== "undefined");
}

PongGame.prototype.addPlayer = function(name) {
    if (typeof this.playerOne.nickname === "undefined") {
        this.playerOne.nickname = name;

    } else if (typeof this.playerTwo.nickname === "undefined") {
        this.playerTwo.nickname = name;
    }
}

PongGame.prototype.removePlayer = function(name) {
    if (this.playerOne.nickname === name) {
        delete this.playerOne.nickname;
        this.newGame();
        this.score = {'left': 0, 'right': 0};

    } else if (this.playerTwo.nickname === name) {
        delete this.playerTwo.nickname;
        this.newGame();
        this.score = {'left': 0, 'right': 0};
    }
}

PongGame.prototype.status = function() {
    var self = this;
    return {
        ball: {
            x : self.ball.x,
            y : self.ball.y,
            dx : self.ball.dx,
            dy : self.ball.dy
        },
        player1: {
            score: self.score['left'],
            x : self.playerOne.x,
            y : self.playerOne.y
        },
        player2: {
            score: self.score['right'],
            x : self.playerTwo.x,
            y : self.playerTwo.y
        }};
}

PongGame.prototype.initialize = function(nickname) {

    this.width = 800;
    this.height = 500;

    this.config = {};
    this.interval = this.config.interval || 20;
    // 0.5 == hard, 1.0 == normal, 1.5 == easy
    this.difficulty = this.config.difficulty || 1.0;

    var playerSide = this.config.playerSide || 'left';
    this.playerOne = new Paddle(this, playerSide);
    this.playerTwo = new Paddle(this, playerSide == 'left' ? 'right': 'left');

    if (playerSide == 'left') {
        this.left = this.playerOne;
        this.right = this.playerTwo;
   } else {
        this.left = this.playerTwo;
        this.right = this.playerOne;
   }

    // Create the game ball.
    this.ball = new Ball(this);

    this.score = {'left': 0, 'right': 0};

    this.keyState = {};
    var self = this;

    this.newGame();

    return true;
};


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

Paddle.prototype.reset = function() {
    this.y = this.startY;
}

Paddle.prototype.draw = function(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
}

Paddle.prototype.move = function(direction) {
    // Move the paddle up or down.
    if (direction > 0) {
        this.y += this.dy;
        if (this.y + this.height > this.game.height) {
            this.y = this.game.height - this.height;
        }
    } else if (direction < 0) {
        this.y -= this.dy;
        if (this.y < 0) { this.y = 0; }
    }
}

Paddle.prototype.autoMove = function(ball) {
    var movingAway = (
        (ball.dx > 0 && this.leftOrRight == 'left') ||
            (ball.dx < 0 && this.leftOrRight != 'left'));
    if (movingAway) {
        // Move the paddle
        if (this.y < (this.startY - this.dy)) {
            this.y += this.dy;
        } else if (this.y > this.startY) {
            this.y -= this.dy;
        }
    } else {
        // Anticipate the position of the ball.
        var fakeBall = new Ball(this.game);
        fakeBall.x = ball.x;
        fakeBall.y = ball.y;
        fakeBall.dx = ball.dx;
        fakeBall.dy = ball.dy;
        while (Math.abs(fakeBall.x - this.x) > fakeBall.size) {
            fakeBall.move();
        }
        var destY = Math.ceil(fakeBall.y - (this.height / 2));
        if (this.y < destY) {
            this.y += this.dy;
        } else if (this.y > (destY + this.dy)) {
            this.y -= this.dy;
        }
    }
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

Ball.prototype.move = function() {
    // Move the ball, bouncing it off horizontal walls and
    // triggering an event if the ball hits a vertical wall.
    this.x += this.dx;
    this.y += this.dy;
    if (this.x <= 0) {
        this.game.rightWins();
    } else if (this.x + this.size >= this.game.width) {
        this.game.leftWins();
    }
    if (this.y <= 0) {
        this.dy *= -1;
        this.y = 0;
    } else if (this.y + this.size >= this.game.height) {
        this.dy *= -1;
        this.y = this.game.height - this.size;
    }
}

Ball.prototype.draw = function(ctx) {
    ctx.fillRect(this.x, this.y, this.size, this.size);
}

Ball.prototype.collisionTest = function(paddle) {
    var bounds;
    if (this.dx < 0) {
        bounds = [
            paddle.x, paddle.x + paddle.width,
            paddle.y - this.size, paddle.y + paddle.height];
    } else {
        bounds = [
            paddle.x - this.size, paddle.x,
            paddle.y - this.size, paddle.y + paddle.height];
    }
    return (
        (this.x >= bounds[0] && this.x <= bounds[1]) &&
            (this.y >= bounds[2] && this.y <= bounds[3]));
}

Ball.prototype.reflectOnCollision = function(paddle, collisionMessage) {
    if (this.collisionTest(paddle)) {

        var verticalOffset = Math.abs(this.y - paddle.y);
        if (verticalOffset < (paddle.height * .4)) {
            this.dy -= 1;
        } else if (verticalOffset >= (paddle.height * .6)) {
            this.dy += 1;
        }
        if ((Math.abs(this.dx) < this.maxD) && (Math.random() < .3)) {
            if (this.dx < 0) {
                this.dx -= 1;
            } else {
                this.dx += 1;
            }
        }
        if (this.dx < 0) {
            this.x = paddle.x + paddle.width;
        } else {
            this.x = paddle.x - this.size;
        }
        this.dx *= -1;
        return collisionMessage;
    } else {
        return null;
    }
}

PongGame.prototype.newGame = function() {
    this.ball.reset();
    this.playerOne.reset();
    this.playerTwo.reset();
}

PongGame.prototype.rightWins = function() {
    this.score['right'] += 1;
    this.newGame();
}

PongGame.prototype.leftWins = function() {
    this.score['left'] += 1;
    this.newGame();
}

PongGame.prototype.movePlayerOne = function(direction) {
    this.playerOne.move(direction);
}

PongGame.prototype.movePlayerTwo = function(direction) {
    this.playerTwo.move(direction);
}

PongGame.prototype.checkForCollisions = function() {
    this.computer.autoMove(this.ball);
    if (this.ball.dx > 0) {
        this.ball.reflectOnCollision(this.right);
        return "right-collision";
    } else if (this.ball.dx < 0) {
        this.ball.reflectOnCollision(this.left);
        return "left-collision";
    }
}

PongGame.prototype.gameLoop = function() {
    if (this.isRunning()) {
        this.ball.move();
        if (this.ball.dx > 0) {
            return this.ball.reflectOnCollision(this.right, "bounce-right");
        } else if (this.ball.dx < 0) {
            return this.ball.reflectOnCollision(this.left, "bounce-left");
        }
    }
    return null;
}

exports.pongGame = pongGame;