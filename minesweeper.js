const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')


const unit = 20
const neighbors = [
	[-unit, -unit], [0, -unit], [unit, -unit],
	[-unit, 0], [unit, 0],
	[-unit, unit], [0, unit], [unit, unit],
    ]


const allSquares = new Object();
var unrevealedSquares = []

const colors = ['blue', 'green', 'red', 'darkBlue', 'maroon', 'turquoise', 'black', 'darkgray']

class Square {
	constructor(x, y) {
    	allSquares[[x, y]] = this;
    	this.x = x;
        this.y = y;
        
        this.localNeighbors = undefined
        this.number = undefined
        this.bomb = false
        this.revealed = false
        this.flagged = false
    }
    
    findNeighbors() {
    	var localNeighbors = []
    	for (var i = 0; i < neighbors.length; i ++) {
        	var n = neighbors[i]
            var index = [this.x + n[0], this.y + n[1]].toString()

            if (Object.keys(allSquares).includes(index)) {
                localNeighbors.push(allSquares[index])
        	}   
        }
            
        var count = 0
        for (var i = 0; i < localNeighbors.length; i ++) {
            var neighbor = localNeighbors[i]
            if (neighbor.bomb) {
                count += 1
            }
        }

        this.localNeighbors = localNeighbors;
        this.number = count;
    }
    
    
    caving() {
    	var queue = [this]
        
        while (queue.length > 0) {
        	var current = queue[0]
            if (current.number == 0) {
            	var nb = current.localNeighbors
            	for (var i = 0; i < nb.length; i ++) {
                	if (!nb[i].revealed && !queue.includes(nb[i])) {
                    	queue.push(nb[i])
                    }
                }
            }
            
            current.reveal()
           	queue.splice(0, 1)
            
        }
        
    }
    
    
    reveal() {
    	this.revealed = true
        var index = unrevealedSquares.indexOf(this)
        unrevealedSquares.splice(index, 1)
    }
    
    
    draw(ctx) {
        /* ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, unit, unit)
        ctx.beginPath() */

		if (this.revealed) {
            if (this.bomb) {
                ctx.fillStyle = 'black'
                ctx.beginPath();
                ctx.arc(this.x + unit / 2, this.y + unit / 2, unit / 4, 0, 2 * Math.PI);
                ctx.fill();
            } else if (this.number > 0) {
                ctx.font = 'bold 14px arial'
                ctx.fillStyle = colors[this.number - 1]
                ctx.fillText(this.number, this.x + 6, this.y + 15)
            }

            ctx.rect(this.x, this.y, unit, unit)
            ctx.lineWidth = 0.5
            ctx.strokeStyle = 'dimgray'
            ctx.stroke()

        } else {
            var border = 3
        	ctx.fillStyle = 'gray'
            ctx.fillRect(this.x, this.y, unit, unit)
            ctx.beginPath()
        	ctx.fillStyle = 'gainsboro'
            ctx.fillRect(this.x, this.y, unit - border, unit - border)
            ctx.beginPath()
        	ctx.fillStyle = 'darkgray'
            ctx.fillRect(this.x + border, this.y + border, unit - border * 2, unit - border * 2)
            ctx.beginPath()

            if (this.flagged) {
                ctx.fillStyle = 'red'
                ctx.beginPath();
                ctx.arc(this.x + unit / 2, this.y + unit / 2, unit / 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    } 
}


class Grid {
	constructor (width, height, bombDensity) {
    	this.width = width
        this.height = height
        this.bombDensity = bombDensity
        
        for (var x = 0; x < width; x ++) {
        	for (var y = 0; y < height; y ++) {
            	var s = new Square(x * unit, y * unit);
                unrevealedSquares.push(s);
            }
        }
        
        this.shuffleBombs(bombDensity)
        
        Object.values(allSquares).forEach(item => item.findNeighbors())
        
    }

    mouseToSquare (mouse_pos) {
        var index = [mouse_pos.x - (mouse_pos.x % unit), mouse_pos.y - (mouse_pos.y % unit)].toString()

        if (Object.keys(allSquares).includes(index)) {
            return allSquares[index];
        }
        return
    }

    shuffleBombs (bombDensity) {
        var array = []
        var shuffled = []
        var squareCount = Object.values(allSquares).length
        var bombCount = bombDensity * squareCount

        for (var i = 0; i < squareCount; i ++) {
            if (i <= bombCount) {
                array.push(true)
            } else {
                array.push(false)
            }
        }

        while (array.length > 0) {
            var randomIndex = Math.floor(Math.random() * array.length)
            shuffled.push(array[randomIndex])
            array.splice(randomIndex, 1)
        }

        for (var i = 0; i < shuffled.length; i ++) {
            Object.values(allSquares)[i].bomb = shuffled[i]
        }

    }

    gameOver() {
        for (let i = 0; i < unrevealedSquares.length; i++) {
            unrevealedSquares[i].revealed = true
        }
    }
    
    reset() {
    	this.shuffleBombs(this.bombDensity)
    	unrevealedSquares = []
        for (var i = 0; i < Object.values(allSquares).length; i ++) {
            let s = Object.values(allSquares)[i]
        	s.revealed = false
            s.findNeighbors()
            unrevealedSquares.push(s)
        }
    }
}


const grid = new Grid(35, 35, 0.10);


document.addEventListener('mousedown', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    var square = grid.mouseToSquare(mouse_pos)
    
    if (square) {
        if (event.which == 1 && !square.flagged) {
            if (square.bomb) {
                console.log('bomb')
                grid.gameOver()
            } else if (square.number == 0) {
                square.caving()
            } else {
                square.reveal()
            }
        } else if (event.which == 3) {
            square.flagged = !square.flagged
        }
    }
})


document.addEventListener('contextmenu', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    
    if (0 < mouse_pos.x && mouse_pos.x < canvas.width) {
        if (0 < mouse_pos.y && mouse_pos.y < canvas.width) {
            event.preventDefault()
        }
    }
})


document.addEventListener('keydown', (event) => {
	if (event.key == 'r') {
    	grid.reset()
    }
})


function getMousePos(canvas, evt) {
    var border = 5;
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left - border,
      y: evt.clientY - rect.top - border
    };
}


function drawWindow(ctx) {
	ctx.fillStyle = 'darkgray';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    Object.values(allSquares).forEach(item =>
        item.draw(ctx))
    
}


function loop() {

    drawWindow(ctx);

    window.requestAnimationFrame(loop);

}

  
window.requestAnimationFrame(loop);