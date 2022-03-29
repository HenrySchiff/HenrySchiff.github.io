var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function getDistance(p1, p2) {
    return ((p2[0] - p1[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5
}

function segmentIntersection(line_1s, line_1e, line_2s, line_2e) {
    let h = (line_2e[0] - line_2s[0]) * (line_1s[1] - line_1e[1]) - (line_1s[0] - line_1e[0]) * (line_2e[1] - line_2s[1])
    if (h != 0) {
        let t1 = ((line_2s[1] - line_2e[1]) * (line_1s[0] - line_2s[0]) + (line_2e[0] - line_2s[0]) * (line_1s[1] - line_2s[1])) / h
        let t2 = ((line_1s[1] - line_1e[1]) * (line_1s[0] - line_2s[0]) + (line_1e[0] - line_1s[0]) * (line_1s[1] - line_2s[1])) / h
        
        if (t1 >= 0 && t1 < 1 && t2 >= 0 && t2 < 1) {
            return true

        } else {
            return false
        }
        
    } else {
    	/* console.log('parallel or collinear') */
        return
    }
}


const keys = []
var pause = false

document.addEventListener('keydown', (event) => {
    const keyName = event.key.toLowerCase();
    console.log(keyName)

    if (!keys.includes(keyName)) {
        keys.push(keyName);
    }

    if (keys.includes('p')) {
        pause = !pause
    }
})


document.addEventListener('keyup', (event) => {
    const keyName = event.key.toLowerCase();

    if (keys.includes(keyName)) {
        const index = keys.indexOf(keyName);
        keys.splice(index, 1);
    }
})


class Snake {
	constructor(x, y, angle) {
    	this.x = x
        this.y = y
        this.angle = angle
        this.speed = 2
        
        this.color = 'red'
        this.headLength = 10
        this.head = [[this.x, this.y], [this.x + Math.cos(this.angle) * this.headLength, this.y + Math.sin(this.angle) * this.headLength]]
        this.trail = []
        this.trailLength = 5
        this.segmentLength = 10
        this.currentLength = 0
    }
    
    move() {
    	let dx = Math.cos(this.angle) * this.speed
        let dy = Math.sin(this.angle) * this.speed
        this.x += dx; this.y += dy
        
        this.head = [[this.x, this.y], [this.x + Math.cos(this.angle) * this.headLength, this.y + Math.sin(this.angle) * this.headLength]]
        
        if (this.currentLength < this.segmentLength) {
        	this.currentLength += 1
        } else {
        	this.trail.push([this.x, this.y])
        	this.currentLength = 0
            if (this.trail.length > this.trailLength) {
				this.trail.splice(0, 1)
        	}            	
        }
    }
    
    rotate(amount) {
    	this.angle += amount
    }

    checkCollision(borders, apples) {
        this.color = 'red'
        
        for (var i = 0; i < apples.length; i ++) {
            var distance = getDistance(this.head[0], [apples[i].x, apples[i].y])
            console.log(distance)
            if (distance < this.headLength + apples[i].radius) {
                apples[i].eat()
                this.trailLength += 1
                break
            }
        }
        
        for (var i = 0; i < borders.length; i++) {
        	var border = borders[i]
            var intersection = segmentIntersection(this.head[0], this.head[1], border[0], border[1])
            if (intersection) {
                this.color = 'yellow'
                console.log('hit')
                return
            }
        }
        
        for (var i = 0; i < this.trail.length - 1; i++) {
            var line = [this.trail[i], this.trail[i + 1]];
            var intersection = segmentIntersection(this.head[0], this.head[1], line[0], line[1])
            if (intersection) {
                this.color = 'yellow'
                console.log('hit')
                return
            }
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.head[0][0], this.head[0][1]);
        ctx.lineTo(this.head[1][0], this.head[1][1]);
        ctx.stroke();
        
        for (var i = 0; i < this.trail.length - 1; i++) {
        	let p1 = this.trail[i]; let p2 = this.trail[i + 1]
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'white';
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(p1[0], p1[1], 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
        }
        
        if (this.trail.length > 0) {
        	let closestTrail = this.trail[this.trail.length - 1]
        	
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'white';
            ctx.moveTo(closestTrail[0], closestTrail[1]);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(closestTrail[0], closestTrail[1], 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
    }
}


const apples = []

class Apple {
	constructor(x, y) {
    	apples.push(this)
    	this.x = x
        this.y = y
        this.radius = 7
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
    
    eat() {
    	let index = apples.indexOf(this)
        apples.splice(index, 1)
        let x = Math.floor(Math.random() * canvas.width)
        let y = Math.floor(Math.random() * canvas.height)
        new Apple(x, y)
    }
}



function getMousePos(canvas, evt) {
    var border = 5
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left - border,
      y: evt.clientY - rect.top - border
    };
}


var x = Math.floor(Math.random() * canvas.width)
var y = Math.floor(Math.random() * canvas.height)
new Apple(x, y)

const snake = new Snake(200, 200, 0)

const buffer = 10
const borders = [
	[[buffer, buffer], [canvas.width - buffer, buffer]], 
    [[canvas.width - buffer, buffer], [canvas.width - buffer, canvas.height - buffer]],
    [[canvas.width - buffer, canvas.height - buffer], [buffer, canvas.height - buffer]], 
    [[buffer, canvas.height - buffer], [buffer, buffer]]
]


function drawWindow() {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (var i = 0; i < borders.length; i ++) {
    	b = borders[i]
    	ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.moveTo(b[0][0], b[0][1]);
        ctx.lineTo(b[1][0], b[1][1]);
        ctx.stroke();
    }
    
    for (var i = 0; i < apples.length; i ++) {
    	apples[i].draw()
    }
    
    snake.draw()

}


var count = 0
function loop() {
    if (!pause){
        snake.move()
        snake.checkCollision(borders, apples)
    }
    
    if (keys.includes('arrowright') || keys.includes('d')) {
    	snake.rotate(0.07)
    }
    if (keys.includes('arrowleft') || keys.includes('a')) {
    	snake.rotate(-0.07)
    }

    drawWindow();
    
    if (count < 2000) {
    window.requestAnimationFrame(loop);
    // count += 1
    }
    
  }
  
window.requestAnimationFrame(loop);