(function () {
var svg = d3.select('.game-space').append('svg');

d3.selection.prototype._position = function() {
    var el = this.node();
    var elPos = el.getBoundingClientRect();
    var vpPos = getVpPos(el);

    function getVpPos(el) {
        if(el.parentElement.tagName === 'svg') {
            return el.parentElement.getBoundingClientRect();
        }
        return getVpPos(el.parentElement);
    }

    return {
        top: elPos.top - vpPos.top - 2,
        left: elPos.left - vpPos.left - 2,
        bottom: elPos.bottom - vpPos.top,
        right: elPos.right - vpPos.left,
        x: (elPos.left - vpPos.left - 3)/BLOCKSIZE,
        y: (elPos.top - vpPos.top - 3)/BLOCKSIZE
    };

};

d3.selection.prototype._moveBlock = function(offsetX, offsetY) {
    this.attr('x', this._position().left + offsetX*BLOCKSIZE);
    this.attr('y', this._position().top + offsetY*BLOCKSIZE);

};

d3.selection.prototype._checkRotation = function(offsetX, offsetY) {
    return {
        x: this._position().left + offsetX,
        y: this._position().top + offsetY
    }
};

function randomNumber (m,n) {
    return Math.floor( Math.random() * (n - m + 1) ) + m;
}

function moveSquare(e) {
     switch (e.keyCode) {
        case 37:
            if (shape.leftIsEmpty()) {
                shape.toLeft(); 
            }
            break;
        case 39:
            if (shape.rightIsEmpty()) {
                shape.toRight();
            }
            break;
        case 40:
            if (shape.bottomIsEmpty()) {
                shape.moveDown();
            }
            break;
        case 32:
            if (shape.enoughSpaceForRotation()) {
                shape.rotate();
            }
            break;
        case 38:
            if (shape.enoughSpaceForRotation()) {
                shape.rotate();
            }
            break;
        }
}

var score = 0, speed = 250, speedCounter = 1;

var BLOCKSIZE = (document.querySelector('svg').offsetHeight -4)/18;

var squaresStorage = [];

var lines = [];
for( var i  = 18; i > 0; i --) {
    lines[18-i] = BLOCKSIZE*i + 1;
}

window.addEventListener("keydown", moveSquare, false);

window.onresize = function () {
    BLOCKSIZE = (document.querySelector('svg').offsetHeight -4)/18;
    drawGrid();
    redrawBlocks();
}

var tetris = {
    drawGrid : function () {
        svg.selectAll("line").remove();
        for (var i = 0; i < 12; i++) {
            svg.append('line')
                .attr("x1", BLOCKSIZE * i)
                .attr("y1", 0)
                .attr("x2", BLOCKSIZE * i)
                .attr("y2", BLOCKSIZE * 18);
        }
        for (var i = 0; i < 19; i++) {
            svg.append('line')
                .attr("x1", 0)
                .attr("y1", BLOCKSIZE * i)
                .attr("x2", BLOCKSIZE * 11)
                .attr("y2", BLOCKSIZE * i);
        }
    },
    checkLines: function() {
        for (var i = 0; i < 17; i ++) {
            var temp = squaresStorage.filter(function(item) {
                if (item._position().bottom === lines[i]) return item;
            })
    
            if(temp.length === 11) {
                map.clearLine(17-i);
                squaresStorage = squaresStorage.filter(function(item) {
                    if (item._position().bottom != lines[i])  {
                        return item;
                    }
                    else item.remove();
                })
                squaresStorage.forEach(function (item) {
                    if(item._position().top < lines[i]) {
                        item
                            .attr("y",item._position().top + BLOCKSIZE);
                    }
                });
            document.querySelector(".score").innerText = "Score: " + ++score + ". Speed: " + speedCounter + "";
            if(score % 5 === 0 && speedCounter < 5) {
                speed = speed - 28;
                speedCounter++;
            }
            i--;
        }
    }
    },
    nextStep: function () {
    if (shape.bottomIsEmpty()) {
        shape.moveDown();
        setTimeout(tetris.nextStep, speed);
    }
    else {
        shape.blocks.forEach(function (square) {
            squaresStorage.push(square)
            map.noteAsBusy((square._position().left -1)/BLOCKSIZE, (square._position().top -1)/BLOCKSIZE);
        });
        var temp = shape.blocks.filter(function(item) {
                if (item._position().bottom === BLOCKSIZE+1) return item;
            })
        if (!temp.length) {
            tetris.checkLines();
            tetris.newShape();
        }
        else tetris.newGame();
    }
    },

    newSquare: function(xOffset, yOffset, rand) {
        var square = svg.append('rect')
            .attr('x', BLOCKSIZE*4 + 1 + xOffset*BLOCKSIZE)
            .attr('y', 1 + yOffset*BLOCKSIZE)
            .attr('width', BLOCKSIZE - 2)
            .attr('height', BLOCKSIZE - 2)
        switch(rand) {
            case 0:
                square.attr("fill", "#00BFFF")
                break;
            case 1:
                square.attr("fill", "#FF0000")
                break;
            case 2:
                square.attr("fill", "#FFD700")
                break;
            case 3:
                square.attr("fill", "#00FF00")
                break;
        }
    
        shape.blocks.push(square);
    },
    
    shapeFactory: function(type) {
        while (shape.blocks.length) {
                shape.blocks.pop();
        }
    
        switch(type) {
            case 0:
                this.newSquare(1,0,type);
                this.newSquare(0,1,type);
                this.newSquare(1,1,type);
                this.newSquare(2,1,type);
                break;     
            case 1:
                this.newSquare(0,0,type);
                this.newSquare(0,1,type);
                this.newSquare(1,1,type);
                this.newSquare(1,0,type);
                break;
            case 2:
                this.newSquare(1,0,type);
                this.newSquare(1,1,type);
                this.newSquare(1,2,type);
                this.newSquare(1,3,type);
                break;
            case 3:
                this.newSquare(0,0,type);
                this.newSquare(0,1,type);
                this.newSquare(1,1,type);
                this.newSquare(2,1,type);
                break;
        }
    },
    
    newShape: function() {
        shape.shapeType = randomNumber(0,3);
        shape.currentRotation = 0;
        this.shapeFactory(shape.shapeType);
        setTimeout(this.nextStep, speed);
    },

    newGame: function() {
        squaresStorage = [];
        svg.selectAll("rect").remove();
        score = 0;
        speedCounter = 1;
        speed = 250;
        map.init();
        tetris.drawGrid();
        tetris.newShape();
    }
};

var map = {
    field: [],

    init: function() {
        for (var i = 0; i < 11; i++) {
            this.field[i] = [];
            for(var j = 0; j < 18; j++) {
                this.field[i][j] = 0;
            }
        }
    },
    isFree: function (x,y) {
        if (this.field[x][y] === 0) return true;
        return false;
    },

    noteAsBusy: function (x,y) {
        this.field[x][y] = 1;
    },

    noteAsFree: function (x,y) {
        this.field[x][y] = 0;
    },

    clearLine: function(y) {
        for(var x = 0; x < 11; x++) this.field[x][y] = 0;

        for(var i = y - 1; i > 0; i--)
            for(var x = 0; x < 11; x++) {
                if (this.field[x][i] === 1) {
                    this.field[x][i] = 0;
                    this.field[x][i + 1] = 1;
                }
            }
        }
};

var shape = {
    shapeType: 0,
    currentRotation: 0,
    blocks : [],

    moveDown : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("y",square._position().top + BLOCKSIZE);
        });
    },

    toLeft : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("x",square._position().left - BLOCKSIZE);
        });
    },

    toRight : function () {
         this.blocks.forEach(function (square) {
            square
                .attr("x",square._position().left + BLOCKSIZE);
        });
    },

    leftIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var x = this.blocks[i]._position().x;
            var y = this.blocks[i]._position().y;

            if (x < 1) return false;
            if (!map.isFree(x - 1, y)) return false;
        }
        return true;
    },

    rightIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var x = this.blocks[i]._position().x;
            var y = this.blocks[i]._position().y;

            if (x > 10) return false;
            if (!map.isFree(x + 1, y)) return false;
        }
        return true;
    },

    bottomIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var x = this.blocks[i]._position().x;
            var y = this.blocks[i]._position().y;
            if (y === 17) return false;
            if (!map.isFree(x, y + 1)) return false;
        }
        return true;
    },

    enoughSpaceForRotation: function() {
        var blocksToCheck = [];
        for (var i = 0; i < 4; i ++) {
               blocksToCheck[i] = {
                  x: (this.blocks[i]._position().left - 1)/BLOCKSIZE,
                  y: (this.blocks[i]._position().top - 1)/BLOCKSIZE,
                  _moveBlock: function(offsetX, offsetY) {
                          this.x += offsetX;
                          this.y += offsetY;
                      }
                  }
              }

        var blocks = this.rotate(blocksToCheck, this.currentRotation);

        for(var i = 0; i < 4; i ++) {
            var x = blocks[i].x;
            var y = blocks[i].y;
            if (x > 10 || x < 0 || y > 17) {
                return false;
            }
            if (!map.isFree(x, y)) return false;
        }
        return true;
    },

    rotate : function (blocksToCheck, currentRotation) {
        if (arguments.length === 0) {
            var blocks = this.blocks;
            currentRotation = this.currentRotation;
        }
        else {
            blocks = blocksToCheck;
        }
        switch (this.shapeType) {
            case 0:
                switch (currentRotation) {
                    case 0:
                        blocks[0]._moveBlock(1, 1);
                        blocks[1]._moveBlock(1, -1);
                        blocks[3]._moveBlock(-1, 1);
                        currentRotation = 90;
                        break;
                    case 90:
                        blocks[0]._moveBlock(-1, 1);
                        blocks[1]._moveBlock(1, 1);
                        blocks[3]._moveBlock(-1, -1);
                        currentRotation = 180;
                        break;
                    case 180:
                        blocks[0]._moveBlock(-1, -1);
                        blocks[1]._moveBlock(-1, 1);
                        blocks[3]._moveBlock(1, -1);
                        currentRotation = 270;
                        break;
                    case 270:
                        blocks[0]._moveBlock(1, -1);
                        blocks[1]._moveBlock(-1, -1);
                        blocks[3]._moveBlock(1, 1);
                        currentRotation = 0;
                        break;
                }
                break;

            case 2:
                switch (currentRotation) {
                    case 0:
                        blocks[0]._moveBlock(2, 2);
                        blocks[1]._moveBlock(1, 1);
                        blocks[3]._moveBlock(-1, -1);
                        currentRotation = 90;
                        break;
                    case 90:
                        blocks[0]._moveBlock(-2, 2);
                        blocks[1]._moveBlock(-1, 1);
                        blocks[3]._moveBlock(1, -1);
                        currentRotation = 180;
                        break;
                    case 180:
                        blocks[0]._moveBlock(-2, -2);
                        blocks[1]._moveBlock(-1, -1);
                        blocks[3]._moveBlock(1, 1);
                        currentRotation = 270;
                        break;
                    case 270:
                        blocks[0]._moveBlock(2, -2);
                        blocks[1]._moveBlock(1, -1);
                        blocks[3]._moveBlock(-1, 1);
                        currentRotation = 0;
                        break;
                }
                break;

             case 3:
                switch (currentRotation) {
                    case 0:
                        blocks[0]._moveBlock(1, 1);
                        blocks[2]._moveBlock(-1, 1);
                        blocks[3]._moveBlock(-2, 2);
                        currentRotation = 90;
                        break;
                    case 90:
                        blocks[0]._moveBlock(-1, 1);
                        blocks[2]._moveBlock(-1, -1);
                        blocks[3]._moveBlock(-2, -2);
                        currentRotation = 180;
                        break;
                    case 180:
                        blocks[0]._moveBlock(-1, -1);
                        blocks[2]._moveBlock(1, -1);
                        blocks[3]._moveBlock(2, -2);
                        currentRotation = 270;
                        break;
                    case 270:
                        blocks[0]._moveBlock(1, -1);
                        blocks[2]._moveBlock(1, 1);
                        blocks[3]._moveBlock(2, 2);
                        currentRotation = 0;
                        break;
                }
                break;
        }
    if (arguments.length === 0) {
        this.currentRotation = currentRotation;
    }
    return blocks;
    }
};

tetris.newGame();
}) ();
