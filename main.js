
var svg = d3.select('.content').append('svg');

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

const BLOCKSIZE = 38;

var squaresStorage = [];

window.addEventListener("keydown", moveSquare, false);

var shape = {
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
                if (item.x === left - 40 && item.y  === bottom) return item;
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
                if (item.x === left + 40 && item.y  === bottom) return item;
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
                if (item.y === bottom + 40 && item.x === left) return item;
            })
        if (temp.length > 0) return false;

            if (bottom === 721) return false;
        }
        return true;
    },

    rotate : function () {
        
    }
};

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
        }
}

var nextStep = function () {
    if (shape.bottomIsEmpty()) {
        shape.moveDown();
        setTimeout(nextStep, 250);
    }
    else {
        shape.blocks.forEach(function (square) {
         square
           squaresStorage.push(
                {
                    'x': square.position().left,
                    'y': square.position().bottom
                }
            )
        });
        if (shape.blocks[3].position().bottom != 41) {
            newShape();
        }
    }
}

var newSquare = function (xOffset, yOffset, rand) {
    var square = svg.append('rect')
        .attr('x', 201 + xOffset*40)
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
            square.attr("fill", "#FFA500")
            break;
        case 3:
            square.attr("fill", "#00FF00")
            break;
    }

    shape.blocks.push(square);
}

var newShape = function  () {
    for (var i = 0; i < 4; i ++) {
        shape.blocks.pop();
    }

    var magicNumber = randomNumber(0,3);

    switch(magicNumber) {
        case 0:
            newSquare(1,0,magicNumber);
            newSquare(0,1,magicNumber);
            newSquare(1,1,magicNumber);
            newSquare(2,1,magicNumber);
            break;
        case 1:
            newSquare(0,0,magicNumber);
            newSquare(0,1,magicNumber);
            newSquare(1,1,magicNumber);
            newSquare(1,0,magicNumber);
            break;
        case 2:
            newSquare(0,0,magicNumber);
            newSquare(0,1,magicNumber);
            newSquare(0,2,magicNumber);
            newSquare(0,3,magicNumber);
            break;
        case 3:
            newSquare(0,0,magicNumber);
            newSquare(0,1,magicNumber);
            newSquare(1,1,magicNumber);
            newSquare(2,1,magicNumber);
            break;
    }
    setTimeout(nextStep, 250);
}

drawGrid();
newShape();

