
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
        top: elPos.top - vpPos.top,
        left: elPos.left - vpPos.left,
        bottom: elPos.bottom - vpPos.top,
        right: elPos.right - vpPos.left
    };

};

d3.selection.prototype._moveBlock = function(offsetX, offsetY) {
    this.attr('x', this._position().left + offsetX*BLOCKSIZE - 2);
    this.attr('y', this._position().top + offsetY*BLOCKSIZE - 2);

};

d3.selection.prototype._checkRotation = function(offsetX, offsetY) {
    return {
        x: this._position().left + offsetX - 2,
        y: this._position().top + offsetY - 2
    }
};

function randomNumber (m,n) {
    return Math.floor( Math.random() * (n - m + 1) ) + m;
}

function drawGrid() {
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
}

function redrawBlocks() {
    squaresStorage.forEach(function(square) {
        square
            .attr('x', ((square._position.left()-1)/40) * BLOCKSIZE + 1)//fix later
            .attr('y', ((square._position.top()-1)/40) * BLOCKSIZE + 1)
            .attr('width', BLOCKSIZE - 2)
            .attr('height', BLOCKSIZE - 2)
    }) 
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

function checkLines() {
    for (var i = 0; i < 17; i ++) {
        var temp = squaresStorage.filter(function(item) {
            if (item._position().bottom === lines[i]) return item;
        })

        if(temp.length === 11) {
            squaresStorage = squaresStorage.filter(function(item) {
                if (item._position().bottom != lines[i])  {
                    return item;
                }
                else item.remove();
            })
            squaresStorage.forEach(function (item) {
                if(item._position().top < lines[i]) {
                    item
                        .attr("y",item._position().top + BLOCKSIZE - 2);
                }
            });
        document.querySelector(".score").innerText = "Score: " + ++score + ". Speed: " + speedCounter + "";
        if(score % 5 === 0 && speedCounter < 5) {
            speed = speed - 27;
            speedCounter++;
        }
        i--;
        }
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

var shape = {
    shapeType: 0,
    currentRotation: 0,
    blocks : [],

    moveDown : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("y",square._position().top + BLOCKSIZE - 2);
        });
    },

    toLeft : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("x",square._position().left - BLOCKSIZE - 2);
        });
    },

    toRight : function () {
         this.blocks.forEach(function (square) {
            square
                .attr("x",square._position().left + BLOCKSIZE - 2);
        });
    },

    leftIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var left = this.blocks[i]._position().left;
            var bottom = this.blocks[i]._position().bottom;
            if (left < BLOCKSIZE) return false;
    
            var temp = squaresStorage.filter(function(item) {
                if (item._position().left === left - BLOCKSIZE && item._position().bottom  === bottom) return item;
            })
            if (temp.length > 0) return false;
        }
        return true;
    },

    rightIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
         var left = this.blocks[i]._position().left;
            var bottom = this.blocks[i]._position().bottom;

            if (left > BLOCKSIZE*10) return false;

            var temp = squaresStorage.filter(function(item) {
                if (item._position().left === left + BLOCKSIZE && item._position().bottom  === bottom) return item;
            })
            if (temp.length > 0) return false;
        }
        return true;
    },

    bottomIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var left = this.blocks[i]._position().left;
            var bottom = this.blocks[i]._position().bottom;

            var temp = squaresStorage.filter(function(item) {
                if (item._position().bottom === bottom + BLOCKSIZE && item._position().left === left) return item;
            })
        if (temp.length > 0) return false;

            if (bottom === BLOCKSIZE*18 + 1) return false;
        }
        return true;
    },

    enoughSpaceForRotation: function() {
        var blocksToCheck = [];
        for (var i = 0; i < 4; i ++) {
               blocksToCheck[i] = {
                  top:  this.blocks[i]._position().top,
                  left: this.blocks[i]._position().left,
                  _moveBlock: function(offsetX, offsetY) {
                          this.left = this.left + offsetX*BLOCKSIZE - 2;
                          this.top = this.top + offsetY*BLOCKSIZE - 2;
                      }
                  }
              }
        var testBlocks = this.rotate(blocksToCheck, this.currentRotation);
        for(var i = 0; i < 4; i ++) {
            if (testBlocks[i].left > 401 || testBlocks[i].left < 1) {
                return false;
            }
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

function nextStep () {
    if (shape.bottomIsEmpty()) {
        shape.moveDown();
        setTimeout(nextStep, speed);
    }
    else {
        shape.blocks.forEach(function (square) {
            squaresStorage.push(square)
        });
        var temp = shape.blocks.filter(function(item) {
                if (item._position().bottom === BLOCKSIZE+1) return item;
            })
        if (!temp.length) {
            checkLines();
            newShape();
        }
    }
}

function newSquare(xOffset, yOffset, rand) {
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
}

function shapeFactory(type) {
    while (shape.blocks.length) {
            shape.blocks.pop();
    }

    switch(type) {
        case 0:
            newSquare(1,0,type);
            newSquare(0,1,type);
            newSquare(1,1,type);
            newSquare(2,1,type);
            break;     
        case 1:
            newSquare(0,0,type);
            newSquare(0,1,type);
            newSquare(1,1,type);
            newSquare(1,0,type);
            break;
        case 2:
            newSquare(1,0,type);
            newSquare(1,1,type);
            newSquare(1,2,type);
            newSquare(1,3,type);
            break;
        case 3:
            newSquare(0,0,type);
            newSquare(0,1,type);
            newSquare(1,1,type);
            newSquare(2,1,type);
            break;
    }
}

function newShape() {
    shape.shapeType = randomNumber(0,3);
    shape.currentRotation = 0;
    shapeFactory(shape.shapeType);
    setTimeout(nextStep, speed);
}

drawGrid();
newShape();
}) ();
