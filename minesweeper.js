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
const themeMenu = document.getElementById('theme')
const resetButton = document.getElementById('resetButton')
const scaleSlider = document.getElementById('scaleSlider')
const timerDisplay = document.getElementById('timerDisplay')


function setDifficulty() {
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

const themes = {
    'classic': {
        flat: 'darkgray', tint: 'gainsboro', shade: 'gray', line: 'dimgray', flag: 'red',
        background: 'darkgray'},
    'onthegreen': {
        flat: 'rgb(170, 215, 81)', tint: 'rgb(200, 240, 120)', shade: 'rgb(142, 184, 61)', 
        line: 'rgb(171, 137, 103)', flag: 'red', background: 'rgb(229, 194, 159)'},
    'bubblegum': {
        flat: 'rgb(241, 149, 173)', tint: 'rgb(249, 187, 196)', shade: 'rgb(235, 121, 155)', 
        line: 'mediumvioletred', flag: 'rgb(227, 86, 102)', background: 'rgb(241, 149, 173)'}
}
var theme = 'classic'



/**
 * Self-adjusting interval to account for drifting
 * 
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds)
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
 function AdjustingInterval(workFunc, interval, errorFunc) {
    var that = this;
    var expected, timeout;
    this.interval = interval;

    this.start = function() {
        expected = Date.now() + this.interval;
        timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
        clearTimeout(timeout);
    }

    function step() {
        var drift = Date.now() - expected;
        if (drift > that.interval) {
            // You could have some default stuff here too...
            if (errorFunc) errorFunc();
        }
        workFunc();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval-drift));
    }
}



var time = 0

function updateTimer() {
    ++time
    var seconds = (time % 60.).toString()
    var minutes = ((time - seconds) / 60).toString()

    if (time % 60 < 10) {seconds = '0' + seconds}
    var string = minutes + ':' + seconds

    timerDisplay.innerHTML = string
}

var timer = new AdjustingInterval(updateTimer, 1000)



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
            ctx.strokeStyle = themes[theme].line
            ctx.stroke()

        } else {
            var border = 3 * scale
        	ctx.fillStyle = themes[theme].shade
            ctx.fillRect(this.x, this.y, unit, unit)
            ctx.beginPath()
        	ctx.fillStyle = themes[theme].tint
            ctx.fillRect(this.x, this.y, unit - border, unit - border)
            ctx.beginPath()
        	ctx.fillStyle = themes[theme].flat
            ctx.fillRect(this.x + border, this.y + border, unit - border * 2, unit - border * 2)
            ctx.beginPath()

            if (this.flagged) {
                ctx.fillStyle = themes[theme].flag
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
        this.bombCount = undefined
        
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
        this.bombCount = bombDensity * Object.values(this.allSquares).length
        var pool = [...Object.keys(this.allSquares)]
        var selected = []

        while (selected.length < this.bombCount) {
            var randomIndex = Math.floor(Math.random() * pool.length)
            selected.push(pool[randomIndex])
            pool.splice(randomIndex, 1)
        }

        var count = 0
        selected.forEach(element => {
            count += 1
            this.allSquares[element].bomb = true
        })
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

        timer.start()
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
        timer.stop()
        for (let i = 0; i < Object.values(this.allSquares).length; i++) {
            Object.values(this.allSquares)[i].revealed = true
        }
    }
    
    reset() {
        let squareList = Object.values(this.allSquares)
        squareList.forEach(element => {element.bomb = false});

        time = 0
        timerDisplay.innerHTML = '0:00'
        timer.stop()
        timer = new AdjustingInterval(updateTimer, 1000)

        this.started = false
    	this.shuffleBombs(this.bombDensity)
    	this.unrevealedSquares = []
        for (var i = 0; i < squareList.length; i ++) {
            let s = squareList[i]
        	s.revealed = false
            s.flagged = false
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


difficultyMenu.onchange = setDifficulty;
themeMenu.onchange = function() {
    theme = themeMenu.value
}
// scaleSlider.onchange = function() {
//     unit = scaleSlider.value
// }

resetButton.addEventListener('click', (event) => {grid.reset()})



document.addEventListener('mousedown', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    var square = grid.mouseToSquare(mouse_pos)
    
    if (square) {
        if (event.which == 1 && !square.flagged) {
            if (!grid.started) {
                grid.firstClick(square)
            } else if (square.bomb) {
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



function getMousePos(canvas, evt) {
    var border = 5;
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left - border,
      y: evt.clientY - rect.top - border
    };
}


function drawWindow(ctx) {
	ctx.fillStyle = themes[theme].background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    Object.values(grid.allSquares).forEach(item =>
        item.draw(ctx))
    
}


function loop() {

    drawWindow(ctx);

    window.requestAnimationFrame(loop);

}

  
window.requestAnimationFrame(loop);