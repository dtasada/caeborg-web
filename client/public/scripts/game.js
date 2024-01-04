// constants
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const Application = PIXI.Application,
      Graphics = PIXI.Graphics,
      Sprite = PIXI.Sprite,
      Texture = PIXI.Texture,
      Color = PIXI.Color;

// colors
const AQUAMARINE = [150, 200, 200];
const PINK = [255, 192, 203];
const RASPBERRY = [227, 11, 93];
const LIGHT_BLUE = [25, 189, 255];
const WHITE = [255, 255, 255];

// functions
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function colliderect(r1, r2) {
    // Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  
    // hit will determine whether there's a collision
    hit = false;
  
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
  
    // Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
  
    // Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  
    // Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  
    // Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        // A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            // There's definitely a collision happening
            hit = true;
        } else {
            // There's no collision on the y axis
            hit = false;
        }
    } else {
    
        // There's no collision on the x axis
        hit = false;
    }
    // `hit` will be either `true` or `false`
    return hit;
}
  
function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function hex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// classes
class SmartVector {
    get bottom() {
        return this.sprite.y + this.sprite.height
    }

    set bottom(value) {
        this.sprite.y = value - this.sprite.height
    }

    get right() {
        return this.sprite.x + this.sprite.width
    }

    set right(value) {
        this.sprite.x = value - this.sprite.width
    }
}

class Player extends SmartVector {
    constructor() {
        //
        super();
        //
        this.yvel = 0;
        this.yacc = 0.4;
        this.xvel = 0;
        this.xacc = 1;
        this.deacc = 1;
        this.max_xvel = 6;
        this.w_released = true;
        this.jumps_left = 2;
        this.target_tint;
        this.color = [255, 255, 255];
        //
        this.sprite = new Sprite(Texture.WHITE);
        this.sprite.width = 30;
        this.sprite.height = 30;
        //
        app.stage.addChild(this.sprite)
    }

    update() {
        // move with keys
        this.wasd();
        this.sprite.x += this.xvel;
        for (const platform of platforms) {
            if (colliderect(this.sprite, platform.sprite)) {
                if (this.xvel > 0) {
                    this.right = platform.sprite.x;
                } else {
                    this.sprite.x = platform.right;
                }
            }
        }
        // update position
        this.yvel += this.yacc;
        this.sprite.y += this.yvel;
        // collide in the y-direction
        for (const platform of platforms) {
            if (colliderect(this.sprite, platform.sprite)) {
                if (this.yvel > 0) {
                    this.bottom = platform.sprite.y;
                    this.yvel = 0;
                    this.jumps_left = 2;
                } else {
                    this.sprite.y = platform.bottom;
                    this.yvel = 0;
                }
            }
        }
        // update tint
        this.tint()
    }


    wasd () {
        if (keys["d"]) {
            this.xvel += this.xacc * (this.max_xvel - this.xvel)
        }
        if (keys["a"]) {
            this.xvel += this.xacc * (-this.max_xvel - this.xvel)
        }
        if (!keys["d"] && !keys["a"]) {
            this.xvel += this.deacc * (-this.xvel)
        }
        if (keys["w"]) {
            if (this.w_released) {
                if (this.jumps_left > 0) {
                    this.yvel = -8;
                    this.w_released = false;
                    this.jumps_left -= 1;
                }
            }
        } else {
            this.w_released = true;
        }
    }

    tint() {
        let m = 0.2;
        this.target_tint = {0: LIGHT_BLUE, 1: RASPBERRY, 2: PINK}[this.jumps_left];
        this.color[0] = Math.floor(this.color[0] + m * (this.target_tint[0] - this.color[0]))
        this.color[1] = Math.floor(this.color[1] + m * (this.target_tint[1] - this.color[1]))
        this.color[2] = Math.floor(this.color[2] + m * (this.target_tint[2] - this.color[2]))
        this.sprite.tint = hex(...this.color)
    }
}

class Platform extends SmartVector {
    constructor(x, y, w, h, color) {
        super();
        this.sprite = new Sprite(Texture.WHITE);
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = w;
        this.sprite.height = h;
        this.sprite.tint = hex(...color);
        platforms.push(this);
        app.stage.addChild(this.sprite);
    }
}

// onload setup
var app;
var player;
var platform;
var keys = {};
var platforms = [];
window.onload = () => {
    app = new Application(
        {
            width: WIDTH,
            height: HEIGHT,
            backgroundColor: hex(120, 120, 120),
        }
    );
    // app itself
    document.body.appendChild(app.view);
    // player and starting platform
    player = new Player();
    platform = new Platform(0, HEIGHT - 50, WIDTH, 50, AQUAMARINE);
    // random platforms
    for (let i=0; i<20; i++) {
        let size = rand(30, 70);
        let p = new Platform(rand(0, WIDTH), rand(0, HEIGHT), size, size, AQUAMARINE);
    }
    // loop
    app.ticker.add(loop);
}

// event listeners
window.addEventListener("keydown", (e) => {keys[e.key] = true;})
window.addEventListener("keyup", (e) => {keys[e.key] = false;})

// loop
function loop(delta) {
   player.update();
}
