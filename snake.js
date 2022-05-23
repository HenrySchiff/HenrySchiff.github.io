var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const pi = 3.1415926

function getDistance(p1, p2) {
    return ((p2[0] - p1[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5
}

function getAngle(p1, p2) {
	return Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
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



const resetButton = document.getElementById('resetButton')
const scoreDisplay = document.getElementById('scoreDisplay')


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
        this.dead = false
        
        this.color = 'red'
        this.headLength = 10
        this.head = [[this.x, this.y], [this.x + Math.cos(this.angle) * this.headLength, this.y + Math.sin(this.angle) * this.headLength]]
        this.trail = []
        this.trailLength = 15
        this.segmentLength = 5
        this.currentLength = 0

        this.hitSegment = undefined
        
        scoreDisplay.innerHTML = 'Score ' + this.trailLength.toString()
    }
    
    move() {
    	let dx = Math.cos(this.angle) * this.speed
        let dy = Math.sin(this.angle) * this.speed
        this.x += dx; this.y += dy
        
        this.head = [[this.x, this.y], [this.x + Math.cos(this.angle) * this.headLength, this.y + Math.sin(this.angle) * this.headLength]]
        
        if (this.currentLength < this.segmentLength) {
        	this.currentLength += this.speed
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
            if (distance < this.headLength + apples[i].radius) {
                apples[i].eat()
                this.trailLength += 3
                scoreDisplay.innerHTML = 'Score ' + this.trailLength.toString()
                break
            }
        }
        
        for (var i = 0; i < borders.length; i++) {
        	var border = borders[i]
            var intersection = segmentIntersection(this.head[0], this.head[1], border[0], border[1])
            if (intersection) {
                this.color = 'yellow'
                this.dead = true
                console.log('hit')
                return
            }
        }
        
        for (var i = 0; i < this.trail.length - 2; i++) {
            var line = [this.trail[i], this.trail[i + 1]];
            var intersection = segmentIntersection(this.head[0], this.head[1], line[0], line[1])
            if (intersection) {
                this.color = 'yellow'
                this.dead = true
                this.hitSegment = i
                console.log('hit')
                return
            }
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.head[0][0], this.head[0][1]);
        ctx.lineTo(this.head[1][0], this.head[1][1]);
        ctx.stroke();
        
        let colors = ['yellow', 'red']
        let index = 0

        for (var i = 1; i < this.trail.length - 1; i++) {
        	let p1 = this.trail[i]; let p2 = this.trail[i + 1]
            ctx.beginPath();
            // ctx.lineWidth = 10;
            ctx.lineWidth = 2
            // ctx.strokeStyle = 'white';
            ctx.strokeStyle = colors[index]

            if (i == this.hitSegment) {
                ctx.strokeStyle = 'blue'
            }

            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();

            index += 1
            index %= 2
            
            // ctx.beginPath();
            // ctx.arc(p1[0], p1[1], 5, 0, 2 * Math.PI, false);
            // ctx.fillStyle = 'white';
            // ctx.fill();
        
        }
        
        if (this.trail.length > 0) {
        	let closestTrail = this.trail[this.trail.length - 1]
        	
            // ctx.beginPath();
            // ctx.lineWidth = 10;
            // ctx.strokeStyle = 'white';
            // ctx.moveTo(closestTrail[0], closestTrail[1]);
            // ctx.lineTo(this.x, this.y);
            // ctx.stroke();
            
            // ctx.beginPath();
            // ctx.arc(closestTrail[0], closestTrail[1], 5, 0, 2 * Math.PI, false);
            // ctx.fillStyle = 'white';
            // ctx.fill();
        }
        
        if (this.trail.length > 1) {
            let tail = this.trail[0]
            let angle = getAngle(this.trail[1], tail)
            let length = this.segmentLength - this.currentLength
            let x = Math.cos(angle) * length + this.trail[1][0]
            let y = Math.sin(angle) * length + this.trail[1][1]

            // ctx.beginPath();
            // ctx.lineWidth = 10;
            // ctx.strokeStyle = 'white';
            // ctx.moveTo(this.trail[1][0], this.trail[1][1]);
            // ctx.lineTo(x, y);
            // ctx.stroke();
            
            // ctx.beginPath();
            // ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
            // ctx.fillStyle = 'white';
            // ctx.fill();
       	}
        
    }

    
    reset() {
        this.dead = false
        this.hitSegment = undefined
        this.trail = []
        this.trailLength = 15
        this.currentLength = 0
        this.angle = 0
        this.x = 200; this.y = 200
        
        scoreDisplay.innerHTML = 'Score ' + this.trailLength.toString()
    }
}


const apples = []

class Apple {
	constructor(x, y, buffer) {
    	apples.push(this)
    	this.x = x
        this.y = y
        this.radius = 7
        this.buffer = buffer
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
        let x = 25 + Math.random() * (canvas.width - 50)
        let y = 25 + Math.random() * (canvas.height - 50)
        // let x = Math.floor(Math.random() * (canvas.width))
        // let y = Math.floor(Math.random() * (canvas.height))
        console.log(x, y)
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

const snake = new Snake(200, 200, 0)

const buffer = 10
const borders = [
	[[buffer, buffer], [canvas.width - buffer, buffer]], 
    [[canvas.width - buffer, buffer], [canvas.width - buffer, canvas.height - buffer]],
    [[canvas.width - buffer, canvas.height - buffer], [buffer, canvas.height - buffer]], 
    [[buffer, canvas.height - buffer], [buffer, buffer]]
]


let x = 25 + Math.random() * (canvas.width - 50)
let y = 25 + Math.random() * (canvas.height - 50)
new Apple(x, y, buffer)


resetButton.addEventListener('click', (event) => {snake.reset()})


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
    
        window.setInterval(function() {

        if (!pause && !snake.dead){
            snake.move()
            snake.checkCollision(borders, apples)
        }
        
        if (keys.includes('arrowright') || keys.includes('d')) {
            snake.rotate(0.07)
        }
        if (keys.includes('arrowleft') || keys.includes('a')) {
            snake.rotate(-0.07)
        }
        if (keys.includes('arrowup') || keys.includes('w')) {
            snake.speed = 4
        } else {
            snake.speed = 2
        }

        drawWindow();
        
        // if (count < 2000) {
        // window.requestAnimationFrame(loop);
        // // count += 1
        // }

    }, 1000 / 60);
    
  }
  
loop()

// window.requestAnimationFrame(loop);