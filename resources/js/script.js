import Vec2 from "./vec2.js";

const WIDTH  = 640;
const HEIGHT = 480;

const GRAVITY = 0.25;
const TANK_SIZE = 20;

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");

var tankA, tankB, bullet;
var imageData;

const setRGB = (data, index, r, g, b) => {
    const i = index << 2;
    data[i    ] = r; // R
    data[i + 1] = g; // G
    data[i + 2] = b; // B
    data[i + 3] = 255; // A
}

document.addEventListener("keydown", (e)=> {

    switch(e.code) {
        case "Space":
            fire(tankA, tankB);
            break;
        case "ArrowUp":
            tankA.angle += 0.02;
            break;
        case "ArrowDown":
            tankA.angle -= 0.02;
            break;
        case "ArrowLeft":
            tankA.force -= 0.5;
            break;
        case "ArrowRight":
            tankA.force += 0.5;
            break;
    }

});

const fire = (tank, tgt) => {
    if(!bullet) {
        bullet = {
            position: new Vec2(tankA.position),
            velocity: new Vec2(0, tank.force).rotate(tank.angle + Math.PI)
        }
    }
}

function getMousePosition(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (WIDTH  / rect.width ),
      y: (evt.clientY - rect.top ) * (HEIGHT / rect.height)
    };
}

const removeData = (imageData, x, y, radius)=> {

    let minX = Math.max(0, Math.floor(x - radius));
    let minY = Math.max(0, Math.floor(y - radius));
    let maxX = Math.min(imageData.width , x + radius);
    let maxY = Math.min(imageData.height, y + radius);
    
    let r2 = radius * radius;

    for(let i = minX; i < maxX; ++i) {
        let diffX = i - x;
        let dx2 = diffX * diffX;
        for(let len2, diffY, j = minY; j < maxY; ++j) {
            diffY = j - y;
            len2 = dx2 + diffY * diffY;
            if(len2 < r2) {
                setRGB(imageData.data, toImageDataIndex(imageData, i, j), 4, 0, 32);
            }
        }
    }
    
}

const toImageDataIndex = (imageData, x, y) => {
    return (imageData.height - y) * imageData.width + x;
}

const checkCollision = (position, size, imageData) => {

    let hs = size * 0.5;

    let x = position.x;
    let y = position.y;

    let minX = Math.max(0, Math.floor(x - hs));
    let minY = Math.max(0, Math.floor(y - hs));
    let maxX = Math.min(imageData.width , x + hs);
    let maxY = Math.min(imageData.height, y + hs);

    for(let i = minX; i < maxX; ++i) {
        for(let j = minY; j < maxY; ++j) {
           if((imageData.data[toImageDataIndex(imageData, i, HEIGHT - j) << 2 ]) === 90) {
               return true;
           }
        }
    }

    return false;
}

const step = ()=> {
    requestAnimationFrame(step); 
    
    context.putImageData(imageData, 0, 0);

    updateTank(tankA, true);
    updateTank(tankB, false);

    if(bullet) {
        bullet.velocity.y += GRAVITY;
        bullet.position.add(bullet.velocity);
        context.fillStyle = "gray";
        context.fillRect(bullet.position.x - 2, bullet.position.y - 2, 4, 4);
        if(bullet.position.y + 2 >= HEIGHT) {
            bullet = null;
        } else {
            
            if(checkCollision(bullet.position, 4, imageData)){
                removeData(imageData, bullet.position.x, HEIGHT - bullet.position.y, 30);
                bullet = null;
            }
        }
    }
    
}

const updateTank = (tank, showInfo) => {

    if(!checkCollision(tank.position, TANK_SIZE, imageData)) {
        tank.velocity += GRAVITY;
        tank.position.y += tank.velocity;
    } else {
        tank.velocity = 0;
    }

    context.fillStyle = tank.color;
    
    context.save();
    context.translate(tank.position.x, tank.position.y)
    context.rotate(tank.angle + Math.PI);
    context.fillRect(-2, 0, 4, 22);
    context.restore();

    context.fillRect(tank.position.x - TANK_SIZE * 0.5, tank.position.y - TANK_SIZE * 0.5, TANK_SIZE, TANK_SIZE);

    if(showInfo) {
        context.fillStyle = "gray";
        context.fillText("Angle: " + tank.angle.toFixed(2), 20, 20);
        context.fillText("Force: " + tank.force.toFixed(2), 20, 40);
    }

}

const createTerrain = (w, h, minY = h * 0.1, slope = 50, steps = 40) => {

    canvas.width  = WIDTH;
    canvas.height = HEIGHT;

    imageData = context.createImageData(w, h);

    let rndSlope = slope * Math.random();
    let y = Math.floor(h * 0.6 * Math.random() + rndSlope - Math.random() * rndSlope * 2);
    y = Math.min(Math.max(y, minY), h * 0.6);

    let lastY, s = Math.floor(w / steps);
    for(let n, tmp, j, i = 0; i < w; ++i) {
        tmp = i % s;
        if(tmp === 0) {
            lastY = y;
            rndSlope = slope * Math.random();
            y = Math.floor(lastY + rndSlope - Math.random() * rndSlope * 2);
            y = Math.min(Math.max(y, minY), h * 0.6);
        }
        n = lastY + ((y - lastY) / s) * tmp;
        for(j = 0; j < n; ++j){
            setRGB(imageData.data, toImageDataIndex(imageData, i, j), 90, 175, 31);
        }
        for(;j < h; ++j){
            setRGB(imageData.data, toImageDataIndex(imageData, i, j), 4, 0, 32);
        }
    }

}

const createPlayers = () => {

    tankA = {
        position: new Vec2(50, 0),
        velocity: 0,
        angle: 0.4,
        force: 10,
        color: "red"
    }
    
    tankB = {
        position: new Vec2(WIDTH - 50, 0),
        velocity: 0,
        angle: 0,
        force: 2,
        color: "blue"
    }

}

const init = ()=> {
    createPlayers();
    createTerrain(WIDTH, HEIGHT);
}

init();

step();