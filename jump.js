var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const keys = []

document.addEventListener('keydown', (event) => {
    const keyName = event.key.toLowerCase();
    console.log(keyName)

    if (keyName == 'arrowdown') {
        areaIndex -= 1
    }
    
    if (keyName == 'arrowup') {
        areaIndex += 1
    }

    if (keyName == 'enter') {
        var dimensions = []

        for (let i = 0; i < areas.length; i++) {
            const ar = areas[i]
            for (let e = 0; e < ar.obstacles.length; e++) {
                const ob = ar.obstacles[e]
                dimensions.push([ob.areaIndex, ob.x, ob.y, ob.width, ob.height])
                
            }
        }

        console.log(dimensions)
    }

    if (!keys.includes(keyName)) {
        keys.push(keyName);
    }

    // if (keyName == ' ') {
    //     player.chargeJump()
    // }

})


document.addEventListener('keyup', (event) => {
    const keyName = event.key.toLowerCase();

    if (keys.includes(keyName)) {
        const index = keys.indexOf(keyName);
        keys.splice(index, 1);
    }

    if (keyName == ' ') {
        // console.log('release')

        if (keys.includes('a') || keys.includes('arrowleft')) {
            var direction = -7.5
        } 
        else if (keys.includes('d') || keys.includes('arrowright')) {
            var direction = 7.5
        } else {
            var direction = 0
        }

        player.jump(direction)
    }

})



class Player {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.width = 40
        this.height = 40

        this.charge = 0
        this.maxCharge = 40
        this.vy = 0
        this.vx = 0
        this.airborn = true
        this.slipping = false
        this.jumps = 1
    }

    chargeJump() {
        if (this.charge < this.maxCharge) {
            this.charge += 1
        } else {
            this.charge = this.maxCharge

            if (keys.includes('a') || keys.includes('arrowleft')) {
                var direction = -7.5
            } 
            else if (keys.includes('d') || keys.includes('arrowright')) {
                var direction = 7.5
            } else {
                var direction = 0
            }
    
            player.jump(direction)
        }
    }

    jump(direction) {
        if (this.jumps > 0) {
            this.jumps -= 1
            this.airborn = true
            this.vy = -this.charge / 1.6
            this.vx = direction
            this.charge = 0
        }
    }

    fall() {
        this.vy += 1
        if (this.airborn) {
            this.move(0, this.vy)
            this.move(this.vx, 0)
        }
    }

    land() {
        this.airborn = false
        this.slipping = false
        this.vy = 0
        this.vx = 0
        this.jumps = 1
    }

    move(xMove, yMove) {
        this.x += xMove
        this.y += yMove

        this.collide(areas[areaIndex].obstacles, areas[areaIndex].slopes, xMove, yMove)
    }

    collide(obstacles, slopes, xMove, yMove) {
        for (let i = 0; i < obstacles.length; i++) {
            const o = obstacles[i];
            if (this.x + this.width > o.x && this.x < o.x + o.width) {
                if (this.y + this.height > o.y && this.y < o.y + o.height) {

                    if (xMove > 0) {
                        this.x = o.x - this.width
                        this.vx *= -0.5

                    } else if (xMove < 0) {
                        this.x = o.x + o.width
                        this.vx *= -0.5
                    }

                    if (yMove > 0) {
                        this.y = o.y - this.height
                        this.land()

                    } else if (yMove < 0) {
                        this.y = o.y + o.height
                        this.vy = 0
                    }

                }
            }
        }

        for (let i = 0; i < slopes.length; i++) {
            const s = slopes[i];
            if (s.dir > 0) {
                if (this.x + this.width > s.x && this.x < s.x + s.width) {
                    if (this.y + this.height > s.y - s.height && this.y < s.y) {
                        let fx = (this.x + this.width - s.x) / s.width
                        let fy = 1 - ((this.y + this.height - s.y) / -s.height)
                        // console.log(fx, fy)

                        if ((fx + fy) > 1 && fx < 1.01 && fy < 1.01) {

                            if (!this.slipping) {
                                this.vx *= 0.5
                            }

                            this.vx -= 0.3
                            this.vy = 1
                            this.slipping = true
                            this.y = s.y - fx * s.height - this.height
                            this.airborn = true
                        }
                    }
                }

            } else if (s.dir < 0) {
                if (this.x + this.width > s.x + s.width && this.x < s.x) {
                    if (this.y + this.height > s.y - s.height && this.y < s.y) {
                        let fx = (this.x - s.x) / s.width
                        let fy = 1 - ((this.y + this.height - s.y) / -s.height)
                        // console.log(fx, fy)

                        if ((fx + fy) > 1 && fx < 1.01 && fy < 1.01) {

                            if (!this.slipping) {
                                this.vx *= 0.5
                            }

                            this.vx += 0.3
                            this.vy = 1
                            this.slipping = true
                            this.y = s.y - fx * s.height - this.height
                            this.airborn = true
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'white'

        if (this.charge > 0) {
            var height = this.height / 2
            var y = this.y + height
        } else {
            var height = this.height
            var y = this.y
        }

        ctx.fillRect(this.x, y, this.width, height);
    }
}



const areas = []
var areaIndex = 0

class Area {
    constructor(number) {
        areas.push(this)
        this.number = number
        this.obstacles = []
        this.slopes = []
    }
}


class Obstacle {
    constructor(areaIndex, x, y, width, height) {
        areas[areaIndex].obstacles.push(this)
        this.areaIndex = areaIndex

        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'red'
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Slope {
    constructor(areaIndex, x, y, width, height) {
        areas[areaIndex].slopes.push(this)
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        
        this.dir = width / Math.abs(width)
        this.points = [[x, y], [x + width, y], [x + width, y - height]]
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.points[0][0], this.points[0][1])
        ctx.lineTo(this.points[1][0], this.points[1][1])
        ctx.lineTo(this.points[2][0], this.points[2][1])
        ctx.lineTo(this.points[0][0], this.points[0][1])
        ctx.fill()
    }
}






const player = new Player(100, 400)

new Area(0)
new Area(1)
new Area(2)

// new Obstacle(0, 300, 300, 100, 100)
new Obstacle(0, 100, 200, 100, 30)
// new Obstacle(0, 300, 470, 100, 100)

new Slope(0, 200, 470, -100, 100)
new Slope(0, 300, 470, 100, 100)

new Obstacle(0, 0, 570, 600, 30)
new Obstacle(0, 0, 0, 30, 570)
new Obstacle(0, 570, 0, 30, 570)


new Obstacle(1, 0, 0, 30, 600)
new Obstacle(1, 570, 0, 30, 600)
new Obstacle(1, 500, 570, 70, 30)


function drawWindow() {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw(ctx)

    for (let i = 0; i < areas[areaIndex].obstacles.length; i++) {
        areas[areaIndex].obstacles[i].draw(ctx)
    }

    for (let i = 0; i < areas[areaIndex].slopes.length; i++) {
        areas[areaIndex].slopes[i].draw(ctx)
    }

}


function loop() {

    if (!player.airborn && player.charge == 0) {
        player.vx = 0

        if (keys.includes('a') || keys.includes('arrowleft') && player.charge == 0) {
            player.airborn = true
            player.move(-4, 0)
            player.vx = -3.5
        }

        if (keys.includes('d') || keys.includes('arrowright') && player.charge == 0) {
            player.airborn = true
            player.move(4, 0)
            player.vx = 3.5
        }
    }


    if (keys.includes('j')) {
        player.move(-1, 0)
    }
    if (keys.includes('l')) {
        player.move(1, 0)
    }
    if (keys.includes('k')) {
        player.move(0, 1)
    }
    if (keys.includes('i')) {
        player.move(0, -1)
    }


    // if (player.slipping) {
    //     player.vx -= 0.3
    // }

    if (player.airborn) {
        player.fall()
    }

    if (keys.includes(' ') && !player.airborn) {
        player.chargeJump()
    }


    if (player.y > 600) {
        player.y -= 600
        areaIndex -= 1
    }
    
    if (player.y < 0) {
        player.y += 600
        areaIndex += 1
    }
    
    console.log(player.vx, player.airborn)

    drawWindow();
    
    window.requestAnimationFrame(loop);
    
  }
  
window.requestAnimationFrame(loop);