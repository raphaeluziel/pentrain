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

    const ballProto = {
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
        drop: false,
        landed() {
            return (this.y < 60) && this.tx > 1;
        },
        draw() {
            rotateAndDrawImage(images.basketball, this.x, this.y, 0, 0.25);
        }
    }

    const trainProto = {
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

    const ballArr = [];
    const trainArr = [];
    for (let i = 0; i < 3; i++) {
        ballArr.push(Object.assign({}, ballProto));
        trainArr.push(Object.assign({}, trainProto));
    }

    // Example 1
    // nothing to change

    // Example 2
    ballArr[1].vx = 0;
    ballArr[1].x0 = BALL_MID_X;
    ballArr[1].x = BALL_MID_X;
    ballArr[1].drop = true;
    trainArr[1].v = 0;
    trainArr[1].x0 = TRAIN_MID_X;
    trainArr[1].x = TRAIN_MID_X;

    // Example 3
    ballArr[2].drop = true;

    let basketball = Object.assign({}, ballProto);
    let train = Object.assign({}, trainProto);

    function dropBasketBall() {
        train.image = images.traindropped;
        basketball.ty0 = Number(Date.now());
        basketball.dropped = true;
    }


    let start;

    function draw(time) {

        if (start === undefined) {
            start = time;
        }
        
        const t = time - start;
        console.log(t);



        main_ctx.clearRect(0, 0, main_layer.width, main_layer.height);

        if (go) {
            basketball.tx = playbackSpeed * (Date.now() - basketball.tx0) / 1000;
            basketball.ty = playbackSpeed * (Date.now() - basketball.ty0) / 1000;
            train.t = playbackSpeed * (Date.now() - train.t0) / 1000;

            basketball.x = basketball.x0 + basketball.vx * basketball.tx;

            if (basketball.dropped) {
                basketball.y = basketball.y0 + basketball.vy * basketball.ty + 0.5 * G * basketball.ty ** 2;
            }

            if ((basketball.x > 100) && !basketball.dropped && basketball.drop) {
                if (ex != 1) { dropBasketBall(); }
                else if (basketball.ty > 0.5) { dropBasketBall(); }
            }

            train.x = train.x0 + train.v * train.t;

            if (basketball.tx > n) {
                dot.x = basketball.x;
                dot.y = basketball.y;
                dot.draw();
                n += f;
            }

        }

        if (basketball.landed()) {
            basketball.vy = Math.sqrt(Math.abs(2 * G * basketball.y0));
            console.log(basketball.vy);
            basketball.vy = 300;
            basketball.ty0 = Number(Date.now());
            basketball.y += 1;
            basketball.y0 = basketball.y;
        }

        train.draw();
        basketball.draw();

        window.requestAnimationFrame(draw);
    }

    function initialize() {
        path_ctx.clearRect(0, 0, path_layer.width, path_layer.height);

        playbackSpeed = document.querySelector("input[name='playbackSpeed']:checked").value;

        n = 0;

        basketball.dropped = false;

        basketball.x = basketball.x0;
        basketball.y0 = INITIAL_HEIGHT;

        train.image = images.train;
        train.x = train.x0;

        basketball.tx0 = Number(Date.now());
        basketball.ty0 = Number(Date.now());

        train.t0 = Number(Date.now());

        draw();
    }

    function restartTime() {
        n = 0;
        let trn = Number(Date.now());
        basketball.tx0 = trn;
        basketball.ty0 = trn;
        train.t0 = trn;
        basketball.x0 = basketball.x;
        basketball.y0 = basketball.y;
        if (basketball.dropped) { basketball.vy = G * basketball.ty; }
        train.x0 = train.x;
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
            basketball = Object.assign(basketball, ballArr[i]);
            train = Object.assign(train, trainArr[i]);
            go = false;
            document.getElementById("ex").textContent = "Example " + (i + 1) + ": ";
            message.textContent = messages[i];
            initialize();
        });
    }

    initialize();
});
