import Vec2 from "./vec2.js";

const WIDTH  = 640;
const HEIGHT = 480;

const GRAVITY = 0.25;
const TANK_SIZE = 17;

var tankA, tankB, bullet, imageData;

var wind = 0;
var turn = 0;

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");

canvas.width  = WIDTH;
canvas.height = HEIGHT;

document.addEventListener("keydown", (e)=> {

    switch(e.code) {
        case "Space":
            fire(tankA);
            break;
        case "ArrowRight":
            tankA.angle += 0.02;
            break;
        case "ArrowLeft":
            tankA.angle -= 0.02;
            break;
        case "ArrowDown":
            tankA.force -= 0.5;
            break;
        case "ArrowUp":
            tankA.force += 0.5;
            break;
    }

});

const fire = (tank) => {
    if(!bullet && tank.onFloor) {
        if((turn === 0 && tank.enemy === tankB)
        || (turn === 1 && tank.enemy === tankA)) {
            bullet = {
                tgt: tank.enemy,
                position: new Vec2(tank.position),
                velocity: new Vec2(0, tank.force).rotate(tank.angle + Math.PI)
            }
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

    // Update tanks
    updateTank(tankA);
    updateTank(tankB);
    
    // Update bullet
    if(bullet) {
        const state = updateBullet(bullet);
        switch(state) {
            case 2:
               bullet.tgt.enemy.score++;
               bullet = null;
               init();               
                break;
            case 0:
                removeData(imageData, bullet.position.x, HEIGHT - bullet.position.y, 30);
            case 1:
                bullet = null;
                nextTurn();
                break;
            default:
                context.fillStyle = "gray";
                context.fillRect(bullet.position.x - 2, bullet.position.y - 2, 4, 4);
            break;
        }
    }

    if(turn === 0 && !bullet) {
       
        cpuPlay(tankA);

    }

    if(turn === 1 && !bullet) {
       
        cpuPlay(tankB);

    }

    // UI Text
    context.fillStyle = "gray";
    context.font = "25px monospace";
    context.fillText("Player: " + tankA.score, 20, 30);
    context.fillText("CPU: " + tankB.score, WIDTH - 120, 30);
    context.font = "16px monospace";
    context.fillText("Angle: " + tankA.angle.toFixed(2), 20, 60);
    context.fillText("Force: " + tankA.force.toFixed(2), 20, 80);
    context.fillText(`Wind ${wind > 0 ? '>>>' : '<<<'} (${wind.toFixed(2)})`, 20, 120 );

}

const cpuPlay = (tank) => {
    // Initial prediction
    let endPoint = predict(tank);
    let dst = tank.enemy.position.dst2(endPoint);
    let bestDst = dst;
    let angle = tank.angle;
    let force = tank.force;
    let direction = tank.position.x - tank.enemy.position.x > 0 ? -1 : 1;
    let n = 3 + tank.enemy.score; // Dynamic difficulty
    for(let i = 1; i < n; ++i) {
        tank.force =  Math.random() * 30;
        tank.angle =  Math.random() * direction;
        endPoint = predict(tank /*, 20*/);
        dst = tank.enemy.position.dst2(endPoint);
        if(dst < bestDst) {
            bestDst = dst;
            angle = tank.angle;
            force = tank.force;
        }
    }
    
    tank.angle = angle;
    tank.force = force;

    // shoot the best shot
    fire(tank);
}

const updateBullet = (bullet) => {
    // Update forces
    bullet.velocity.y += GRAVITY;
    bullet.velocity.x += wind * 0.025 ;
    // Apply forces
    bullet.position.add(bullet.velocity);
    // Test collisions
    if(bullet.position.y + 2 >= HEIGHT) {
        return 1; // out of screen
    } else {
        const radius = TANK_SIZE * 0.5 + 2;
        if(new Vec2(bullet.position).sub(bullet.tgt.position).len2() < radius * radius) {
            return 2; // hit tgt
        } else if(checkCollision(bullet.position, 4, imageData)){
            return 0; // hit terrain
        }
    }

    return -1; // flying
}

const predict = (tank) => {

    const bullet = {
        tgt: tank.enemy,
        position: new Vec2(tank.position),
        velocity: new Vec2(0, tank.force).rotate(tank.angle + Math.PI)
    }
    for(let i = 0; ; ++i) { // simulate
        let state = updateBullet(bullet);
        if(state !== -1) {
            return new Vec2(bullet.position);
        }
    }

}

const nextTurn = ()=> {
    wind = 1 - Math.random() * 2;
    turn = (turn + 1) % 2;
}

const updateTank = (tank) => {

    if(!checkCollision(tank.position, TANK_SIZE, imageData)) {
        tank.velocity += GRAVITY;
        tank.position.y += tank.velocity;
        tank.onFloor = false;
    } else {
        tank.velocity = 0;
        tank.onFloor = true;
    }

    context.fillStyle = tank.color;
    
    context.save();
    context.translate(tank.position.x, tank.position.y)
    context.rotate(tank.angle + Math.PI);
    context.fillRect(-2, 0, 4, 22);
    context.restore();

    context.fillRect(tank.position.x - TANK_SIZE * 0.5, tank.position.y - TANK_SIZE * 0.5, TANK_SIZE, TANK_SIZE);

    if(tank.position.y > HEIGHT) {
        tank.enemy.score++;
        init();
    }

}

const createTerrain = (w, h, minY = h * 0.1, slope = 50, steps = 40) => {

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

const setRGB = (data, index, r, g, b) => {
    const i = index << 2;
    data[i    ] = r; // R
    data[i + 1] = g; // G
    data[i + 2] = b; // B
    data[i + 3] = 255; // A
}

const createPlayers = () => {

    tankA = {
        position: new Vec2(50, 0),
        velocity: 0,
        angle: 0.4,
        force: 10,
        color: "red",
        score: 0
    }
    
    tankB = {
        position: new Vec2(WIDTH - 50, 0),
        velocity: 0,
        angle: -0.4,
        force: 10,
        color: "blue",
        score: 0
    }

    tankB.enemy = tankA;
    tankA.enemy = tankB;

}

const init = ()=> {
    tankA.position.y = 0;
    tankA.velocity = 0;
    tankA.onFloor = false;
    tankA.angle = Math.random();

    tankB.position.y = 0;
    tankB.velocity = 0;
    tankB.onFloor = false;
    tankA.angle = Math.random();

    createTerrain(WIDTH, HEIGHT);
    turn = -1;
    nextTurn();
}

createPlayers();
init();

step();