function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function PlayGame(game, x, y) {
    Entity.call(this, game, x, y);
}

PlayGame.prototype = new Entity();
PlayGame.prototype.constructor = PlayGame;

PlayGame.prototype.reset = function () {
    this.game.running = false;
}

PlayGame.prototype.update = function () {
    console.log(this.game);
    if (this.game.click && this.game.mario.lives > 0) this.game.running = true;
}

PlayGame.prototype.draw = function (ctx) {
    if (!this.game.running) {
        ctx.font = "24pt Impact";
        ctx.fillStyle = "red";
        if (this.game.mouse) { ctx.fillStyle = "blue"; }
        if (this.game.mario.lives > 0) {
            ctx.fillText("Click to Start", this.x, this.y);
        }
        else {
            ctx.fillText("Game Over", this.x - 30, this.y);
        }
    }
}

function Background(game) {
    Entity.call(this, game, 0, 0);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    if (this.game.right && this.x > (0 - 7000))
        this.x -= 2;
    if (this.game.left && this.x < 0)
        this.x += 2;
}

Background.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/level1.png"), this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Turtle(game, startingX, startingY) {
    this.walkR = new Animation(ASSET_MANAGER.getAsset("./img/turtle-spritesheet.png"), 0, 45, 25, 45, 0.10, 8, true, false);
    this.walkL = new Animation(ASSET_MANAGER.getAsset("./img/turtle-spritesheet.png"), 0, 0, 25, 45, 0.10, 8, true, false);
    this.timer = 0;
    this.maxX = startingX;
    this.turtleX = startingX;
    this.turtleY = startingY;
    this.dx = 0;
    this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
    Entity.call(this, game, this.x, this.y);
}

Turtle.prototype = new Entity();
Turtle.prototype.constructor = Turtle;

Turtle.prototype.update = function () {
    if (this.game.right)
        this.turtleX -= 2;
        this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
    if (this.game.left && this.turtleX < this.maxX)
        this.turtleX += 2;
        this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
    this.x += this.dx;
    this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
    if (this.tboundingbox.collide(this.game.mario.BoundingBox)) {

    }
}

Turtle.prototype.draw = function (ctx) {
    if (this.dx > 0) {
        this.walkR.drawFrame(this.game.clockTick, ctx, this.turtleX, this.turtleY);
    } else {
        this.walkL.drawFrame(this.game.clockTick, ctx, this.turtleX, this.turtleY);
    }
}

function Coin(game, posX, posY) {
    this.coinX = posX;
    this.coinY = posY;
    this.maxX = posX;
    Entity.call(this, game, this.x, this.y);
}

Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;

Coin.prototype.update = function () {
    if (this.game.right)
        this.coinX -= 2;
    if (this.game.left && this.coinX < this.maxX)
        this.coinX += 2;
}

Coin.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/coin.png"), this.coinX, this.coinY);
    Entity.prototype.draw.call(this);
}

/**GameEngine.prototype.reset = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].reset();
    }
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}*/

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

function Platform(game, x, y, width, height) {
    this.width = width;
    this.height = height;
    this.platformX = x;
    this.originalX = x;
    this.platformY = y;
    this.boundingbox = new BoundingBox(x, y, width, height);
    Entity.call(this, game, x, y);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

Platform.prototype.update = function () {
    if (this.game.right) {
        this.platformX -= 2;
        this.boundingbox = new BoundingBox(this.platformX, this.platformY, this.width, this.height);
    }
    if (this.game.left && this.platformX < this.originalX) {
        this.platformX += 2;
        this.boundingbox = new BoundingBox(this.platformX, this.platformY, this.width, this.height);
    }
}

Platform.prototype.draw = function (ctx) {
    ctx.strokeStyle = "Green";
    ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    ctx.stroke();
}

Platform.prototype.reset = function () {
    this.platformX = this.startX;
    this.platformY = this.startY;
}


function Mario(game) {
    this.standingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 0, 0, 18, 27, 0.05, 1, true, true);
    this.standingrAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 452, 0, 18, 27, 0.05, 1, true, true);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 103, 0, 18, 27, 0.50, 2, false, true);
    this.fallingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 120, 0, 18, 27, 0.05, 1, true, true);
    this.fallingAnimationr = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 366, 0, 18, 27, 0.05, 1, true, true);
    this.jumpAnimationr = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 349, 0, 18, 27, 0.50, 2, false, true);
    this.walkingAnimationRight = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 1, 0, 17, 27, 0.06, 2, true, true);
    this.walkingAnimationLeft = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 452, 0, 18, 27, 0.06, 2, true, true);
    this.runningAnimationRight = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 258, 0, 18, 27, 0.05, 2, true, true);
    this.runningAnimationLeft = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 103, 0, 18, 27, 0.01, 2, true, true);
    this.lookupAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 307, 0, 18, 27, 0.05, 1, true, true);
    this.lookuprAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 160, 0, 18, 27, 0.05, 1, true, true);
    this.duckAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSprites.png"), 154, 0, 18, 27, 0.05, 1, true, true);
    this.duckrAnimation = new Animation(ASSET_MANAGER.getAsset("./img/SMarioSpritesReversed.png"), 316, 0, 18, 27, 0.05, 1, true, true);
    this.jumping = false;
    this.falling = false;
    this.lives = 1;
    this.dead = false;
    this.radius = 100;
    this.ground = 406;
    this.platform = game.platforms[0];
    Entity.call(this, game, 400, 406);
    this.BoundingBox = new BoundingBox(this.x, this.y + 6, 18, 21);
    this.lastbottom = this.BoundingBox.bottom;
}

Mario.prototype.reset = function () {
    this.jumping = false;
    this.falling = false;
    this.dead = false;
    this.lives--;
    if (this.lives < 0) this.lives = 0;
    this.game.lives.innerHTML = "Lives: " + this.lives;
    this.x = 0;
    this.y = 400;
    this.platform = this.game.platforms[0];
    this.boundingbox = new BoundingBox(this.x, this.y, 18, 27);
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function () {
    if (this.game.running) {
        if (this.dead) {
            this.game.reset();
            return;
        }
        if (this.game.space) this.jumping = true;
        if (this.jumping && !this.reversed) {
            var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
            var totalHeight = 100;

            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;

            var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.platform.boundingbox.top - height - 27;
        } else if (this.jumping && this.reversed) {
            var jumpDistance = this.jumpAnimationr.elapsedTime / this.jumpAnimationr.totalTime;
            var totalHeight = 100;

            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;

            var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
            this.y = this.platform.boundingbox.top - height - 27;
        }
        if (this.game.right && !this.jumping) this.right = true;
        if (!this.game.right) this.right = false;
        if (this.right) {
            this.reversed = false;
            if (this.walkingAnimationRight.isDone()) {
                this.walkingAnimationRight.elapsedTime = 0;
                this.right = false;
            }
        }
        if (this.game.lookup) this.lookup = true;
        if (!this.game.lookup) this.lookup = false;
        if (this.lookup && !this.reversed) {
            if (this.lookupAnimation.isDone()) {
                this.lookupAnimation.elapsedTime = 0;
            }
        } else if (this.lookup && this.reversed) {
            if (this.lookuprAnimation.isDone()) {
                this.lookuprAnimation.elapsedTime = 0;
            }
        }
        if (this.game.duck) this.duck = true;
        if (!this.game.duck) this.duck = false;
        if (this.duck && !this.reversed) {
            if (this.duckAnimation.isDone()) {
                this.duckAnimation.elapsedTime = 0;
            }
        } else if (this.duck && this.reversed) {
            if (this.duckrAnimation.isDone()) {
                this.duckrAnimation.elapsedTime = 0;
            }
        }
        if (this.game.left && !this.jumping) this.left = true;
        if (!this.game.left) this.left = false;
        if (this.left) {
            this.reversed = true;
            if (this.walkingAnimationLeft.isDone()) {
                this.walkingAnimationLeft.elapsedTime = 0;
            }
        }
        if (this.game.special) this.special = true;
        if (!this.game.special) this.special = false;
        if (this.special && this.right) {
            if (this.runningAnimationRight.isDone()) {
                this.runningAnimationRight.elapsedTime = 0;
            }
        } else if (this.special && this.left) {
            if (this.runningAnimationLeft.isDone()) {
                this.runningAnimationLeft.elapsedTime = 0;
            }
        }
        if (!this.jumping && !this.falling) {
            if (this.BoundingBox.left > this.platform.boundingbox.right || this.BoundingBox.right < this.platform.boundingbox.left) this.falling = true;
        }
        if (this.falling) {
            this.lastBottom = this.BoundingBox.bottom;
            this.y += this.game.clockTick / this.jumpAnimation.totalTime * 4 * 100;
            //console.log(this.jumpHeight);
            this.BoundingBox = new BoundingBox(this.x, this.y + 6, 18, 21);
            for (var i = 0; i < this.game.platforms.length; i++) {
                var pf = this.game.platforms[i];
                if (this.BoundingBox.collide(pf.boundingbox) && this.lastBottom < pf.boundingbox.top) {
                    this.falling = false;
                    this.y = pf.boundingbox.top - 27;
                    this.platform = pf;
                    this.fallingAnimation.elapsedTime = 0;
                    console.log("Got here.");
                }
            }
        }
        this.lastbottom = this.BoundingBox.bottom;
        this.BoundingBox = new BoundingBox(this.x, this.y + 6, 18, 21);
        if (this.jumping && !this.reversed) {
            for (var i = 0; i < this.game.platforms.length; i++) {
                var pf = this.game.platforms[i];
                if (this.BoundingBox.collide(pf.boundingbox) && this.lastbottom < pf.boundingbox.top) {
                    this.jumping = false;
                    this.y = pf.boundingbox.top - 27;
                    this.platform = pf;
                    this.jumpAnimation.elapsedTime = 0;
                }
                /**if (this.BoundingBox.collide(pf.boundingbox) && this.BoundingBox.top < pf.boundingbox.bottom) {
                    this.jumping = false;
                    this.y = pf.boundingbox.bottom - 4;
                    this.platform = pf;
                    this.jumpAnimation.elapsedTime = 0;
                    //this.falling = true;
                }
                if (this.BoundingBox.collide(pf.boundingbox) && this.BoundingBox.right > pf.boundingbox.left) {
                    console.log("Left Hit Detected!");
                    this.x = pf.boundingbox.left - 18;
                    this.platform = pf;
                } /**else if (this.BoundingBox.collide(pf.boundingbox) && this.BoundingBox.left > pf.boundingbox.right) {
                    console.log("Right Hit Detected!");
                    this.x = pf.boundingbox.right + 18;
                    this.platform = pf;
                } */
            }
            if (this.jumpAnimation.isDone()) {
                this.jumpAnimation.elapsedTime = 0;
                this.jumping = false;
                this.falling = true;
            }
        } else if (this.jumping && this.reversed) {
            for (var i = 0; i < this.game.platforms.length; i++) {
                var pf = this.game.platforms[i];
                if (this.BoundingBox.collide(pf.boundingbox) && this.lastbottom < pf.boundingbox.top) {
                    this.jumping = false;
                    this.y = pf.boundingbox.top - 27;
                    this.platform = pf;
                    this.jumpAnimationr.elapsedTime = 0;
                } /**else if (this.BoundingBox.collide(pf.boundingbox) && this.BoundingBox.top < pf.boundingbox.bottom) {
                    this.jumping = false;
                    this.y = pf.boundingbox.bottom - 4;
                    this.platform = pf;
                    this.jumpAnimationr.elapsedTime = 0;
                    //this.falling = true;
                } /**else if (this.BoundingBox.collide(pf.boundingbox) && pf.boundingbox.left) {
                    console.log("Left Hit Detected!");
                    this.x = pf.boundingbox.left - 18;
                    this.platform = pf;
                } /**else if (this.BoundingBox.collide(pf.boundingbox) && pf.boundingbox.right) {
                    console.log("Right Hit Detected!");
                    this.x = pf.boundingbox.right + 18;
                    this.platform = pf;
                } */
            }
            if (this.jumpAnimationr.isDone()) {
                this.jumpAnimationr.elapsedTime = 0;
                this.jumping = false;
                this.falling = true;
            }
            if (this.y > this.game.ctx.canvas.height) this.dead = true;
        }
    }
        Entity.prototype.update.call(this);
}

Mario.prototype.draw = function (ctx) {
    if (this.dead || !this.game.running) return;
    if (this.jumping && !this.reversed) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.jumping && this.reversed) {
        this.jumpAnimationr.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.falling && !this.reversed) {
        this.fallingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.falling && this.reversed) {
        this.fallingAnimationr.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.right) {
        this.walkingAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.left) {
        this.walkingAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.right && this.special) {
        this.runningAnimationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.left && this.special) {
        this.runningAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.lookup && !this.reversed) {
        this.lookupAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.lookup && this.reversed) {
        this.lookuprAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.duck && !this.reversed) {
        this.duckAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.duck && this.reversed) {
        this.duckrAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.reversed) {
        this.standingrAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else {
        this.standingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
    ctx.strokeStyle = "Green";
    ctx.strokeRect(this.BoundingBox.x, this.BoundingBox.y, this.BoundingBox.width, this.BoundingBox.height);
    ctx.stroke();
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/SMarioSprites.png");
ASSET_MANAGER.queueDownload("./img/SMarioSpritesReversed.png");
ASSET_MANAGER.queueDownload("./img/turtle-spritesheet.png");
ASSET_MANAGER.queueDownload("./img/level1.png");
ASSET_MANAGER.queueDownload("./img/coin.png");

var platforms = [];

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    gameEngine.addEntity(bg);
    //Ground platform
    var pf = new Platform(gameEngine, 0, 432, 1607, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1835, 432, 364, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 2263, 432, 30, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 2357, 432, 97, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 2518, 432, 30, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 2612, 432, 484, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 3285, 432, 496, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 3845, 432, 755, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 4664, 432, 87, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 4815, 432, 95, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 4974, 432, 1195, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 6233, 432, 41, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 6338, 432, 42, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 6444, 432, 50, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    var pf = new Platform(gameEngine, 6558, 432, 679, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    //Brick platform
    pf = new Platform(gameEngine, 740, 204, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 892, 272, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1054, 341, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1451, 352, 159, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1547, 322, 63, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1579, 292, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1752, 291, 159, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2004, 132, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2157, 213, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2272, 282, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2382, 350, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2898, 359, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2959, 245, 63, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 2961, 305, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3121, 385, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3186, 335, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3057, 215, 383, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3057, 245, 31, 59);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3409, 245, 31, 89);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3281, 335, 287, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3478, 262, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3607, 367, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3890, 372, 223, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3890, 252, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3922, 132, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3922, 162, 223, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3890, 282, 31, 89);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3986, 192, 31, 59);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3980, 81, 223, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4236, 81, 191, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 3954, 310, 191, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4050, 220, 63, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4050, 250, 31, 59);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4146, 342, 63, 89);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4146, 216, 63, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4178, 246, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4178, 276, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4242, 336, 63, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4242, 306, 31, 59);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4178, 162, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4242, 192, 31, 59);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4317, 162, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4317, 192, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4317, 222, 31, 89);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4317, 312, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4342, 372, 127, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4438, 402, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4471, 102, 31, 149);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4439, 222, 31, 119);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 4375, 252, 63, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5173, 119, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5169, 216, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5181, 313, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5239, 62, 671, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5237, 164, 671, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5238, 252, 671, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5237, 359, 671, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5944, 108, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5941, 210, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5939, 313, 31, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6088, 109, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6223, 109, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6407, 109, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6544, 109, 95, 29);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    //Flag
    pf = new Platform(gameEngine, 7220, 111, 3, 288);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    //Flag base
    pf = new Platform(gameEngine, 7206, 400, 31, 31);
    gameEngine.addEntity(pf);
    platforms.push(pf);

    gameEngine.platforms = platforms;
    var mario = new Mario(gameEngine);
    var turtles = [];

    turtles[0] = new Turtle(gameEngine, 1800, 250);
    turtles[1] = new Turtle(gameEngine, 1900, 392);
    turtles[2] = new Turtle(gameEngine, 3236, 173);
    turtles[3] = new Turtle(gameEngine, 5389, 22);
    turtles[4] = new Turtle(gameEngine, 5507, 124);
    turtles[5] = new Turtle(gameEngine, 5753, 211);
    turtles[6] = new Turtle(gameEngine, 5850, 319);
    turtles[7] = new Turtle(gameEngine, 6131, 69);
    turtles[8] = new Turtle(gameEngine, 6263, 69);
    turtles[9] = new Turtle(gameEngine, 6443, 69);
    turtles[10] = new Turtle(gameEngine, 6583, 69);

    var coin = new Coin(gameEngine, 822, 168);

    gameEngine.addEntity(mario);
    gameEngine.mario = mario;
    var pg = new PlayGame(gameEngine, 320, 350);
    gameEngine.addEntity(pg);

    for (var x = 0; x < 11; x++) {
        gameEngine.addEntity(turtles[x]);
    }
    gameEngine.addEntity(coin);

    gameEngine.init(ctx);
    gameEngine.start();
});