var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function getDistance(p1, p2) {
    return ((p2.x - p1.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5
}


const bounce = 0.9;
const gravity = 0.5;
// const gravity = 0.1;
const friction = 0.99;


colors = [
    [236,14,71,1.00],
    [238,108,59,1.00],
    [252,191,84,1.00],
    [171,217,109,1.00],
    [20,194,133,1.00],
    [7,115,82,1.00],
    [9,74,99,1.00],
    [2,43,121,1.00],
    [113,3,100,1.00],
    [160,44,93,1.00]
]


function listToString(list) {
    var string = 'rgba(';
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        element.toString();
        string += element

        if (i != list.length - 1) {
            string += ', ';
        }
    }

    string += ')';
    return string
}


const particles = [];

class Particle {
    constructor(x, y, fixed, weight){
        particles.push(this);
        this.x = x;
        this.y = y;
        this.ox = x; this.oy = y;

        this.weight = weight
        this.fixed = fixed;
        this.radius = 5;
        this.colors = ['black'];
        this.colorIndex = 0;
    }

    draw() {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = listToString(this.colors[this.colorIndex]);
        ctx.fill();
    }

    drawText() {
        var xText = 275;
        if (score > 9) {
            xText -= 30;
        }
        if (score > 99) {
            xText -= 30;
        }
        var lowerAlpha = [...this.colors[this.colorIndex]];
        lowerAlpha[3] -= 0.5;
        ctx.font = '100px arial';
        // ctx.strokeStyle = listToString(lowerAlpha);
        // ctx.strokeText(score, 300, 300);
        ctx.fillStyle = listToString(lowerAlpha);
        ctx.fillText(score, xText, 325);
    }
}


const lines = [];

class Line {
    constructor(p1, p2) {
        lines.push(this);
        this.points = [p1, p2]
        this.p1 = p1;
        this.p2 = p2;
        this.length = getDistance(p1, p2);
    }

    draw() {
        var ctx = canvas.getContext('2d')
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
    }
}


const ripples = [];

class Ripple {
    constructor(x, y, particle, color, children) {
        ripples.push(this);
        this.x = x;
        this.y = y;
        this.source = particle
        this.originalColor = [...color]
        this.color = [...color];
        this.children = children;

        this.delay = 10;
        this.radius = 20;
        this.maxRadius = 600;
    }

    tick() {
        this.radius += 6;
        // this.x = this.source.x; this.y = this.source.y;
        if (this.radius > this.maxRadius) {
            ripples.splice(ripples.indexOf(this), 1);
        }


        this.color[3] -= 0.04;


        if (this.delay > 0 ) {
            this.delay -= 1;
        } else {
            if (this.children > 0) {
                new Ripple(this.source.x, this.source.y, this.source, this.originalColor, 0);
                this.children -= 1;
                this.delay = 10;
            }
        }

    }

    draw() {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.strokeStyle = listToString(this.color);
        ctx.lineWidth = 5;
        ctx.stroke();
        // ctx.fillStyle = this.colors[this.colorIndex];
        // ctx.fill();
    }
}



function updateParticles() {
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (!p.fixed) {
            var vx = (p.x - p.ox) * friction; 
            var vy = (p.y - p.oy) * friction; 

            p.ox = p.x;
            p.oy = p.y;
            p.x += vx;
            p.y += vy;
            p.y += gravity * p.weight;

        }
    }
}


function updateLines() {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dx = line.p2.x - line.p1.x;
        const dy = line.p2.y - line.p1.y;
        const distance = getDistance(line.p1, line.p2);
        const difference = line.length - distance;
        const percent = difference / distance / 2;
        const offsetX = dx * percent
        const offsetY = dy * percent
        
        if (!line.p1.fixed){
            line.p1.x -= offsetX; line.p1.y -= offsetY;
        }
        
        if (!line.p2.fixed){
            line.p2.x += offsetX; line.p2.y += offsetY;
        }
    }
}



// const p1 = new Particle(120, 30, true);
// var p2 = new Particle(140, 150, false);
// var l1 = new Line(p1, p2)


const length = 275;
const segments = 15;
const divisions = length / segments;

for (let i = 0; i < segments; i++) {
    new Particle(200, i * divisions, false, 1);
}

for (let i = 0; i < particles.length - 1; i++) {
    new Line(particles[i], particles[i + 1]);
}

rope = particles[0]; ball = particles[particles.length - 1];
rope.color = 'red'; rope.fixed = true;
ball.radius = 20; ball.colors = colors; ball.weight = 1.5; 


const keys = [];

document.addEventListener('keydown', (event) => {
    const keyName = event.key.toLowerCase();

    if (!keys.includes(keyName)) {
        keys.push(keyName);
    }

    if (keys.includes(' ')) {
        ball.colorIndex += 1;
        ball.colorIndex %= ball.colors.length;
        new Ripple(ball.x, ball.y, ball, ball.colors[ball.colorIndex], 2)
        score += 1
    }

    console.log(keys);

})

document.addEventListener('keyup', (event) => {
    const keyName = event.key.toLowerCase();

    if (keys.includes(keyName)) {
        const index = keys.indexOf(keyName);
        keys.splice(index, 1);
    }

    // console.log(keys);
  
})



function getMousePos(canvas, evt) {
    var border = 5
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left - border,
      y: evt.clientY - rect.top - border
    };
}


var mouse_pos = {x: rope.x, y: rope.y};

document.addEventListener('mousemove', (event) => {
    const pos = getMousePos(canvas, event);
    rope.x = pos.x; rope.y = pos.y;
    // console.log(pos);
    mouse_pos = pos;
})

var score = 0;

document.addEventListener('mousedown', (event) => {
    const distance = getDistance(mouse_pos, ball);
    if (distance < ball.radius + 5) {
        ball.colorIndex += 1;
        ball.colorIndex %= ball.colors.length;
        new Ripple(ball.x, ball.y, ball, ball.colors[ball.colorIndex], 2)
        score += 1;
    }
    console.log(distance);
})



function drawWindow() {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ball.drawText()

    for (var i = 0; i < lines.length; i++) {
        lines[i].draw();
    }

    for (let i = 0; i < ripples.length; i++) {
        ripples[i].draw();
    }


    // for (var i = 0; i < particles.length; i++) {
    //     particles[i].draw();
    // }
    ball.draw();

    // for (let index = 0; index < colors.length; index++) {
    //     const element = colors[index];
        
    //     ctx.beginPath();
    //     ctx.arc(index * 30, 30, 10, 0, 2 * Math.PI, false);
    //     ctx.fillStyle = element;
    //     ctx.fill();   
    // }

}


var count = 0
function loop() {

    updateParticles();
    for (let i = 0; i < 5; i++) {
        updateLines();
    }

    for (let i = 0; i < ripples.length; i++) {
        ripples[i].tick();
    }

    drawWindow();

    // console.log(mouse_pos)

    if (count < 100) {
        window.requestAnimationFrame(loop);
        // count += 1;
    }
  }
  
window.requestAnimationFrame(loop);
