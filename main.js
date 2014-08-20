
(function () {
var svg = d3.select('.game-space').append('svg');

d3.selection.prototype.position = function() {
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
            .attr('x', ((square.position.left()-1)/40) * BLOCKSIZE + 1)
            .attr('y', ((square.position.top()-1)/40) * BLOCKSIZE + 1)
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
            if (item.position().bottom === lines[i]) return item;
        })

        if(temp.length === 11) {
            squaresStorage = squaresStorage.filter(function(item) {
                if (item.position().bottom != lines[i])  {
                    return item;
                }
                else item.remove();
            })
            squaresStorage.forEach(function (item) {
                if(item.position().top < lines[i]) {
                    item
                        .attr("y",item.position().top + BLOCKSIZE - 2);
                }
            });
        document.querySelector(".score").innerText = "Score: " + ++score + ". Speed: " + speedCounter + "";
        if(score % 5 === 0) {
            speed = speed - 25;
            speedCounter++;
        }
        i--;
        }
    }
}

var score = 0;

var speed = 250;

var speedCounter = 1;

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
                .attr("y",square.position().top + BLOCKSIZE - 2);
        });
    },

    toLeft : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("x",square.position().left - BLOCKSIZE - 2); //no ideas, why it should be 42
        });
    },

    toRight : function () {
         this.blocks.forEach(function (square) {
            square
                .attr("x",square.position().left + BLOCKSIZE - 2);
        });
    },

    leftIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var left = this.blocks[i].position().left;
            var bottom = this.blocks[i].position().bottom;
            if (left < BLOCKSIZE) return false;
    
            var temp = squaresStorage.filter(function(item) {
                if (item.position().left === left - BLOCKSIZE && item.position().bottom  === bottom) return item;
            })
            if (temp.length > 0) return false;
        }
        return true;
    },

    rightIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
         var left = this.blocks[i].position().left;
            var bottom = this.blocks[i].position().bottom;

            if (left > BLOCKSIZE*10) return false;

            var temp = squaresStorage.filter(function(item) {
                if (item.position().left === left + BLOCKSIZE && item.position().bottom  === bottom) return item;
            })
            if (temp.length > 0) return false;
        }
        return true;
    },

    bottomIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var left = this.blocks[i].position().left;
            var bottom = this.blocks[i].position().bottom;

            var temp = squaresStorage.filter(function(item) {
                if (item.position().bottom === bottom + BLOCKSIZE && item.position().left === left) return item;
            })
        if (temp.length > 0) return false;

            if (bottom === BLOCKSIZE*18 + 1) return false;
        }
        return true;
    },

    enoughSpaceForRotation: function() {
        return true;
    },

    rotate : function () {
        var positiveOffset = BLOCKSIZE - 2;
        var negativeOffset = BLOCKSIZE + 2
        switch (this.shapeType) {
            case 0:
                switch (this.currentRotation) {
                    case 0:
                        this.blocks[0].attr('x', this.blocks[0].position().left + positiveOffset)
                        this.blocks[0].attr('y', this.blocks[0].position().top + positiveOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left - negativeOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top + positiveOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left + positiveOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top - negativeOffset)

                        this.currentRotation = 90;
                        break;
                    case 90:
                        this.blocks[0].attr('x', this.blocks[0].position().left - negativeOffset);
                        this.blocks[0].attr('y', this.blocks[0].position().top + positiveOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left - negativeOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top - negativeOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left + positiveOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top + positiveOffset)

                        this.currentRotation = 180;
                        break;
                    case 180:
                        this.blocks[0].attr('x', this.blocks[0].position().left - negativeOffset)
                        this.blocks[0].attr('y', this.blocks[0].position().top  - negativeOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left + positiveOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top - negativeOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left - negativeOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top + positiveOffset)

                        this.currentRotation = 270;
                        break;
                    case 270:
                        this.blocks[0].attr('x', this.blocks[0].position().left + positiveOffset)
                        this.blocks[0].attr('y', this.blocks[0].position().top - negativeOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left + positiveOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top + positiveOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left - negativeOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top - negativeOffset)

                        this.currentRotation = 0;
                        break;
                }
                break;

            case 2:
                switch (this.currentRotation) {
                    case 0:
                        this.blocks[0].attr('x', this.blocks[0].position().left + positiveOffset + BLOCKSIZE)
                        this.blocks[0].attr('y', this.blocks[0].position().top + positiveOffset + BLOCKSIZE)

                        this.blocks[3].attr('x', this.blocks[3].position().left - negativeOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top - negativeOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left + positiveOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top + positiveOffset)

                        this.currentRotation = 90;
                        break;
                    case 90:
                        this.blocks[0].attr('x', this.blocks[0].position().left - negativeOffset - BLOCKSIZE);
                        this.blocks[0].attr('y', this.blocks[0].position().top + positiveOffset + BLOCKSIZE)

                        this.blocks[3].attr('x', this.blocks[3].position().left + positiveOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top - negativeOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left -negativeOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top + positiveOffset)

                        this.currentRotation = 180;
                        break;
                    case 180:
                        this.blocks[0].attr('x', this.blocks[0].position().left - negativeOffset - BLOCKSIZE)
                        this.blocks[0].attr('y', this.blocks[0].position().top  - negativeOffset - BLOCKSIZE)

                        this.blocks[3].attr('x', this.blocks[3].position().left + positiveOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top + positiveOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left - negativeOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top - negativeOffset)

                        this.currentRotation = 270;
                        break;
                    case 270:
                        this.blocks[0].attr('x', this.blocks[0].position().left + positiveOffset + BLOCKSIZE)
                        this.blocks[0].attr('y', this.blocks[0].position().top - negativeOffset - BLOCKSIZE)

                        this.blocks[3].attr('x', this.blocks[3].position().left - negativeOffset)
                        this.blocks[3].attr('y', this.blocks[3].position().top + positiveOffset)

                        this.blocks[1].attr('x', this.blocks[1].position().left + positiveOffset)
                        this.blocks[1].attr('y', this.blocks[1].position().top - negativeOffset)

                        this.currentRotation = 0;
                        break;
                }
                break;

             case 3:
                switch (this.currentRotation) {
                    case 0:
                        this.blocks[0].attr('x', this.blocks[0].position().left + positiveOffset)
                        this.blocks[0].attr('y', this.blocks[0].position().top + positiveOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left - negativeOffset - BLOCKSIZE)
                        this.blocks[3].attr('y', this.blocks[3].position().top + positiveOffset + BLOCKSIZE)

                        this.blocks[2].attr('x', this.blocks[2].position().left - negativeOffset)
                        this.blocks[2].attr('y', this.blocks[2].position().top + positiveOffset)

                        this.currentRotation = 90;
                        break;
                    case 90:
                        this.blocks[0].attr('x', this.blocks[0].position().left - negativeOffset);
                        this.blocks[0].attr('y', this.blocks[0].position().top + positiveOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left - negativeOffset - BLOCKSIZE)
                        this.blocks[3].attr('y', this.blocks[3].position().top - negativeOffset - BLOCKSIZE)

                        this.blocks[2].attr('x', this.blocks[1].position().left - negativeOffset)
                        this.blocks[2].attr('y', this.blocks[2].position().top  - negativeOffset)

                        this.currentRotation = 180;
                        break;
                    case 180:
                        this.blocks[0].attr('x', this.blocks[0].position().left - negativeOffset)
                        this.blocks[0].attr('y', this.blocks[0].position().top  - negativeOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left + positiveOffset + BLOCKSIZE)
                        this.blocks[3].attr('y', this.blocks[3].position().top - negativeOffset - BLOCKSIZE)

                        this.blocks[2].attr('x', this.blocks[2].position().left + positiveOffset)
                        this.blocks[2].attr('y', this.blocks[2].position().top - negativeOffset)

                        this.currentRotation = 270;
                        break;
                    case 270:
                        this.blocks[0].attr('x', this.blocks[0].position().left + positiveOffset)
                        this.blocks[0].attr('y', this.blocks[0].position().top - negativeOffset)

                        this.blocks[3].attr('x', this.blocks[3].position().left + positiveOffset + BLOCKSIZE)
                        this.blocks[3].attr('y', this.blocks[3].position().top + positiveOffset + BLOCKSIZE)

                        this.blocks[2].attr('x', this.blocks[2].position().left + positiveOffset)
                        this.blocks[2].attr('y', this.blocks[2].position().top + positiveOffset)

                        this.currentRotation = 0;
                        break;
                }
                break;
        }
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
                if (item.position().bottom === BLOCKSIZE+1) return item;
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
