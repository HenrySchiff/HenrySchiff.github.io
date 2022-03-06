const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')


const unit = 25
var scale = unit / 20

const neighbors = [
	[-unit, -unit], [0, -unit], [unit, -unit],
	[-unit, 0], [unit, 0],
	[-unit, unit], [0, unit], [unit, unit],
    ]
    

const difficulties = {
	'easy': [8, 8, 0.15],
    'normal': [16, 16, 0.18],
    'hard': [24, 24, 0.20]
}
const difficultyMenu = document.getElementById('difficulty')


function setDifficulty() {
    console.log('br')
    let difficulty = difficultyMenu.value
	info = difficulties[difficulty]
    let width = info[0]; let height = info[1]; let bombDensity = info[2];
    canvas.width = width * unit
    canvas.height = height * unit
    grid.bombDensity = bombDensity
    grid.resize(width, height)
    grid.reset()

}



// var allSquares = new Object();
// var unrevealedSquares = []

const colors = ['blue', 'green', 'red', 'darkBlue', 'maroon', 'teal', 'black', 'darkgray']

class Square {
	constructor(x, y, grid) {
    	grid.allSquares[[x, y]] = this;
        this.grid = grid
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

            if (Object.keys(this.grid.allSquares).includes(index)) {
                localNeighbors.push(this.grid.allSquares[index])
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
        var index = this.grid.unrevealedSquares.indexOf(this)
        this.grid.unrevealedSquares.splice(index, 1)
    }
    
    
    draw(ctx) {
        /* ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, unit, unit)
        ctx.beginPath() */
        var fontSize = 14 * scale
        var font = 'bold ' + fontSize.toString() + 'px arial'

		if (this.revealed) {
            if (this.bomb) {
                ctx.fillStyle = 'black'
                ctx.beginPath();
                ctx.arc(this.x + unit / 2, this.y + unit / 2, unit / 4, 0, 2 * Math.PI);
                ctx.fill();
            } else if (this.number > 0) {
                ctx.font = font
                ctx.fillStyle = colors[this.number - 1]
                ctx.fillText(this.number, this.x + 6 * scale, this.y + 15 * scale)
            }

            ctx.rect(this.x, this.y, unit, unit)
            ctx.lineWidth = 0.5
            ctx.strokeStyle = 'dimgray'
            ctx.stroke()

        } else {
            var border = 3 * scale
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

        this.allSquares = {}
        this.unrevealedSquares = []
        this.started = false
        
        for (var x = 0; x < width; x ++) {
        	for (var y = 0; y < height; y ++) {
            	var s = new Square(x * unit, y * unit, this);
                this.unrevealedSquares.push(s);
            }
        }
        
        this.shuffleBombs(bombDensity)
        
        Object.values(this.allSquares).forEach(item => item.findNeighbors())
        
    }

    mouseToSquare (mouse_pos) {
        if (mouse_pos.x >= 0 && mouse_pos.y >= 0) {
            var index = [mouse_pos.x - (mouse_pos.x % unit), mouse_pos.y - (mouse_pos.y % unit)].toString()

            if (Object.keys(this.allSquares).includes(index)) {
                return this.allSquares[index];
            }
        }
        return
    }


    shuffleBombs (bombDensity) {
        var bombCount = bombDensity * Object.values(this.allSquares).length
        var pool = [...Object.keys(this.allSquares)]
        var selected = []

        while (selected.length < bombCount) {
            var randomIndex = Math.floor(Math.random() * pool.length)
            selected.push(pool[randomIndex])
            pool.splice(randomIndex, 1)
        }

        var count = 0
        selected.forEach(element => {
            count += 1
            this.allSquares[element].bomb = true
        })
        console.log(count)
    }


    firstClick(square) {
        var toCheck = [...square.localNeighbors]
        toCheck.push(square)
        var dontBomb = [...toCheck]
        var squareList = Object.values(this.allSquares)

        while (toCheck.length > 0) {
            if (toCheck[0].bomb) {
                var randomIndex = Math.floor(Math.random() * squareList.length)
                var randomSquare = squareList[randomIndex]

                if (!randomSquare.bomb && !dontBomb.includes(randomSquare)) {
                    randomSquare.bomb = true
                    toCheck[0].bomb = false
                    toCheck.splice(0, 1)
                }

            } else {
                toCheck.splice(0, 1)
            }
        }

        this.started = true
        Object.values(this.allSquares).forEach(item => item.findNeighbors())

        for (let i = 0; i < dontBomb.length; i++) {
            var element = dontBomb[i]

            if (element.number == 0) {
                element.caving()
            } else {
                element.reveal()
            }
            
        }

    }


    // gameOver() {
    //     for (let i = 0; i < this.unrevealedSquares.length; i++) {
    //         this.unrevealedSquares[i].revealed = true
    //     }
    // }

    gameOver() {
        for (let i = 0; i < Object.values(this.allSquares).length; i++) {
            Object.values(this.allSquares)[i].revealed = true
        }
    }
    
    reset() {
        let squareList = Object.values(this.allSquares)
        squareList.forEach(element => {element.bomb = false});

        this.started = false
    	this.shuffleBombs(this.bombDensity)
    	this.unrevealedSquares = []
        for (var i = 0; i < squareList.length; i ++) {
            let s = squareList[i]
        	s.revealed = false
            s.findNeighbors()
            this.unrevealedSquares.push(s)
        }
    }

    resize(width, height) {
        this.allSquares = {}
        this.unrevealedSquares = []
        for (var x = 0; x < width; x ++) {
        	for (var y = 0; y < height; y ++) {
            	var s = new Square(x * unit, y * unit, this);
                this.unrevealedSquares.push(s);
            }
        }
    }

}


var grid = new Grid(16, 16, 0.18);
setDifficulty(difficultyMenu.value)


document.getElementById('difficulty').onchange = setDifficulty;


document.addEventListener('mousedown', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    var square = grid.mouseToSquare(mouse_pos)
    
    if (square) {
        if (event.which == 1 && !square.flagged) {
            if (!grid.started) {
                grid.firstClick(square)
            } else if (square.bomb) {
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
    if (event.key == 'g') {
    	grid.gameOver()
    }
})

// difficultyMenu.addEventListener('selectionChange', setDifficulty(difficultyMenu.value))


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
    
    Object.values(grid.allSquares).forEach(item =>
        item.draw(ctx))
    
}


function loop() {

    drawWindow(ctx);

    window.requestAnimationFrame(loop);

}

  
window.requestAnimationFrame(loop);