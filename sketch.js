// ===============
// Coversheet info
// ===============

// Candidate Number: DP1082
// Degree Title: BSc Computer Science
// Course Title: Introduction to Programming I
// Course Code: CM1005

// ==================
// Extension Comments
// ==================

// ----------------------------
// Extension 1 - Create enemies
// ----------------------------
// My first extension is the enemy creation extension and there were 2 points that I struggled with the most:
// - The first was the collision as a condition for losing a life. I found out that using two points and trying to
// calculate the distance between them was not producing accurate results. I found out that it is best calculated by
// creating two rectangles and investigating whether they overlap. I also learned the algorithm for this which is that
// an overlap satisfies 4 conditions:
// RectA.Left < RectB.Right && RectA.Right > RectB.Left && RectA.Top > RectB.Bottom && RectA.Bottom < RectB.Top.
// - I also faced a bug because I was not able to create collision between the character and the rotating vector.
// After filling out my code with control.logs I realised that "vector.x" shows the relative coordinates  to the centre
// of the vector, so I had to use "x + vector.x" instead.

// -----------------------
// Extension 2 - Add sound
// -----------------------

// The second extension is the addition of sound. I browsed the sound library freesound.org for free to use sounds.
// The trickiest part was managing the background theme song and learning how to use loop() and how to start and stop
// the song by looping according to gameplay events. I also had to tweak the sound levels so that they are as well
// balanced as possible.
// The biggest bug I faced was within my checkWinLose() function. At the end of the game whether winning or losing the
// sound would continue playing and when I was using the Sound.stop() function of p5.js I was dealing with a very
// annoying repetitive and increasing noise. I spent a lot of time trying to understand this bug until I realised that
// it was due to me not ending the draw loop of p5.js and it got resolved when I included a noLoop() function.

// =================
// Table of contents
// =================

//  1. Variables declaration        72-81
//  2. p5.js functions              83-205
//      2.1 preload
//      2.2 setup
//      2.3 draw
//  3. Gameplay functions           207-238
//      3.1 keyPressed
//      3.2 keyReleased
//  4. Back-End functions           240-341
//      4.1 startGame
//      4.2 loseLife
//      4.3 winLose
//  5. Front-End functions          343-812
//      5.1 instructions
//      5.2 createGameCharacter
//      5.3 drawLives
//      5.4 drawScore
//      5.5 createMountain
//      5.6 createCloud
//      5.7 createTree
//      5.8 createCanyon
//      5.9 createCollectable
//      5.10 createFlagpole
//      5.11 Fish
//      5.12 Fire

// ============================== Start of Code ==============================

// -----------------
// Declare Variables
// -----------------

// Game elements variables
var gameChar, mountains, clouds, trees, canyons, collectables, flagpole, fishes, fires;
// Game mechanics variables
var scrollPos, gameChar_world_x, floorPos_y
// Game sound variables
var jumpSound, coinSound, levelSound, lifeSound, themeSound;

// ---------------
// p5.js functions
// ---------------

function preload() {
    soundFormats('mp3','wav');

    // Loading sounds
    jumpSound = loadSound('media/soundfiles/jump.wav');
    jumpSound.setVolume(2);
    coinSound = loadSound('media/soundfiles/coin.wav');
    coinSound.setVolume(4);
    levelSound = loadSound('media/soundfiles/level.wav');
    levelSound.setVolume(2);
    lifeSound = loadSound('media/soundfiles/life.wav');
    lifeSound.setVolume(2);
    themeSound = loadSound('media/soundfiles/theme.wav');
    themeSound.setVolume(0.1);
}

function setup () {
    createCanvas(1024, 576, noLoop());
    floorPos_y = height * 3/4;
    themeSound.loop();

    // Create Game Character
    gameChar = createGameCharacter();
    // Create game elements
    startGame();
}

function draw () {
    background('skyblue');
    noStroke();
    fill('forestgreen');
    rect(0, floorPos_y, width, height/4);

    // Gameplay instructions
    if (isLooping()==false) {
        instructions();
    } else {
        // Save drawing style settings
        push();
        translate(scrollPos, 0);

        // Draw mountains
        for (var i=0; i<mountains.length; i++) {
            mountains[i].draw();
        }

        // Draw clouds
        for (var i=0; i<clouds.length; i++) {
            clouds[i].draw();
        }

        // Draw trees
        for (var i=0; i<trees.length; i++) {
            trees[i].draw();
        }

        // Draw and check canyons
        for (var i=0; i<canyons.length; i++) {
            canyons[i].draw();
            canyons[i].check();
        }

        // Draw and check collectables
        for (var i=0; i<collectables.length; i++) {
            if (!collectables[i].isFound) {
                collectables[i].check();
                collectables[i].draw();
            }
        }

        // Draw and check flagpole
        flagpole.check();
        flagpole.draw();

        // Draw enemies and check lose life conditions
        for (var i=0; i<fishes.length; i++) {
            fishes[i].draw();
            let isContact = fishes[i].checkContact(gameChar_world_x, gameChar.y);
            if (isContact) {
                if(gameChar.lives >0) {
                    loseLife();
                    break;
                }
            }
        }

        for (var i=0; i<fires.length; i++) {
            fires[i].draw();
            let isContact = fires[i].checkContact(gameChar_world_x, gameChar.y);
            if (isContact) {
                if (gameChar.lives > 0) {
                    loseLife();
                    break;
                }
            }
        }
        // Restore drawing style settings
        pop();

        // Draw game character.
        gameChar.draw();
        gameChar.move();
        gameChar.checkLives();

        // Draw score
        drawScore();

        // Draw lives
        for (var i=gameChar.lives; i>0; i--) {
            drawLives(gameChar.lives);
        }

        // Win or lose logic
        checkWinLose();

        // Update real position of gameChar for collision detection.
        gameChar_world_x = gameChar.x - scrollPos;
    }
}

// ------------------
// Gameplay functions
// ------------------

function keyPressed(){
    if(keyCode == 37){
        gameChar.isLeft=true;
    } else if (keyCode == 39){
        gameChar.isRight=true;
    }
    if(keyCode == 32 && gameChar.y==floorPos_y){
        gameChar.y -= 100;
        jumpSound.play();
    }
    // Start the game with Enter at the intro screen
    if(keyCode == 13) {
        loop();
    }
    // Restart the game with "R" after win or lose
    if(keyCode == 82 && (gameChar.lives==0 || flagpole.isReached)){
        setup();
        draw();
    }
}

function keyReleased() {
    if(keyCode == 37){
        gameChar.isLeft=false;
    } else if (keyCode == 39){
        gameChar.isRight=false;
    }
}

// ------------------
// Back-End functions
// ------------------

function startGame() {
    // Initial character position
    gameChar.x = width/10;
    gameChar.y = floorPos_y;

    // Create mountains
    mountains = [];
    mountains.push(createMountain(500));
    mountains.push(createMountain(750));
    mountains.push(createMountain(1800));
    mountains.push(createMountain(2400));

    // Create clouds
    clouds = [];
    for (var i=0; i<10; i++) {
        clouds.push(createCloud(150+i*200*random(0.9, 1.1), random(100, 250)));
    }

    // Create trees
    trees = [];
    trees.push(createTree(500));
    trees.push(createTree(1000));
    trees.push(createTree(1200));
    trees.push(createTree(1300));
    trees.push(createTree(1600));
    trees.push(createTree(2000));
    trees.push(createTree(2100));
    trees.push(createTree(2300));

    // Create canyons
    canyons = [];
    canyons.push(createCanyon(300));
    canyons.push(createCanyon(1100));
    canyons.push(createCanyon(1500));

    // Create collectables
    collectables = [];
    collectables.push(createCollectable(600, floorPos_y-random(50,150)));
    collectables.push(createCollectable(800, floorPos_y-random(50,150)));
    collectables.push(createCollectable(1400, floorPos_y-random(50,150)));
    collectables.push(createCollectable(1750, floorPos_y-random(50,150)));
    collectables.push(createCollectable(2100, floorPos_y-random(50,150)));

    // Create flagpole
    flagpole = createFlagpole(2500);

    // Create enemies
    fishes = [];
    for (var i=0; i<canyons.length; i++) {
        fishes.push(new Fish(canyons[i].x+25, canyons[i].y-150));
    }

    fires = [];
    for (var i=0; i<collectables.length; i++) {
        fires.push(new Fire(collectables[i].x, collectables[i].y));
    }

    // Variable to control the background scrolling.
    scrollPos = 0;

    // Variable to store the real position of the gameChar in the game world.
    gameChar_world_x = gameChar.x - scrollPos;
}

function loseLife() {
    // Result of collision or falling into a canyon
    gameChar.lives--;
    lifeSound.play();
    themeSound.stop();
    startGame();
}

function checkWinLose() {
    push();
    // Game over screen when lives are 0
    if (gameChar.lives<1) {
        textSize(32)
        fill('darkred')
        text("Game over!", 20, 150);
        textSize(24)
        fill('black')
        text("Press -R- to restart", 20, 200);
        noLoop();
        themeSound.stop();
    }
    // Winning screen when flagpole reached
    if (flagpole.isReached) {
        textSize(32)
        fill('green')
        text("Congratulations!", 20, 150);
        textSize(24)
        fill('black')
        text("Press -R- to play again", 20, 200);
        noLoop();
        themeSound.stop();
    }
    pop();
}

// -------------------
// Front-End functions
// -------------------

function instructions () {
    // Intro screen with gameplay information
    push();
    textSize(32)
    fill('red')
    text("Superstick", 20, 150);
    textSize(24)
    fill('black')
    text("Avoid enemies, collect coins and reach the finish flag to win", 20, 200);
    text("Use the ARROW KEYS to move Superstick", 20, 250);
    text("Use the SPACEBAR to jump", 20, 300);
    text("Press ENTER to start game", 20, 350);
    pop();
}

function createGameCharacter() {
    // Game character object including all necessary functions for clean code and scalability reasons
    let c = {
        setup: function (x, y, isLeft, isRight, isFalling, isPlummeting, lives, score) {
            this.x = 0;
            this.y = 0;
            this.isLeft = false;
            this.isRight = false;
            this.isFalling = false;
            this.isPlummeting = false;
            this.lives = 3;
            this.score = 0;
        },

        draw: function () {
            let x = this.x;
            let y = this.y;
            if(this.isLeft && this.isFalling) {
                noStroke();
                fill(255, 0, 0);
                triangle(x, y-50, x, y-40, x+20, y-40);
                stroke(0);
                fill(255);
                ellipse(x, y-65, 20, 20);
                line(x, y-20, x, y-55);
                line(x, y-50, x-20, y-65);
                line(x, y-50, x+5, y-30);
                line(x, y-20, x-15, y-20);
                line(x, y-20, x+15, y-20);
            } else if(this.isRight && this.isFalling) {
                noStroke();
                fill(255, 0, 0);
                triangle(x, y-50, x-20, y-40, x, y-40);
                stroke(0);
                fill(255);
                ellipse(x, y-65, 20, 20);
                line(x, y-20, x, y-55);
                line(x, y-50, x-5, y-30);
                line(x, y-50, x+20, y-65);
                line(x, y-20, x-15, y-20);
                line(x, y-20, x+15, y-20);
            } else if(this.isLeft) {
                noStroke();
                fill(255, 0, 0);
                triangle(x, y-50, x, y-10, x+20, y-10);
                stroke('black');
                fill('white');
                ellipse(x, y-65, 20, 20);
                line(x, y-20, x, y-55);
                line(x, y-50, x-20, y-30);
                line(x, y-50, x+5, y-30);
                line(x, y-20, x-15, y);
                line(x, y-20, x+5, y);
            } else if(this.isRight) {
                noStroke();
                fill(255, 0,0 );
                triangle(x, y-50, x-20, y-10, x, y-10);
                stroke('black');
                fill('white');
                ellipse(x, y-65, 20, 20);
                line(x, y-20, x, y-55);
                line(x, y-50, x-5, y-30);
                line(x, y-50, x+20, y-30);
                line(x, y-20, x-5, y);
                line(x, y-20, x+15, y);
            } else if(this.isFalling || this.isPlummeting) {
                noStroke();
                fill(255, 0, 0);
                triangle(x, y-50, x-20, y-40, x+20, y-40);
                stroke(0);
                fill(255);
                ellipse(x, y-65, 20, 20);
                line(x, y-20, x, y-55);
                line(x, y-50, x-20, y-65);
                line(x, y-50, x+20, y-65);
                line(x, y-20, x-15, y-20);
                line(x, y-20, x+15, y-20);
            } else {
                noStroke();
                fill(255, 0, 0);
                triangle(x, y-50, x-20, y-10, x+20, y-10);
                stroke('black');
                fill('white');
                ellipse(x, y-65, 20, 20);
                line(x, y-20, x, y-55);
                line(x, y-50, x-20, y-30);
                line(x, y-50, x+20, y-30);
                line(x, y-20, x-15, y);
                line(x, y-20, x+15, y);
            }
        },

        move: function () {
            // Logic to make the game character move or the background scroll.
            if(gameChar.isLeft) {
                if(gameChar.x > width * 0.5) {
                    gameChar.x -= 4;
                } else {
                    scrollPos += 4;
                }
            }

            if(gameChar.isRight) {
                if(gameChar.x < width * 0.5) {
                    gameChar.x  += 4;
                } else {
                    scrollPos -= 4;
                }
            }

            // Logic to make the game character rise and fall.
            if(gameChar.y<floorPos_y) {
                gameChar.isFalling=true;
                gameChar.y +=2.5;
            } else {
                gameChar.isFalling=false;
            }
        },

        checkLives: function () {
            if(this.y>height) {
                this.lives--;
                themeSound.stop();
                if (this.lives>0) {
                    this.isPlummeting = false;
                    lifeSound.play();
                    startGame();
                    themeSound.play();
                }
            }
        }
    };
    c.setup();
    return c;
}

function drawLives(lives) {
    push();
    fill(0);
    noStroke();
    textSize(24);
    text("Lives: ", 20, 50);
    pop();

    for (var i=lives; i>0; i--) {
        let x = 50*(i+1);
        noStroke();
        fill(color(255, 0, 0));
        triangle(x, 38, x-10, 60, x+10, 60);
        stroke('black');
        fill('white');
        ellipse(x, 30, 10, 10);
        fill(255, 0, 0);
        line(x, 35, x, 55);
        line(x, 38, x-10, 50);
        line(x, 38, x+10, 50);
        line(x, 55, x-10, 67);
        line(x, 55, x+10, 67);

    }
}

function drawScore() {
    push();
    fill(0);
    noStroke();
    textSize(24);
    text("Score: " + gameChar.score, 20, 100);
    pop();
}

function createMountain(x) {
    let m = {
        x: x,

        setup: function (x, y, size, colour) {
            this.x = x;
            this.y = floorPos_y;
            this.size = random(1, 2)
            this.colour = color(random(75,125));
        },

        draw: function () {
            fill(this.colour);
            triangle(this.x, this.y, this.x+100*this.size,
                this.y-200*this.size, this.x+200*this.size,
                this.y)
            fill('rgba(255,255,255,0.7)');
            triangle(this.x+100*this.size, this.y-200*this.size,
                this.x+89*this.size, this.y-180*this.size,
                this.x+111*this.size, this.y-180*this.size)
        }
    };
    m.setup(x);
    return m;
}

function createCloud(x,y) {
    let c = {
        x: x,
        y: y,

        setup: function(x, y, size, colour) {
            this.x = x;
            this.y = y;
            this.size = random(0.9, 1.1);
            this.colour = color(random(220, 255));
        },

        draw: function () {
            fill(this.colour);
            ellipse(this.x, this.y, this.size * 75);
            ellipse(this.x - 50, this.y, this.size * 50);
            ellipse(this.x + 50, this.y, this.size * 50);
        }
    };
    c.setup(x,y);
    return c;
}

function createTree(x) {
    let t = {
        x: x,

        setup: function(x, y, size, colour) {
            this.x = x;
            this.y = floorPos_y-150;
            this.size = random(0.9, 1.1);
            this.colour = color(0, random(100, 115), 0);
        },

        draw: function () {
            fill('brown');
            rect(this.x,this.y+75,30,75);
            fill(this.colour);
            triangle(this.x-50,this.y+75,this.x+15,this.y-100,this.x+80,this.y+75);
        }
    };
    t.setup(x);
    return t;
}

function createCanyon(x) {
    let c = {
        x: x,

        setup: function(x, y, size) {
            this.x = x;
            this.y = floorPos_y;
            this.size = random(0.9, 1.1);
        },

        draw: function () {
            fill('skyblue');
            beginShape();
            vertex(this.x,this.y);
            vertex(this.x,this.y+144);
            vertex(this.x+50*this.size,this.y+144);
            vertex(this.x+50*this.size,this.y);
            endShape();
            fill('blue');
            beginShape();
            vertex(this.x,500);
            vertex(this.x,576);
            vertex(this.x+50*this.size,this.y+144);
            vertex(this.x+50*this.size,this.y+68);
            endShape();
        },

        check: function () {
            if(gameChar_world_x>this.x &&
                gameChar_world_x<(this.x+50*this.size) &&
                gameChar.y>=floorPos_y){
                gameChar.isPlummeting=true;
                gameChar.y+=150;
            }
        }
    };
    c.setup(x);
    return c;
}

function createCollectable(x,y) {
    let c = {
        x: x,
        y: y,

        setup: function (x, y) {
            this.x = x;
            this.y = y;
            this.isFound = false;
        },

        check: function () {
            // Check rectangle overlap - rect(x1, y1, x2, y2)
            // charRect = rect(gc_x-10, gc_y-80, gc_x+10, gc_y);
            // fishRect = rect(this.x-10, this.currentY-20, this.x+10, this.currentY);
            // RectA.Left < RectB.Right && RectA.Right > RectB.Left && RectA.Top > RectB.Bottom && RectA.Bottom < RectB.Top
            if (gameChar_world_x-10 < this.x+5 && gameChar_world_x+10 > this.x-5 && gameChar.y-80 < this.y+5 && gameChar.y > this.y-5) {
                this.isFound = true;
                gameChar.score++;
                coinSound.play();
            }
            return false;
        },

        draw: function () {
            if (!this.isFound) {
                fill("gold");
                ellipse(this.x, this.y, 25);
                fill("yellow");
                ellipse(this.x, this.y, 20);
                fill("green")
                text("$", this.x - 3, this.y + 4);
                this.check();
            }
        },
    }
    c.setup(x,y);
    return c;
}

function createFlagpole(x) {
    let f = {
        x: x,

        setup: function () {
            this.x = x;
            this.y = floorPos_y-50;
            this.isReached = false;
        },

        draw: function () {
            push();
            strokeWeight(5);
            stroke('black');
            line(flagpole.x, floorPos_y, flagpole.x, floorPos_y-250);
            fill('white');
            noStroke();
            if(flagpole.isReached) {
                for (var i=0; i<5; i++) {
                    for (var j=0; j<5; j++) {
                        if ((i % 2 == 0 && j % 2 == 0) || (i % 2 == 1 && j % 2 == 1)) {
                            fill('black')
                            rect(flagpole.x+i*10, floorPos_y-250+j*10, 10, 10);
                        } else {
                            fill('white')
                            rect(flagpole.x+i*10, floorPos_y-250+j*10, 10, 10);
                        }
                    }
                }
            } else {
                for (var i=0; i<5; i++) {
                    for (var j=0; j<5; j++) {
                        if ((i % 2 == 0 && j % 2 == 0) || (i % 2 == 1 && j % 2 == 1)) {
                            fill('black')
                            rect(flagpole.x+i*10, floorPos_y-50+j*10, 10, 10);
                        } else {
                            fill('white')
                            rect(flagpole.x+i*10, floorPos_y-50+j*10, 10, 10);
                        }
                    }
                }
            }
            pop();
        },

        check: function () {
            let d = abs(gameChar_world_x - flagpole.x);
            if(d<15) {
                flagpole.isReached = true;
                levelSound.play();
            }
        }
    }
    f.setup(x);
    return f
}

function Fish(x, y) {
    this.x = x;
    this.y = y;

    this.currentY = y;
    this.inc = -5;
    this.range = 250;

    this.update = function () {
        this.currentY += this.inc;
        if (this.currentY >= this.y + this.range) {
            this.inc *= -1;
        } else if (this.currentY < this.y) {
            this.inc *= -1;
        }
    }
    this.draw = function () {
        this.update();
        push()
        if (this.currentY < 4*height/5) {
            fill('teal');
            quad(this.x, this.currentY, this.x+10, this.currentY+15,
                this.x, this.currentY+30, this.x-10, this.currentY+15)
            triangle(this.x, this.currentY+25, this.x+5, this.currentY+35, this.x-5, this.currentY+35)
        }
        pop()
    }
    this.checkContact = function (gc_x, gc_y) {
        // Check rectangle overlap - rect(x1, y1, x2, y2)
        // charRect = rect(gc_x-10, gc_y-80, gc_x+10, gc_y);
        // fishRect = rect(this.x-10, this.currentY-20, this.x+10, this.currentY);
        // RectA.Left < RectB.Right && RectA.Right > RectB.Left && RectA.Top > RectB.Bottom && RectA.Bottom < RectB.Top
        if (gc_x-10 < this.x+10 && gc_x+10 > this.x-10 && gc_y-80 < this.currentY+20 && gc_y > this.currentY-20) {
            return true;
        }
        return false;
    }
}

function Fire(x, y) {
    this.x = x;
    this.y = y;
    this.currentX = 0;
    this.currentY = 0;
    let f = createVector(500, 1000);
    let v = p5.Vector.mult(f, 0.1);

    this.update = function () {
        v.rotate(0.05);
        this.currentX = x+v.x;
        this.currentY = y+v.y;
    }

    this.draw = function () {
        this.update();
        push();
        fill('red');
        translate(this.x, this.y)
        ellipse(v.x, v.y, 20, 20);
        pop();
    }
    this.checkContact = function (gc_x, gc_y) {
        // Check rectangle overlap - rect(x1, y1, x2, y2)
        // charRect = rect(gc_x-10, gc_y-80, gc_x+10, gc_y);
        // fireRect = rect(this.currentX-10, this.currentY-20, this.currentX+10, this.currentY+20);
        // RectA.Left < RectB.Right && RectA.Right > RectB.Left && RectA.Top > RectB.Bottom && RectA.Bottom < RectB.Top
        if (gc_x-10 < this.currentX+10 && gc_x+10 > this.currentX-10 && gc_y-80 < this.currentY+10 && gc_y > this.currentY-10) {
            return true;
        }
        return false;
    }
}
