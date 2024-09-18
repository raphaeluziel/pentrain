const main_layer = document.getElementById("main_layer");
const main_ctx = main_layer.getContext("2d");

const path_layer = document.getElementById("path_layer");
const path_ctx = path_layer.getContext("2d");

// Controls the frequency of dots drawn    
let f = 0.04;
let n = f;

let go = false;

main_ctx.translate(0, main_layer.height);
main_ctx.scale(1, -1);

path_ctx.translate(0, main_layer.height);
path_ctx.scale(1, -1);

const ball = {
    x: 200,
    y: 200,
    draw() {
        console.log("WELL?")
        path_ctx.beginPath();
        path_ctx.arc(this.x, this.y, 4, 0, Math.PI * 2, true);
        path_ctx.closePath();
        path_ctx.fillStyle = "#CF9FFF";
        path_ctx.fill();
        path_ctx.fillStyle = "black";
    }
}

function rotateAndDrawImage(img, x, y, θ = 0, scale = 1) {
    main_ctx.save();
    main_ctx.translate(x, y);
    main_ctx.rotate(θ);
    main_ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
    main_ctx.restore();
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
console.log("A");
loadImages(sources, function (images) {
    console.log("B");

    function draw() {
        console.log("BBBBB")
        main_ctx.clearRect(0, 0, main_layer.width, main_layer.height);

        ball.draw();

        raf = window.requestAnimationFrame(draw);
    }

    function initialize() {
    }

    initialize();
    draw();
});

ball.draw();