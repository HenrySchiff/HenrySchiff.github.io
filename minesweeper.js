const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')


const unit = 20
const neighbors = [
	[-unit, -unit], [0, -unit], [unit, -unit],
	[-unit, 0], [unit, 0],
	[-unit, unit], [0, unit], [unit, unit],
    ]


const allSquares = new Object();

class Square {
	constructor(x, y) {
    	allSquares[[x, y]] = this;
    	this.x = x;
        this.y = y;
        
        this.localNeighbors = undefined
        this.number = undefined
        this.bomb = false
        this.revealed = false
        this.color = 'darkGray'
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
        
        var count = 0
        while (queue.length > 0) {
        	console.log(queue.length)
        	var current = queue[0]
            if (current.number == 0) {
            	var nb = current.localNeighbors
            	for (var i = 0; i < nb.length; i ++) {
                	if (!nb[i].revealed && !queue.includes(nb[i])) {
                    	queue.push(nb[i])
                    }
                }
            }
            
            current.revealed = true
           	queue.splice(0, 1)
            count += 1
            
        }
        
    }
    
    
    draw(ctx) {
        /* ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, unit, unit)
        ctx.beginPath() */

		if (this.revealed) {
            if (this.bomb) {
                ctx.strokeStyle = 'black'
                ctx.beginPath();
                ctx.arc(this.x + unit / 2, this.y + unit / 2, unit / 3, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (this.number > 0) {
                ctx.font = '15px arial'
                ctx.fillStyle = 'black'
                ctx.fillText(this.number, this.x + 5, this.y + 15)
                }
        } else {
        	ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, unit, unit)
            ctx.beginPath()
        }
        
        ctx.rect(this.x, this.y, unit, unit)
        ctx.lineWidth = 0.5
        ctx.strokeStyle = 'black'
        ctx.stroke()
    }
}


class Grid {
	constructor (width, height, bombDensity) {
    	this.width = width
        this.height = height
        
        for (var x = 0; x < width; x ++) {
        	for (var y = 0; y < height; y ++) {
            	new Square(x * unit, y * unit);
            }
        }
        
        this.shuffleBombs(bombDensity)
        
        Object.values(allSquares).forEach(item => item.findNeighbors())
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


const grid = new Grid(30, 30, 0.05);


document.addEventListener('mousedown', (event) => {
    var mouse_pos = getMousePos(canvas, event)
    var square = grid.mouseToSquare(mouse_pos)
    
    if (square.bomb) {
    	alert('you suck')
    } else if (square.number == 0) {
    	square.caving()
    } else {
    	square.revealed = true
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
	ctx.fillStyle = 'gray';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    Object.values(allSquares).forEach(item =>
        item.draw(ctx))
    
}


function loop() {

    drawWindow(ctx);

    window.requestAnimationFrame(loop);

}

  
window.requestAnimationFrame(loop);
