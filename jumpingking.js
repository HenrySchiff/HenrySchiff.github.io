var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var imageCanvas = document.getElementById('imagecanvas')
var imagectx = imageCanvas.getContext('2d')

var jumpSound = new Audio('boing.mp3')


var img = new Image();
var dataGathered = false
img.onload = function(){
    console.log('load')
    imageCanvas.width = img.width;
    imageCanvas.height = img.height;
    imagectx.drawImage(img, 0, 0, img.width, img.height);
}
img.src = 'level.png';


const imgData = imagectx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
const data = imgData.data

console.log(data)

// enumerate all pixels
// each pixel's r,g,b,a datum are stored in separate sequential array elements

for(let i = 0; i < data.length; i += 4) {
  const red = data[i];
  const green = data[i + 1];
  const blue = data[i + 2];
  const alpha = data[i + 3];
}




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

        if (keys.includes('a') || keys.includes('arrowleft')) {
            var direction = -0.6
        } 
        else if (keys.includes('d') || keys.includes('arrowright')) {
            var direction = 0.6
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
        this.width = 2
        this.height = 2

        this.charge = 0
        this.maxCharge = 5.5
        this.vy = 0
        this.vx = 0
        this.airborn = true
        this.jumps = 1
    }

    chargeJump() {
        if (this.charge < this.maxCharge) {
            this.charge += 0.5
        } else {
            this.charge = this.maxCharge

            if (keys.includes('a') || keys.includes('arrowleft')) {
                var direction = -0.6
            } 
            else if (keys.includes('d') || keys.includes('arrowright')) {
                var direction = 0.6
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
            this.vy = -this.charge / 3
            this.vx = direction
            this.charge = 0
            jumpSound.play()
        }
    }

    fall() {
        this.vy += 1 * 0.026 * 8
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
        console.log('land air', this.airborn)
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
        ctx.fillStyle = 'white'

        if (this.charge > 0) {
            var y = this.y + 1
            var height = this.height /2
        } else {
            var y = this.y
            var height = this.height
        }

        ctx.fillRect(this.x, y, this.width, height);
    }
}



const areas = []
const areaColors = ['red', 'orange', 'yellow', 'green', 'darkturquoise']
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
        ctx.fillStyle = areaColors[areaIndex]
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}






const player = new Player(4, 13)

new Area(0)
new Area(1)
new Area(2)
new Area(3)
new Area(4)
new Area(5)


borderWidth = 2

//AREA 0
new Obstacle(0, 0, 16 - borderWidth, 16, borderWidth)
new Obstacle(0, 0, 0, borderWidth, 16 - borderWidth)
new Obstacle(0, 16 - borderWidth, 0, borderWidth, 16 - borderWidth)

new Obstacle(0, 2, 4, 4, 2)
new Obstacle(0, 10, 9, 4, 2)

//AREA 1
new Obstacle(1, 0, 0, borderWidth, 16)
new Obstacle(1, 16 - borderWidth, 0, borderWidth, 16)

new Obstacle(1, 2, 3, 1, 3)
new Obstacle(1, 6, 7, 4, 2)
new Obstacle(1, 10, 14, 4, 2)

//AREA 2
new Obstacle(2, 0, 0, borderWidth, 16)
new Obstacle(2, 16 - borderWidth, 0, borderWidth, 16)

new Obstacle(2, 2, 5, 4, 1)
new Obstacle(2, 5, 12, 1, 4)
new Obstacle(2, 10, 10, 4, 1)

new Obstacle(2, 10, 3, 1, 1)
new Obstacle(2, 11, 2, 1, 2)
new Obstacle(2, 12, 1, 1, 3)
new Obstacle(2, 13, 1, 1, 3)

//AREA 3
new Obstacle(3, 0, 0, borderWidth, 16)
new Obstacle(3, 16 - borderWidth, 0, borderWidth, 16)

new Obstacle(3, 2, 5, 1, 3)
// new Obstacle(3, 2, 8, 1, 3)
new Obstacle(3, 13, 5, 1, 3)
new Obstacle(3, 7, 0, 2, 1)
// new Obstacle(3, 7, 5, 2, 2)
new Obstacle(3, 7, 11, 2, 3)
new Obstacle(3, 9, 11, 2, 1)

//AREA 4
new Obstacle(4, 0, 0, borderWidth, 16)
new Obstacle(4, 16 - borderWidth, 0, borderWidth, 16)

new Obstacle(4, 7, 0, 2, 16)
new Obstacle(4, 6, 6, 4, 1)
new Obstacle(4, 6, 13, 4, 1)
new Obstacle(4, 2, 8, 1, 3)
new Obstacle(4, 13, 8, 1, 3)


function setFavicon() {
    var favicon = document.getElementById("favicon");
    //var newIcon = favicon.cloneNode(true);
    //newIcon.setAttribute("href", canvas.toDataURL());
    //favicon.parentNode.replaceChild(newIcon, favicon);
    favicon.setAttribute("href", canvas.toDataURL());
    history.replaceState(null, null, window.location.hash == "#1" ? "#0" : "#1");
}


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
    
    window.setInterval(function() {
    
        if (!player.airborn && player.charge == 0) {
            player.vx = 0

            if (keys.includes('a') || keys.includes('arrowleft') && player.charge == 0) {
                player.airborn = true
                player.move(-4 * 0.026 * 6, 0)
                console.log('air', player.airborn)
                player.vx = -0.3
            }

            if (keys.includes('d') || keys.includes('arrowright') && player.charge == 0) {
                player.airborn = true
                player.move(4 * 0.026 * 6, 0)
                console.log('air', player.airborn)
                player.vx = 0.3
            }
        }


        if (player.airborn) {
            player.fall()
        }
        

        if (keys.includes(' ') && !player.airborn) {
            player.chargeJump()
            // console.log(player.charge)
        }



        if (player.y > 16) {
            player.y -= 16
            areaIndex -= 1
            console.log('sub')
        }
        
        if (player.y < 0) {
            player.y += 16
            areaIndex += 1
            console.log('add')
        }

        
        
        setFavicon();
        drawWindow();
        
    }, 1000 / 15);
    
  }
  

loop()