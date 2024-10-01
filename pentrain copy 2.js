const main_layer = document.getElementById("main_layer");
const main_ctx = main_layer.getContext("2d");

const path_layer = document.getElementById("path_layer");
const path_ctx = path_layer.getContext("2d");

const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");

const exampleBtns = document.querySelectorAll(".exampleBtns");

const whichEx = document.getElementById("ex");
const message = document.getElementById("message");

const G = -200;

const BALL_INITIAL_BACK_X = -470;
const TRAIN_INITIAL_BACK_X = -320;
const BALL_MID_X = 350;
const TRAIN_MID_X = 500;
const INITIAL_HEIGHT = 430;
const HORIZONTAL_SPEED = 180;

// Controls the frequency of dots drawn    
let f = 0.05;
let n = 0;

let go = false;

let playbackSpeed = 1.000;

let ex = 0;

main_ctx.translate(0, main_layer.height);
main_ctx.scale(1, -1);

path_ctx.translate(0, main_layer.height);
path_ctx.scale(1, -1);

function rotateAndDrawImage(img, x, y, θ = 0, scale = 1) {
    main_ctx.save();
    main_ctx.translate(x, y);
    main_ctx.rotate(θ);
    main_ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
    main_ctx.restore();
}

const dot = {
    x: 0,
    y: 0,
    draw() {
        path_ctx.beginPath();
        path_ctx.arc(this.x, this.y, 1, 0, Math.PI * 2, true);
        path_ctx.closePath();
        path_ctx.fillStyle = "#CF9FFF";
        path_ctx.fill();
        path_ctx.fillStyle = "black";
    }
}

function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for (var src in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function () {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

loadImages(sources, function (images) {

    const basketball = {
        x0: BALL_INITIAL_BACK_X,
        x: BALL_INITIAL_BACK_X,
        y0: INITIAL_HEIGHT,
        y: INITIAL_HEIGHT,
        vx: HORIZONTAL_SPEED,
        vy: 0,
        tx0: 0,
        tx: 0,
        ty0: 0,
        ty: 0,
        dropped: false,
        drop: true,
        landed() {
            return (this.y < 60) && this.tx > 1;
        },
        draw() {
            rotateAndDrawImage(images.basketball, this.x, this.y, 0, 0.25);
        }
    }

    const train = {
        image: images.train,
        x0: TRAIN_INITIAL_BACK_X,
        x: TRAIN_INITIAL_BACK_X,
        v: HORIZONTAL_SPEED,
        t0: 0,
        t: 0,
        draw() {
            rotateAndDrawImage(this.image, this.x, 220, Math.PI, 0.18);
        }
    }

    const basketballArr = [];
    const trainArr = [];
    for (let i = 0; i < 3; i++) {
        basketballArr.push(Object.create(basketball));
        trainArr.push(Object.create(train));
    }

    // Example 1
    basketballArr[0].drop = false;

    // Example 2
    basketballArr[1].vx = 0;
    basketballArr[1].x0 = BALL_MID_X;
    basketballArr[1].x = BALL_MID_X;
    trainArr[1].v = 0;
    trainArr[1].x0 = TRAIN_MID_X;
    trainArr[1].x = TRAIN_MID_X;

    // Example 3
    // Nothing to change

    function dropBasketBall() {
        trainArr[ex].image = images.traindropped;
        basketballArr[ex].ty0 = Number(Date.now());
        basketballArr[ex].dropped = true;
    }

    function draw() {
        main_ctx.clearRect(0, 0, main_layer.width, main_layer.height);

        if (go) {
            basketballArr[ex].tx = playbackSpeed * (Date.now() - basketballArr[ex].tx0) / 1000;
            basketballArr[ex].ty = playbackSpeed * (Date.now() - basketballArr[ex].ty0) / 1000;
            trainArr[ex].t = playbackSpeed * (Date.now() - trainArr[ex].t0) / 1000;

            basketballArr[ex].x = basketballArr[ex].x0 + basketballArr[ex].vx * basketballArr[ex].tx;

            if (basketballArr[ex].dropped) {
                basketballArr[ex].y = basketballArr[ex].y0 + basketballArr[ex].vy * basketballArr[ex].ty + 0.5 * G * basketballArr[ex].ty ** 2;
            }

            if ((basketballArr[ex].x > 100) && !basketballArr[ex].dropped && basketballArr[ex].drop) {
                if (ex != 1) { dropBasketBall(); }
                else if (basketballArr[ex].ty > 0.5) { dropBasketBall(); }
            }

            trainArr[ex].x = trainArr[ex].x0 + trainArr[ex].v * trainArr[ex].t;

            if (basketballArr[ex].tx > n) {
                dot.x = basketballArr[ex].x;
                dot.y = basketballArr[ex].y;
                dot.draw();
                n += f;
            }

        }

        if (basketballArr[ex].landed()) {
            basketballArr[ex].y0 = 430;
            basketballArr[ex].vy = Math.sqrt(Math.abs(2 * G * basketballArr[ex].y0));
            basketballArr[ex].vy = 300;
            basketballArr[ex].ty0 = Number(Date.now());
            basketballArr[ex].y += 1;
            basketballArr[ex].y0 = basketballArr[ex].y;
        }

        trainArr[ex].draw();
        basketballArr[ex].draw();

        raf = window.requestAnimationFrame(draw);
    }

    function initialize() {
        path_ctx.clearRect(0, 0, path_layer.width, path_layer.height);

        playbackSpeed = document.querySelector("input[name='playbackSpeed']:checked").value;

        n = 0;

        basketballArr[ex].dropped = false;

        basketballArr[ex].x = basketballArr[ex].x0;
        basketballArr[ex].y0 = INITIAL_HEIGHT;

        trainArr[ex].image = images.train;
        trainArr[ex].x = trainArr[ex].x0;

        basketballArr[ex].tx0 = Number(Date.now());
        basketballArr[ex].ty0 = Number(Date.now());

        trainArr[ex].t0 = Number(Date.now());

        draw();
    }

    function restartTime() {
        n = 0;
        let trn = Number(Date.now());
        basketballArr[ex].tx0 = trn;
        basketballArr[ex].ty0 = trn;
        trainArr[ex].t0 = trn;
        basketballArr[ex].x0 = basketballArr[ex].x;
        basketballArr[ex].y0 = basketballArr[ex].y;
        if (basketballArr[ex].dropped) { basketballArr[ex].vy = G * basketballArr[ex].ty; }
        trainArr[ex].x0 = trainArr[ex].x;
    }

    startBtn.addEventListener("click", () => {
        initialize();
        go = true;
    });

    resetBtn.addEventListener("click", () => {
        console.log("RESET")
    });

    const playBackSpeedBtns = document.querySelectorAll(".playback");
    playBackSpeedBtns.forEach(btn => {
        btn.addEventListener("change", (e) => {
            playbackSpeed = e.target.value;
            restartTime();
        });
    });

    const messages = [
        "The basketball moves horizontally at constant speed; there is no vertical motion.",
        "The basketball drops straight down vertically; there is no horizontal motion.",
        "The basketball is dropped while the train is moving horizontally.  This is a combination of the first two examples.",
    ]

    for (let i = 0; i < exampleBtns.length; i++) {
        exampleBtns[i].addEventListener("click", () => {
            ex = i;
            go = false;
            document.getElementById("ex").textContent = "Example " + (i + 1) + ": ";
            message.textContent = messages[i];
            initialize();
        });
    }

    initialize();
});
