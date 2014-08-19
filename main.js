
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
    for (var i = 0; i < 12; i++) {
        svg.append('line')
            .attr("x1", 40 * i)
            .attr("y1", 0)
            .attr("x2", 40 * i)
            .attr("y2", 720);
    }

    for (var i = 0; i < 19; i++) {
        svg.append('line')
            .attr("x1", 0)
            .attr("y1", 40 * i)
            .attr("x2", 440)
            .attr("y2", 40 * i);
    }
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
                    item.attr("y",item.position().top + BLOCKSIZE);
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

const BLOCKSIZE = 38;

var squaresStorage = [];

var lines = [721, 681, 641, 601, 561, 521, 481, 441, 401, 361, 321, 281, 241, 201, 161, 121, 81];

window.addEventListener("keydown", moveSquare, false);

var shape = {
    shapeType: 0,
    currentRotation: 0,
    blocks : [],

    moveDown : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("y",square.position().top + BLOCKSIZE);
        });
    },

    toLeft : function () {
        this.blocks.forEach(function (square) {
            square
                .attr("x",square.position().left - 42); //no ides, why it should be 42
        });
    },

    toRight : function () {
         this.blocks.forEach(function (square) {
            square
                .attr("x",square.position().left + BLOCKSIZE);
        });
    },

    leftIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
            var left = this.blocks[i].position().left;
            var bottom = this.blocks[i].position().bottom;
            if (left < 40) return false;
    
            var temp = squaresStorage.filter(function(item) {
                if (item.position().left === left - 40 && item.position().bottom  === bottom) return item;
            })
            if (temp.length > 0) return false;
        }
        return true;
    },

    rightIsEmpty : function () {
        for (var i = 0; i < 4; i++ ) {
         var left = this.blocks[i].position().left;
            var bottom = this.blocks[i].position().bottom;

            if (left > 400) return false;

            var temp = squaresStorage.filter(function(item) {
                if (item.position().left === left + 40 && item.position().bottom  === bottom) return item;
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
                if (item.position().bottom === bottom + 40 && item.position().left === left) return item;
            })
        if (temp.length > 0) return false;

            if (bottom === 721) return false;
        }
        return true;
    },

    enoughSpaceForRotation: function() {
        return true;
    },

    rotate : function () {
        switch (this.shapeType) {
            case 0:
                switch (this.currentRotation) {
                    case 0:
                        this.blocks[0].attr('x', this.blocks[0].position().left + 38)
                        this.blocks[0].attr('y', this.blocks[0].position().top + 38)

                        this.blocks[3].attr('x', this.blocks[3].position().left - 42)
                        this.blocks[3].attr('y', this.blocks[3].position().top + 38)

                        this.blocks[1].attr('x', this.blocks[1].position().left + 38)
                        this.blocks[1].attr('y', this.blocks[1].position().top - 42)

                        this.currentRotation = 90;
                        break;
                    case 90:
                        this.blocks[0].attr('x', this.blocks[0].position().left - 42);
                        this.blocks[0].attr('y', this.blocks[0].position().top + 38)

                        this.blocks[3].attr('x', this.blocks[3].position().left - 42)
                        this.blocks[3].attr('y', this.blocks[3].position().top - 42)

                        this.blocks[1].attr('x', this.blocks[1].position().left + 38)
                        this.blocks[1].attr('y', this.blocks[1].position().top + 38)

                        this.currentRotation = 180;
                        break;
                    case 180:
                        this.blocks[0].attr('x', this.blocks[0].position().left - 42)
                        this.blocks[0].attr('y', this.blocks[0].position().top  - 42)

                        this.blocks[3].attr('x', this.blocks[3].position().left + 38)
                        this.blocks[3].attr('y', this.blocks[3].position().top - 42)

                        this.blocks[1].attr('x', this.blocks[1].position().left - 42)
                        this.blocks[1].attr('y', this.blocks[1].position().top + 38)

                        this.currentRotation = 270;
                        break;
                    case 270:
                        this.blocks[0].attr('x', this.blocks[0].position().left + 38)
                        this.blocks[0].attr('y', this.blocks[0].position().top - 42)

                        this.blocks[3].attr('x', this.blocks[3].position().left + 38)
                        this.blocks[3].attr('y', this.blocks[3].position().top + 38)

                        this.blocks[1].attr('x', this.blocks[1].position().left - 42)
                        this.blocks[1].attr('y', this.blocks[1].position().top - 42)

                        this.currentRotation = 0;
                        break;
                }
                break;

            case 2:
                switch (this.currentRotation) {
                    case 0:
                        this.blocks[0].attr('x', this.blocks[0].position().left + 78)
                        this.blocks[0].attr('y', this.blocks[0].position().top + 78)

                        this.blocks[3].attr('x', this.blocks[3].position().left - 42)
                        this.blocks[3].attr('y', this.blocks[3].position().top - 42)

                        this.blocks[1].attr('x', this.blocks[1].position().left + 38)
                        this.blocks[1].attr('y', this.blocks[1].position().top + 38)

                        this.currentRotation = 90;
                        break;
                    case 90:
                        this.blocks[0].attr('x', this.blocks[0].position().left - 82);
                        this.blocks[0].attr('y', this.blocks[0].position().top + 78)

                        this.blocks[3].attr('x', this.blocks[3].position().left + 38)
                        this.blocks[3].attr('y', this.blocks[3].position().top - 42)

                        this.blocks[1].attr('x', this.blocks[1].position().left -42)
                        this.blocks[1].attr('y', this.blocks[1].position().top + 38)

                        this.currentRotation = 180;
                        break;
                    case 180:
                        this.blocks[0].attr('x', this.blocks[0].position().left - 82)
                        this.blocks[0].attr('y', this.blocks[0].position().top  - 82)

                        this.blocks[3].attr('x', this.blocks[3].position().left + 38)
                        this.blocks[3].attr('y', this.blocks[3].position().top + 38)

                        this.blocks[1].attr('x', this.blocks[1].position().left - 42)
                        this.blocks[1].attr('y', this.blocks[1].position().top - 42)

                        this.currentRotation = 270;
                        break;
                    case 270:
                        this.blocks[0].attr('x', this.blocks[0].position().left + 78)
                        this.blocks[0].attr('y', this.blocks[0].position().top - 82)

                        this.blocks[3].attr('x', this.blocks[3].position().left - 42)
                        this.blocks[3].attr('y', this.blocks[3].position().top + 38)

                        this.blocks[1].attr('x', this.blocks[1].position().left + 38)
                        this.blocks[1].attr('y', this.blocks[1].position().top - 42)

                        this.currentRotation = 0;
                        break;
                }
                break;

             case 3:
                switch (this.currentRotation) {
                    case 0:
                        this.blocks[0].attr('x', this.blocks[0].position().left + 38)
                        this.blocks[0].attr('y', this.blocks[0].position().top + 38)

                        this.blocks[3].attr('x', this.blocks[3].position().left - 82)
                        this.blocks[3].attr('y', this.blocks[3].position().top + 78)

                        this.blocks[2].attr('x', this.blocks[2].position().left - 42)
                        this.blocks[2].attr('y', this.blocks[2].position().top + 38)

                        this.currentRotation = 90;
                        break;
                    case 90:
                        this.blocks[0].attr('x', this.blocks[0].position().left - 42);
                        this.blocks[0].attr('y', this.blocks[0].position().top + 38)

                        this.blocks[3].attr('x', this.blocks[3].position().left - 82)
                        this.blocks[3].attr('y', this.blocks[3].position().top - 82)

                        this.blocks[2].attr('x', this.blocks[1].position().left - 42)
                        this.blocks[2].attr('y', this.blocks[2].position().top  - 42)

                        this.currentRotation = 180;
                        break;
                    case 180:
                        this.blocks[0].attr('x', this.blocks[0].position().left - 42)
                        this.blocks[0].attr('y', this.blocks[0].position().top  - 42)

                        this.blocks[3].attr('x', this.blocks[3].position().left + 78)
                        this.blocks[3].attr('y', this.blocks[3].position().top - 82)

                        this.blocks[2].attr('x', this.blocks[2].position().left + 38)
                        this.blocks[2].attr('y', this.blocks[2].position().top - 42)

                        this.currentRotation = 270;
                        break;
                    case 270:
                        this.blocks[0].attr('x', this.blocks[0].position().left + 38)
                        this.blocks[0].attr('y', this.blocks[0].position().top - 42)

                        this.blocks[3].attr('x', this.blocks[3].position().left + 78)
                        this.blocks[3].attr('y', this.blocks[3].position().top + 78)

                        this.blocks[2].attr('x', this.blocks[2].position().left + 38)
                        this.blocks[2].attr('y', this.blocks[2].position().top + 38)

                        this.currentRotation = 0;
                        break;
                }
                break;
        }
    }
};

var nextStep = function () {
    if (shape.bottomIsEmpty()) {
        shape.moveDown();
        setTimeout(nextStep, speed);
    }
    else {
        shape.blocks.forEach(function (square) {
            squaresStorage.push(square)
        });
        var temp = shape.blocks.filter(function(item) {
                if (item.position().bottom === 41) return item;
            })
        if (!temp.length) {
            checkLines();
            newShape();
        }
    }
}

var newSquare = function (xOffset, yOffset, rand) {
    var square = svg.append('rect')
        .attr('x', 161 + xOffset*40)
        .attr('y', 1 + yOffset*40)
        .attr('width', BLOCKSIZE)
        .attr('height', BLOCKSIZE)
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

var shapeFactory = function(type) {
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

var newShape = function  () {

    shape.shapeType = randomNumber(0,3);
    shape.currentRotation = 0;
    shapeFactory(shape.shapeType);
    
    setTimeout(nextStep, speed);
}

drawGrid();
newShape();

