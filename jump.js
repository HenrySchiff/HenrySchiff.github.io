const dimensions = [["o",0,120,200,120,40,[255,0,0]],["o",0,0,560,600,40,[255,0,0]],["o",0,0,0,40,560,[255,0,0]],["o",0,560,0,40,560,[255,0,0]],["o",0,380,-100,20,20,[255,0,0]],["s",0,1100,-20,20,20,[255,203,31]],["s",0,300,160,180,140,[147,27,191]]]



var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


var colorIndex = 0
var colors = [
    [255, 0, 0],
    [219, 129, 20],
    [255, 203, 31],
    [23, 173, 38],
    [0, 0, 255],
    [147, 27, 191]
]


function getTint(color, amount) {
    var tint = [...color]

    for (let i = 0; i < tint.length; i++) {
        if (tint[i] <= amount) {
            tint[i] += amount
        } else {
            tint[i] = 255
        }
    }

    return 'rgb(' + tint[0] + ',' + tint[1] + ',' + tint[2] + ')' 

} 

function getShade(color, amount) {
    var shade = [...color]

    for (let i = 0; i < shade.length; i++) {
        if (shade[i] >= amount) {
            shade[i] -= amount
        } else {
            shade[i] = 0
        }
    }

    return 'rgb(' + shade[0] + ',' + shade[1] + ',' + shade[2] + ')' 

} 

function listToString(list) {
    var string = '['
    for (let i = 0; i < list.length; i++) {
        const element = list[i]
        element.toString()
        string += element

        if (i != list.length - 1) {
            string += ','
        }
    }

    string += ']'
    return string
}

function listToString2(list) {
    var string = ''
    for (let i = 0; i < list.length; i++) {
        const element = list[i]
        element.toString()
        string += element

        if (i != list.length - 1) {
            string += ','
        }
    }

    return string
}


const keys = []

document.addEventListener('keydown', (event) => {
    const keyName = event.key.toLowerCase();
    console.log(keyName)

    if (keyName == 'arrowdown' && areaIndex != 0) {
        areaIndex -= 1
    }
    
    if (keyName == 'arrowup' && areaIndex != areas.length - 1) {
        areaIndex += 1
    }


    if (keyName == 'e') {
        mode = Obstacle
    }

    if (keyName == 's') {
        mode = Slope
    }

    if (keyName == 'g') {
        grid = !grid
    }



    if (keyName == 'enter') {
        var dim = []

        for (let i = 0; i < areas.length; i++) {
            const ar = areas[i]
            for (let e = 0; e < ar.obstacles.length; e++) {
                const ob = ar.obstacles[e]
                dim.push(['o', ob.areaIndex, ob.x, ob.y, ob.width, ob.height, ob.rawColor])
            }
            for (let e = 0; e < ar.slopes.length; e++) {
                const sl = ar.slopes[e]
                dim.push(['s', sl.areaIndex, sl.x, sl.y - sl.height, sl.width, sl.height, sl.rawColor])
            }
        }

        console.log(dim)
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
            var direction = -8
        } 
        else if (keys.includes('d') || keys.includes('arrowright')) {
            var direction = 8
        } else {
            var direction = 0
        }

        player.jump(direction)
    }

})



function getMousePos(canvas, evt) {
    var border = 5
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left - border,
      y: evt.clientY - rect.top - border
    };
}


var obstacleStart = undefined

document.addEventListener('mousedown', (event) => {
    if (event.which == 1) {
        let mouse = getMousePos(canvas, event)

        if (mouse.x < canvas.width && mouse.x > 0 && mouse.y < canvas.height && mouse.y > 0) {
            obstacleStart = pointToTile(mouse)
        }

    } else if (event.which == 3) {
        let point = pointToTile(getMousePos(canvas, event))
        let key = [point.x, point.y]
        let obstacle = areas[areaIndex].obstacleTiles[key]
        let slope = areas[areaIndex].slopeTiles[key]

        if (obstacle) {
            // stringKey = listToString(key)
            // console.log(stringKey)
            // console.log(area0.neighborMap.keys())
            // console.log(area0.neighborMap.get(stringKey))
            obstacle.delete()
            areas[areaIndex].updateShading()
        } else if (slope) {
            slope.delete()
            areas[areaIndex].updateShading()
        }
    }
})


document.addEventListener('mouseup', (event) => {
    if (event.which == 1) {
        let mouse = getMousePos(canvas, event)
        
        if (obstacleStart && mouse.x < canvas.width && mouse.x > 0 && mouse.y < canvas.height && mouse.y > 0) {
            var obstacleEnd = pointToTile(getMousePos(canvas, event))
            let width = obstacleEnd.x - obstacleStart.x + tileSize
            let height = obstacleEnd.y - obstacleStart.y + tileSize

            new mode(areaIndex, obstacleStart.x, obstacleStart.y, width, height, colors[colorIndex])
            obstacleStart = undefined
            areas[areaIndex].updateShading()
        }
    }
})


document.addEventListener('wheel', (event) => {
    colorIndex += event.deltaY / Math.abs(event.deltaY)
    colorIndex %= colors.length
    if (colorIndex < 0) {colorIndex = colors.length - 1}
    console.log(colorIndex)
})


document.addEventListener('contextmenu', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    
    if (0 < mouse_pos.x && mouse_pos.x < canvas.width) {
        if (0 < mouse_pos.y && mouse_pos.y < canvas.width) {
            event.preventDefault()
        }
    }
})



const tileSize = 20

function pointToTile(point) {
    return {'x': point.x - (point.x % tileSize), 'y': point.y - (point.y % tileSize)}
}




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
            this.charge += 1.35
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

                            this.vx -= 0.8
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

                            this.vx += 0.8
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

// const neighbors = [
//     [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]
// ]
const neighbors = [
    [1, 0], [0, 1], [-1, 0], [0, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]
]

const tint = 'rgb(255, 96, 84)'
const shade = 'rgb(184, 33, 22)'

const borderWidth = 5
const shadingLegend = new Map([
    ['[1,0]', [false, tileSize - borderWidth, 0, borderWidth, tileSize, 'tint']],
    ['[0,1]', [false, 0, tileSize - borderWidth, tileSize, borderWidth, 'shade']],
    ['[-1,0]', [false, 0, 0, borderWidth, tileSize, 'shade']],
    ['[0,-1]', [false, 0, 0, tileSize, borderWidth, 'tint']],
    ['[1,-1]', [false, tileSize - borderWidth, 0, borderWidth, borderWidth, 'tint']],
    ['[1,1]', [false, tileSize - borderWidth, tileSize - borderWidth, borderWidth, borderWidth, 'shade']],
    ['[-1,1]', [false, 0, tileSize - borderWidth, borderWidth, borderWidth, 'shade']],
    ['[-1,-1]', [false, 0, 0, borderWidth, borderWidth, 'tint']]
])




class Area {
    constructor(number) {
        areas.push(this)
        this.number = number

        this.obstacles = []
        this.obstacleTiles = {}
        this.slopes = []
        this.slopeTiles = {}
        this.neighborMap = new Map()
    }

    updateShading() {
        this.neighborMap = new Map()
        
        for (const [key, value] of Object.entries(this.obstacleTiles)) {
            var stringTile = "[" + key + "]"
            var tile = JSON.parse("[" + key + "]")

            this.neighborMap.set(stringTile, [value.color, value.tint, value.shade])

            var count = 0
            for (let n = 0; n < neighbors.length; n++) {
                let nOffset = neighbors[n]

                let index = listToString2([tile[0] + nOffset[0] * tileSize, tile[1] + nOffset[1] * tileSize])

                if (nOffset.includes(0)) {
                    if (!Object.keys(this.obstacleTiles).includes(index) && !Object.keys(this.slopeTiles).includes(index)) {
                        this.neighborMap.get(stringTile).push(nOffset)
                        count += 1                    }
                } else {
                    // let adj1 = listToString2([tile[0] + nOffset[0] * tileSize, tile[1]])
                    // let adj2 = listToString2([tile[0], tile[1] + nOffset[1] * tileSize])

                    let adjacents = [
                        listToString2([tile[0] + nOffset[0] * tileSize, tile[1]]),
                        listToString2([tile[0], tile[1] + nOffset[1] * tileSize])
                    ]


                    if (!Object.keys(this.obstacleTiles).includes(index) && 
                        !Object.keys(this.slopeTiles).includes(index) && 
                        // adjacents.every(value => {Object.keys(this.obstacleTiles).includes(value)})) {
                        Object.keys(this.obstacleTiles).includes(adjacents[0]) &&
                        Object.keys(this.obstacleTiles).includes(adjacents[1])) {
                            this.neighborMap.get(stringTile).push(nOffset)
                        }
                }

            // console.log(stringTile, 'count ', count)
            // if (count == 0) {
                // console.log('delete')
            // }

            }
        }
    }

    drawShading(ctx) {
        for (const [key, value] of this.neighborMap.entries()) {
            var tile = JSON.parse(key)
            
            for (let i = 3; i < value.length; i++) {
                let index = listToString(value[i])
                const specs = shadingLegend.get(index)

                // console.log(index)
                if (specs[5] == 'tint') {var color = value[1]} else if (specs[5] == 'shade') {var color = value[2]}

                if (!specs[0])
                    ctx.fillStyle = color
                    ctx.fillRect(tile[0] + specs[1], tile[1] + specs[2], specs[3], specs[4]);

            }
        }

        // for (const [key, value] of Object.entries(this.obstacleTiles)) {
        //     // console.log(key)
        //     var tile = JSON.parse("[" + key + "]")

        //     ctx.fillStyle = 'blue'
        //     ctx.fillRect(tile[0], tile[1], tileSize, tileSize)
        // }
    }
}


class Obstacle {
    constructor(areaIndex, x, y, width, height, color) {
        
        this.x = x
        this.y = y
        
        // changing attributes if width or height input is negative
        var xAddend = 0; var yAddend = 0
        if (width <= 0) {this.x += width - tileSize; xAddend = tileSize * 2}
        if (height <= 0) {this.y += height - tileSize; yAddend = tileSize * 2}

        this.width = Math.abs(width) + xAddend
        this.height = Math.abs(height) + yAddend
        

        var toAdd = []
        for (let i = 0; i < this.width / tileSize; i++) {
            for (let e = 0; e < this.height / tileSize; e++) {
                let tile = [this.x + i * tileSize, this.y + e * tileSize]
                let strTile = listToString2(tile)

                // if new obstacle overlaps with existing ones, cancel
                if (Object.keys(areas[areaIndex].obstacleTiles).includes(strTile)) {
                    return
                } 

                toAdd.push(tile)
            }
        }

        for (let i = 0; i < toAdd.length; i++) {
            areas[areaIndex].obstacleTiles[toAdd[i]] = this
        }
        
        areas[areaIndex].obstacles.push(this)
        this.areaIndex = areaIndex

        this.rawColor = color
        this.color = 'rgba(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ')'
        this.tint = getTint(color, 90)
        this.shade = getShade(color, 90)
    }

    delete() {
        areas[this.areaIndex].obstacles.splice(areas[this.areaIndex].obstacles.indexOf(this), 1)

        for (let i = 0; i < this.width / tileSize; i++) {
            for (let e = 0; e < this.height / tileSize; e++) {
                delete areas[areaIndex].obstacleTiles[[this.x + i * tileSize, this.y + e * tileSize]]
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Slope {
    constructor(areaIndex, x, y, width, height, color) {
        areas[areaIndex].slopes.push(this)
        this.areaIndex = areaIndex

        this.dir = width / Math.abs(width)
        if (this.dir < 0) {var addend = -tileSize} else {var addend = 0}

        for (let i = 0; i < Math.abs(width) / tileSize; i++) {
            for (let e = height / tileSize - i - 1; e < height / tileSize; e++) {
                areas[areaIndex].slopeTiles[[x + i * tileSize * this.dir + addend, y + e * tileSize]] = this
            }
        }

        this.x = x
        this.y = y + height
        this.width = width
        this.height = height

        this.rawColor = color
        this.color = 'rgba(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ')'
        this.tint = getTint(color, 90)
        this.shade = getShade(color, 90)
        
        this.points = [[x, this.y], [x + width, this.y], [x + width, this.y - height]]

        if (this.dir > 0) {this.lighting = this.shade} else {this.lighting = this.tint}
    }

    delete() {
        areas[this.areaIndex].slopes.splice(areas[this.areaIndex].slopes.indexOf(this), 1)

        if (this.dir < 0) {var addend = -tileSize} else {var addend = 0}

        for (let i = 0; i < Math.abs(this.width) / tileSize; i++) {
            for (let e = this.height / tileSize - i - 1; e < this.height / tileSize; e++) {
                delete areas[areaIndex].slopeTiles[[this.x + i * tileSize * this.dir + addend, 
                                                    this.y - this.height + e * tileSize]]
            }
        }
    }

    draw(ctx) {
        ctx.lineWidth = 0
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.points[0][0], this.points[0][1])
        ctx.lineTo(this.points[1][0], this.points[1][1])
        ctx.lineTo(this.points[2][0], this.points[2][1])
        ctx.lineTo(this.points[0][0], this.points[0][1])
        ctx.fill()
        
        ctx.lineWidth = borderWidth
        ctx.strokeStyle = this.lighting
        ctx.beginPath()
        ctx.moveTo(this.points[0][0], this.points[0][1])
        ctx.lineTo(this.points[2][0], this.points[2][1])
        ctx.stroke()

        // ctx.fillStyle = 'white'
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        // ctx.fill();
    }
}




var mode = Obstacle
var grid = false

const player = new Player(100, 400)

let area0 = new Area(0)
new Area(1)
new Area(2)

for (let i = 0; i < dimensions.length; i++) {
    const array = dimensions[i]
    if (array[0] == 'o') {
        new Obstacle(array[1], array[2], array[3], array[4], array[5], array[6])
    } else if (array[0] == 's') {
        new Slope(array[1], array[2], array[3], array[4], array[5], array[6])
    }
    
}

area0.updateShading()


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

    areas[areaIndex].drawShading(ctx)

    if (grid) {
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 1
        for (let w = 0; w < canvas.width / tileSize; w++) {
            ctx.beginPath()
            ctx.moveTo(w * tileSize, 0)
            ctx.lineTo(w * tileSize, canvas.height)
            ctx.stroke()
        }

        for (let h = 0; h < canvas.height / tileSize; h++) {
            ctx.beginPath()
            ctx.moveTo(0, h * tileSize)
            ctx.lineTo(canvas.width, h * tileSize)
            ctx.stroke()
        }
    }

    
    ctx.font = '30px arial'
    ctx.fillStyle = 'white'
    ctx.fillText(areaIndex, 10, 30)
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
    
    // console.log(player.vx, player.airborn)

    drawWindow();
    
    window.requestAnimationFrame(loop);
    
  }
  
window.requestAnimationFrame(loop);