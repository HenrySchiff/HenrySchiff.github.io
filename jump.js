var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const keys = []

document.addEventListener('keydown', (event) => {
    const keyName = event.key.toLowerCase();
    // console.log(keyName)

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

        if (keys.includes('a')) {
            direction = -((player.charge / 1.6) ** 1/3)
        } 
        else if (keys.includes('d')) {
            direction = (player.charge / 1.6) ** 1/3
        } else {
            direction = 0
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
        this.jumps = 1
    }

    chargeJump() {
        if (this.charge < this.maxCharge) {
            this.charge += 1
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
        this.vy = 0
        this.vx = 0
        this.jumps = 1
    }

    move(xMove, yMove) {
        this.x += xMove
        this.y += yMove

        this.collide(areas[areaIndex].obstacles, xMove, yMove)
    }

    collide(obstacles, xMove, yMove) {
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
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'blue'
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}



const areas = []
var areaIndex = 0

class Area {
    constructor(number) {
        areas.push(this)
        this.number = number
        this.obstacles = []
    }
}


class Obstacle {
    constructor(areaIndex, x, y, width, height) {
        areas[areaIndex].obstacles.push(this)
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






const player = new Player(100, 100)

new Area(0)
new Area(1)
new Area(2)

new Obstacle(0, 300, 300, 100, 100)
new Obstacle(0, 100, 200, 100, 30)

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

}


function loop() {

    if (!player.airborn && player.charge == 0) {
        if (keys.includes('a')) {
            player.airborn = true
            player.move(-4, 0)
        }

        if (keys.includes('d')) {
            player.airborn = true
            player.move(4, 0)
        }
    }
    // if (keys.includes('a')) {
    //     player.move(-6, 0)
    // }

    // if (keys.includes('d')) {
    //     player.move(6, 0)
    // }

    // if (keys.includes('w')) {
    //     player.move(0, -6)
    // }

    // if (keys.includes('s')) {
    //     player.move(0, 6)
    // }

    if (keys.includes(' ')) {
        player.chargeJump()
        // console.log(player.charge)
    }

    if (player.airborn) {
        player.fall()
    }


    if (player.y > 600) {
        player.y -= 600
        areaIndex -= 1
        console.log('sub')
    }
    
    if (player.y < 0) {
        player.y += 600
        areaIndex += 1
        console.log('add')
    }
    
    drawWindow();
    
    window.requestAnimationFrame(loop);
    
  }
  
window.requestAnimationFrame(loop);