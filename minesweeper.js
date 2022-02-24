const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')


const unit = 20
const neighbors = [
	[-unit, -unit], [0, -unit], [unit, -unit],
	[-unit, 0], [unit, 0],
	[-unit, unit], [0, unit], [unit, unit],
    ]


const allSquares = new Object();
console.log(allSquares);

class Square {
	constructor(x, y) {
    	allSquares[[x, y]] = this;
    	this.x = x;
        this.y = y;
        this.localNeighbors = undefined
        
        this.bomb = false
        this.color = 'gray'
    }
    
    findNeighbors() {
    	var localNeighbors = []
    	for (var i = 0; i < neighbors.length; i ++) {
        	var n = neighbors[i]
            var index = [this.x + n[0], this.y + n[1]].toString()

            if (Object.keys(allSquares).includes(index)) {
                localNeighbors.push(allSquares[index])
        	}   

        this.localNeighbors = localNeighbors;
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, unit, unit)
    	ctx.beginPath()
        ctx.rect(this.x, this.y, unit, unit)
        ctx.stroke()

        if (this.bomb) {
            ctx.strokeStyle = 'black'
            ctx.beginPath();
            ctx.arc(this.x + unit / 2, this.y + unit / 2, unit / 3, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}


class Grid {
	constructor (width, height, bombDensity) {
    	this.width = width
        this.height = height
        console.log(width)
        
        for (var x = 0; x < width; x ++) {
        	for (var y = 0; y < height; y ++) {
            	new Square(x * unit, y * unit);
            }
        }
        
        Object.values(allSquares).forEach(item => item.findNeighbors())

        this.shuffleBombs(bombDensity)
    }

    mouseToSquare (mouse_pos) {
        var index = [mouse_pos.x - (mouse_pos.x % unit), mouse_pos.y - (mouse_pos.y % unit)].toString()

        if (Object.keys(allSquares).includes(index)) {
            return allSquares[index]
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
}


const grid = new Grid(30, 30, 0.25);


document.addEventListener('mousedown', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    var square = grid.mouseToSquare(mouse_pos)
    console.log(mouse_pos)

    // if (typeof(square) != 'undefined') {
    //     square.color = 'red'
    //     square.localNeighbors.forEach(nb => nb.color = 'yellow')
    //     console.log(square.localNeighbors)
    // }
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
    
    Object.values(allSquares).forEach(item =>
        item.draw(ctx))
    
}


function loop() {

    drawWindow(ctx);

    window.requestAnimationFrame(loop);

}

  
window.requestAnimationFrame(loop);