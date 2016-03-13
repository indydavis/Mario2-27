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
    if (this.game.click) {
        this.game.running = true;
        this.game.mario.dead = false;
    }
}

PlayGame.prototype.draw = function (ctx) {
    if (!this.game.running) {
        ctx.font = "24pt Impact";
        ctx.fillStyle = "red";
        if (this.game.mouse) { ctx.fillStyle = "blue"; }
        ctx.fillText("Click to Start", this.x, this.y);
    }
}

function Background(game) {
    Entity.call(this, game, 0, 0);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    if (this.game.running) {
        if (this.game.right && this.x > (0 - 7000))
            this.x -= 2;
        if (this.game.left && this.x < 0)
            this.x += 2;
    }
}

Background.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/level1.png"), this.x, this.y);
    Entity.prototype.draw.call(this);
}

Background.prototype.reset = function () {
    this.x = 0;
    this.y = 0;
}

function Turtle(game, startingX, startingY, pf) {
    this.walkR = new Animation(ASSET_MANAGER.getAsset("./img/turtle-spritesheet.png"), 0, 45, 25, 45, 0.10, 8, true, false);
    this.walkL = new Animation(ASSET_MANAGER.getAsset("./img/turtle-spritesheet.png"), 0, 0, 25, 45, 0.10, 8, true, false);
    this.timer = 0;
    this.maxX = startingX;
    this.turtleX = startingX;
    this.turtleY = startingY;
    this.dx = 0;
    this.pf = pf.boundingbox;
    this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
    Entity.call(this, game, this.turtleX, this.turtleY);
}

Turtle.prototype = new Entity();
Turtle.prototype.constructor = Turtle;

Turtle.prototype.update = function () {
    if (this.game.running) {
        if (this.game.right) {
            this.turtleX -= 2;
            this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
        }
        if (this.game.left) {
            this.turtleX += 2;
            this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
        }
        if (this.tboundingbox.left < this.pf.left) {
            this.x += this.dx;
        } else if (this.tboundingbox.righ > this.pf.right) {
            this.x -= this.dx;
        }
        this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45);
        if (this.tboundingbox.collide(this.game.mario.BoundingBox)) {
            this.game.mario.dead = true;
        }
    }
}

Turtle.prototype.draw = function (ctx) {
    if (this.dx > 0) {
        this.walkR.drawFrame(this.game.clockTick, ctx, this.turtleX, this.turtleY);
        Entity.prototype.draw.call(this);
        ctx.strokeStyle = "Green";
        ctx.strokeRect(this.tboundingbox.x, this.tboundingbox.y, this.tboundingbox.width, this.tboundingbox.height);
        ctx.stroke();
    } else {
        this.walkL.drawFrame(this.game.clockTick, ctx, this.turtleX, this.turtleY);
        Entity.prototype.draw.call(this);
        ctx.strokeStyle = "Green";
        ctx.strokeRect(this.tboundingbox.x, this.tboundingbox.y, this.tboundingbox.width, this.tboundingbox.height);
        ctx.stroke();
    }
}

Turtle.prototype.reset = function () {
    this.turtleX = this.x;
    this.turtleY = this.y;
    this.tboundingbox = new BoundingBox(this.turtleX, this.turtleY, 25, 45)
}

function Coin(game, posX, posY) {
    this.coinX = posX;
    this.coinY = posY;
    this.maxX = posX;
    this.radius = 15;
    this.isCoin = 1;
    this.cboundingbox = new BoundingBox(this.x, this.y, 5, 10);
    Entity.call(this, game, this.x, this.y);
}

Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;

Coin.prototype.update = function () {
    if (this.game.running) {
        if (this.game.right) {
            this.coinX -= 2;
            this.cboundingbox = new BoundingBox(this.coinX, this.coinY, 5, 10);
        }
        if (this.game.left && this.coinX < this.maxX) {
            this.coinX += 2;
            this.cboundingbox = new BoundingBox(this.coinX, this.coinY, 5, 10);
        }
        if (this.cboundingbox.collide(this.game.mario.BoundingBox)) {
            this.game.mario.gameScore++;
            console.log("Score: " + this.game.mario.gameScore);
            this.removeFromWorld = true;
        }
    }
}

Coin.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/coin.png"), this.coinX, this.coinY);
    Entity.prototype.draw.call(this);
    ctx.strokeStyle = "Green";
    ctx.strokeRect(this.cboundingbox.x, this.cboundingbox.y, this.cboundingbox.width, this.cboundingbox.height);
    ctx.stroke();
}

Coin.prototype.reset = function () {
    this.coinX = this.x;
    this.coinY = this.y;
}

GameEngine.prototype.reset = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].reset();
    }
}

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
    if (this.game.running) {
        if (this.game.right) {
            this.platformX -= 2;
            this.boundingbox = new BoundingBox(this.platformX, this.platformY, this.width, this.height);
        }
        if (this.game.left && this.platformX < this.originalX) {
            this.platformX += 2;
            this.boundingbox = new BoundingBox(this.platformX, this.platformY, this.width, this.height);
        }
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
    this.boundingbox = new BoundingBox(this.platformX, this.platformY, this.width, this.height);
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
    this.dead = false;
    this.radius = 100;
    this.ground = 406;
    this.platform = game.platforms[0];
    Entity.call(this, game, 400, 406);
    this.BoundingBox = new BoundingBox(this.x, this.y + 6, 18, 21);
    this.lastbottom = this.BoundingBox.bottom;
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

Mario.prototype.reset = function () {
    this.jumping = false;
    this.falling = false;
    this.y = 406;
    this.platform = this.game.platforms[0];
    this.BoundingBox = new BoundingBox(this.x, this.y, 18, 27);
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
    var turtles = [];
    //Ground platform
    var pf = new Platform(gameEngine, 0, 432, 1607, 69);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 1835, 432, 364, 69);
    turtles[1] = new Turtle(gameEngine, 1900, 392, pf);
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
    turtles[0] = new Turtle(gameEngine, 1800, 250, pf);
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
    turtles[2] = new Turtle(gameEngine, 3236, 173, pf);
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
    pf = new Platform(gameEngine, 4242, 365, 63, 29);
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
    turtles[3] = new Turtle(gameEngine, 5389, 22, pf);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5237, 164, 671, 29);
    turtles[4] = new Turtle(gameEngine, 5507, 124, pf);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5238, 252, 671, 29);
    turtles[5] = new Turtle(gameEngine, 5753, 211, pf);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 5237, 359, 671, 29);
    turtles[6] = new Turtle(gameEngine, 5850, 319, pf);
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
    turtles[7] = new Turtle(gameEngine, 6131, 69, pf);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6223, 109, 95, 29);
    turtles[8] = new Turtle(gameEngine, 6263, 69, pf);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6407, 109, 95, 29);
    turtles[9] = new Turtle(gameEngine, 6443, 69, pf);
    gameEngine.addEntity(pf);
    platforms.push(pf);
    pf = new Platform(gameEngine, 6544, 109, 95, 29);
    turtles[10] = new Turtle(gameEngine, 6583, 69, pf);
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

    var coins = [];
    coins[0] = new Coin(gameEngine, 850, 166);
    coins[1] = new Coin(gameEngine, 895, 125);
    coins[2] = new Coin(gameEngine, 945, 166);
    coins[3] = new Coin(gameEngine, 1000, 235);
    coins[4] = new Coin(gameEngine, 1045, 195);
    coins[5] = new Coin(gameEngine, 1095, 235);
    coins[6] = new Coin(gameEngine, 1696, 206);
    coins[7] = new Coin(gameEngine, 1720, 206);
    coins[8] = new Coin(gameEngine, 2010, 96);
    coins[9] = new Coin(gameEngine, 2010, 50);
    coins[10] = new Coin(gameEngine, 2055, 96);
    coins[11] = new Coin(gameEngine, 2055, 50);
    coins[12] = new Coin(gameEngine, 2100, 96);
    coins[13] = new Coin(gameEngine, 2100, 50);
    coins[14] = new Coin(gameEngine, 2182, 175);
    coins[15] = new Coin(gameEngine, 2212, 175);
    coins[16] = new Coin(gameEngine, 2300, 242);
    coins[17] = new Coin(gameEngine, 2330, 242);
    coins[18] = new Coin(gameEngine, 2405, 312);
    coins[19] = new Coin(gameEngine, 2435, 312);
    coins[20] = new Coin(gameEngine, 3190, 297);
    coins[21] = new Coin(gameEngine, 3190, 257);
    coins[22] = new Coin(gameEngine, 3290, 297);
    coins[23] = new Coin(gameEngine, 3290, 257);
    coins[24] = new Coin(gameEngine, 3320, 297);
    coins[25] = new Coin(gameEngine, 3320, 257);
    coins[26] = new Coin(gameEngine, 3350, 297);
    coins[27] = new Coin(gameEngine, 3350, 257);
    coins[28] = new Coin(gameEngine, 3380, 297);
    coins[29] = new Coin(gameEngine, 3380, 257);
    coins[30] = new Coin(gameEngine, 3535, 225);
    coins[31] = new Coin(gameEngine, 3535, 187);
    coins[32] = new Coin(gameEngine, 3900, 212);
    coins[33] = new Coin(gameEngine, 3930, 212);
    coins[34] = new Coin(gameEngine, 3960, 212);
    coins[35] = new Coin(gameEngine, 3925, 288);
    coins[36] = new Coin(gameEngine, 3925, 327);
    coins[37] = new Coin(gameEngine, 3960, 340);
    coins[38] = new Coin(gameEngine, 4000, 340);
    coins[39] = new Coin(gameEngine, 4030, 340);
    coins[40] = new Coin(gameEngine, 4060, 340);
    coins[41] = new Coin(gameEngine, 4090, 340);
    coins[42] = new Coin(gameEngine, 4025, 197);
    coins[43] = new Coin(gameEngine, 4025, 235);
    coins[44] = new Coin(gameEngine, 4025, 277);
    coins[45] = new Coin(gameEngine, 4119, 197);
    coins[46] = new Coin(gameEngine, 4119, 235);
    coins[47] = new Coin(gameEngine, 4119, 277);
    coins[48] = new Coin(gameEngine, 3967, 125);
    coins[49] = new Coin(gameEngine, 3997, 125);
    coins[50] = new Coin(gameEngine, 4027, 125);
    coins[51] = new Coin(gameEngine, 4057, 125);
    coins[52] = new Coin(gameEngine, 4087, 125);
    coins[53] = new Coin(gameEngine, 4177, 125);
    coins[54] = new Coin(gameEngine, 4207, 125);
    coins[55] = new Coin(gameEngine, 4237, 125);
    coins[56] = new Coin(gameEngine, 4267, 125);
    coins[57] = new Coin(gameEngine, 4217, 200);
    coins[58] = new Coin(gameEngine, 4217, 244);
    coins[59] = new Coin(gameEngine, 4292, 190);
    coins[60] = new Coin(gameEngine, 4292, 284);
    coins[61] = new Coin(gameEngine, 4329, 125);
    coins[62] = new Coin(gameEngine, 4374, 125);
    coins[63] = new Coin(gameEngine, 4424, 125);
    coins[64] = new Coin(gameEngine, 4450, 175);
    coins[65] = new Coin(gameEngine, 4418, 212);
    coins[66] = new Coin(gameEngine, 4355, 235);
    coins[67] = new Coin(gameEngine, 4355, 278);
    coins[68] = new Coin(gameEngine, 4418, 297);
    coins[69] = new Coin(gameEngine, 4220, 406);
    coins[70] = new Coin(gameEngine, 4270, 406);
    coins[71] = new Coin(gameEngine, 4320, 406);
    coins[72] = new Coin(gameEngine, 4370, 406);
    coins[73] = new Coin(gameEngine, 4420, 406);
    coins[74] = new Coin(gameEngine, 5250, 25);
    coins[75] = new Coin(gameEngine, 5350, 25);
    coins[76] = new Coin(gameEngine, 5450, 25);
    coins[77] = new Coin(gameEngine, 5550, 25);
    coins[78] = new Coin(gameEngine, 5650, 25);
    coins[79] = new Coin(gameEngine, 5750, 25);
    coins[80] = new Coin(gameEngine, 5850, 25);
    coins[81] = new Coin(gameEngine, 5250, 129);
    coins[82] = new Coin(gameEngine, 5350, 129);
    coins[83] = new Coin(gameEngine, 5450, 129);
    coins[84] = new Coin(gameEngine, 5550, 129);
    coins[85] = new Coin(gameEngine, 5650, 129);
    coins[86] = new Coin(gameEngine, 5750, 129);
    coins[87] = new Coin(gameEngine, 5850, 129);
    coins[88] = new Coin(gameEngine, 5250, 217);
    coins[89] = new Coin(gameEngine, 5250, 217);
    coins[90] = new Coin(gameEngine, 5350, 217);
    coins[91] = new Coin(gameEngine, 5450, 217);
    coins[92] = new Coin(gameEngine, 5550, 217);
    coins[93] = new Coin(gameEngine, 5650, 217);
    coins[94] = new Coin(gameEngine, 5750, 217);
    coins[95] = new Coin(gameEngine, 5850, 217);
    coins[96] = new Coin(gameEngine, 5250, 327);
    coins[97] = new Coin(gameEngine, 5350, 327);
    coins[98] = new Coin(gameEngine, 5450, 327);
    coins[99] = new Coin(gameEngine, 5550, 327);
    coins[100] = new Coin(gameEngine, 5650, 327);
    coins[101] = new Coin(gameEngine, 5750, 327);
    coins[102] = new Coin(gameEngine, 5850, 327);
    coins[103] = new Coin(gameEngine, 5250, 397);
    coins[104] = new Coin(gameEngine, 5350, 397);
    coins[105] = new Coin(gameEngine, 5450, 397);
    coins[106] = new Coin(gameEngine, 5550, 397);
    coins[107] = new Coin(gameEngine, 5650, 397);
    coins[108] = new Coin(gameEngine, 5750, 397);
    coins[109] = new Coin(gameEngine, 5850, 397);
    coins[110] = new Coin(gameEngine, 6161, 72);
    coins[111] = new Coin(gameEngine, 6296, 72);
    coins[112] = new Coin(gameEngine, 6456, 72);
    coins[113] = new Coin(gameEngine, 6586, 72);
    coins[114] = new Coin(gameEngine, 6192, 300);
    coins[115] = new Coin(gameEngine, 6299, 300);
    coins[116] = new Coin(gameEngine, 6406, 300);
    coins[117] = new Coin(gameEngine, 6522, 300);

    var pg = new PlayGame(gameEngine, 320, 350);
    gameEngine.addEntity(pg);

    gameEngine.addEntity(mario);
    gameEngine.mario = mario;

    for (var x = 0; x < turtles.length; x++) {
        gameEngine.addEntity(turtles[x]);
    }
    for (var y = 0; y < coins.length; y++) {
        gameEngine.addEntity(coins[y]);
    }

    gameEngine.init(ctx);
    gameEngine.start();
});