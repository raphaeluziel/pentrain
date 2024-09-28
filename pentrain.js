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

const g = -200;

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
        vx: 180,
        vy: 0,
        t0x: 0,
        tx: 0,
        t0y: 0,
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
        x0: -320,
        x: -320,
        v: 180,
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
    basketballArr[1].x0 = 350;
    basketballArr[1].x = 350;
    trainArr[1].v = 0;
    trainArr[1].x0 = 500;
    trainArr[1].x = 500;

    // Example 3
    // Nothing to change

    function dropBasketBall() {
        trainArr[ex].image = images.traindropped;
        basketballArr[ex].t0y = Number(Date.now());
        basketballArr[ex].dropped = true;
    }
    // REMOVE /////////////////////////////////////////////////////////////////////
    let nn = 0;
    function draw() {
        main_ctx.clearRect(0, 0, main_layer.width, main_layer.height);

        if (go) {
            basketballArr[ex].tx = (Date.now() - basketballArr[ex].t0x) / 2000;
            basketballArr[ex].ty = (Date.now() - basketballArr[ex].t0y) / 2000;
            trainArr[ex].t = (Date.now() - trainArr[ex].t0) / 2000;

            basketballArr[ex].x = basketballArr[ex].x0 + basketballArr[ex].vx * basketballArr[ex].tx;

            if (basketballArr[ex].dropped) {
                basketballArr[ex].y = basketballArr[ex].y0 + basketballArr[ex].vy * basketballArr[ex].ty + 0.5 * g * basketballArr[ex].ty ** 2;
            }

            if ((basketballArr[ex].x > 200) && !basketballArr[ex].dropped && basketballArr[ex].drop) {
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

            if (loop) {
                if ((trainArr[ex].x > 1400) || ((ex == 1) && (basketballArr[ex].ty > 4))) {
                    initialize();
                }
            }

        }

        if (basketballArr[ex].landed()) {
            basketballArr[ex].y0 = 430;
            basketballArr[ex].vy = Math.sqrt(Math.abs(2*g*basketballArr[ex].y0));
            basketballArr[ex].vy = 300;
            basketballArr[ex].t0y = Number(Date.now());
            basketballArr[ex].y += 1;
            basketballArr[ex].y0 = basketballArr[ex].y;
        }

        trainArr[ex].draw();
        basketballArr[ex].draw();

        nn++;
        if (nn > 200) {
            console.log(Math.round(basketballArr[ex].y), Math.round(basketballArr[ex].vy))
            nn = 0;
        }

        raf = window.requestAnimationFrame(draw);
    }

    function initialize() {
        path_ctx.clearRect(0, 0, path_layer.width, path_layer.height);

        n = 0;

        //basketball.drop = dropping[ex];
        //basketball.vx = basketball_velocities[ex];
        //train.v = train_velocities[ex];
        //train.x0 = trainx[ex];
        //basketball.x0 = basketballx0[ex];

        basketballArr[ex].dropped = false;
        basketballArr[ex].x = basketballArr[ex].x0;
        basketballArr[ex].y = basketballArr[ex].y0;
        trainArr[ex].image = images.train;
        trainArr[ex].x = trainArr[ex].x0;
        basketballArr[ex].t0x = Number(Date.now());
        basketballArr[ex].t0y = Number(Date.now());
        trainArr[ex].t0 = Number(Date.now());

        draw();
    }

    startBtn.addEventListener("click", () => {
        initialize();
        go = true;
    });

    resetBtn.addEventListener("click", () => {
        console.log("RESET")
    });

    const messages = [
        "The basketball moves horizontally at constant speed; there is no vertical motion.",
        "The basketball drops straight down vertically; there is no horizontal motion.",
        "The basketball is dropped while the train is moving horizontally.  This is a combination of the first two examples.",
    ]
    //const dropping = [false, true, true];
    //const train_velocities = [train.v, 0, train.v];
    //const basketball_velocities = [basketball.vx, 0, basketball.vx];
    //const trainx = [train.x, 500, train.x];
    //const basketballx0 = [basketball.x0, 350, basketball.x0];

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
