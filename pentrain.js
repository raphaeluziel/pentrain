const main_layer = document.getElementById("main_layer");
const main_ctx = main_layer.getContext("2d");

const path_layer = document.getElementById("path_layer");
const path_ctx = path_layer.getContext("2d");

const startBtn = document.getElementById("start");
const loopBtn = document.getElementById("loop");
const resetBtn = document.getElementById("reset");

const exampleBtns = document.querySelectorAll(".exampleBtns");

const whichEx = document.getElementById("ex");
const message = document.getElementById("message");

// Controls the frequency of dots drawn    
let f = 0.05;
let n = 0;

let go = false;
let loop = false;

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
        x0: -470,
        x: -470,
        y0: 430,
        y: 430,
        g: -200,
        vx: 180,
        vy: 0,
        t0x: 0,
        tx: 0,
        t0y: 0,
        ty: 0,
        dropped: false,
        drop: false,
        bounced: false,
        landed() {
            return (this.y < 60) && this.tx > 1;
        },
        draw() {
            rotateAndDrawImage(images.basketball, this.x, this.y, 0, 0.25);
        }
    }

    const train = {
        image: images.train,
        x0: -320,
        x: -320,
        v: 180,
        t0: 0,
        t: 0,
        draw() {
            rotateAndDrawImage(this.image, this.x, 220, Math.PI, 0.18);
        }
    }

    function dropBasketBall() {
        train.image = images.traindropped;
        basketball.t0y = Number(Date.now());
        basketball.dropped = true;
    }
    // REMOVE /////////////////////////////////////////////////////////////////////
    let nn = 0;
    function draw() {
        main_ctx.clearRect(0, 0, main_layer.width, main_layer.height);

        if (go) {
            basketball.tx = (Date.now() - basketball.t0x) / 5000;
            basketball.ty = (Date.now() - basketball.t0y) / 5000;
            train.t = (Date.now() - train.t0) / 5000;

            basketball.x = basketball.x0 + basketball.vx * basketball.tx;

            if (basketball.dropped) {
                basketball.y = basketball.y0 + basketball.vy * basketball.ty + 0.5 * basketball.g * basketball.ty ** 2;
            }

            if ((basketball.x > 200) && !basketball.dropped && basketball.drop) {
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

            if (loop) {
                if ((train.x > 1400) || ((ex == 1) && (basketball.ty > 4))) {
                    initialize();
                }
            }

        }

        if (basketball.landed()) {
            if (basketball.bounced) { basketball.ty /= 2; }
            basketball.vy = - 0.9 * basketball.g * basketball.ty;
            basketball.t0y = Number(Date.now());
            basketball.y += 1;
            basketball.y0 = basketball.y;
            basketball.bounced = true;
        }

        train.draw();
        basketball.draw();

        nn++;
        if (nn > 500) {
            console.log(basketball.y)
            nn = 0;
        }

        raf = window.requestAnimationFrame(draw);
    }

    function initialize() {
        path_ctx.clearRect(0, 0, path_layer.width, path_layer.height);

        n = 0;

        basketball.bounced = false;

        basketball.drop = dropping[ex];
        basketball.vx = basketball_velocities[ex];
        train.v = train_velocities[ex];
        train.x0 = trainx[ex];
        basketball.x0 = basketballx0[ex];

        basketball.dropped = false;
        basketball.x = basketball.x0;
        basketball.y = basketball.y0;
        train.image = images.train;
        train.x = train.x0;
        basketball.t0x = Number(Date.now());
        basketball.t0y = Number(Date.now());
        train.t0 = Number(Date.now());

        draw();
    }

    startBtn.addEventListener("click", () => {
        initialize();
        go = true;
    });

    loopBtn.addEventListener("click", () => {
        loop = loop ? false : true;
        loopBtn.textContent = loop ? "Looping" : "Loop";
    });

    resetBtn.addEventListener("click", () => {
        console.log("RESET")
    });

    const messages = [
        "The basketball moves horizontally at constant speed; there is no vertical motion.",
        "The basketball drops straight down vertically; there is no horizontal motion.",
        "The basketball is dropped while the train is moving horizontally.  This is a combination of the first two examples.",
    ]
    const dropping = [false, true, true];
    const train_velocities = [train.v, 0, train.v];
    const basketball_velocities = [basketball.vx, 0, basketball.vx];
    const trainx = [train.x, 500, train.x];
    const basketballx0 = [basketball.x0, 350, basketball.x0];

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
