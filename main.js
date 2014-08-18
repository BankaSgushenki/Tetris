
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

var shape = [];

var squaresStorage = [];

window.addEventListener("keydown", moveSquare, false);

function moveSquare(e) {
     switch (e.keyCode) {
       case 37:
            if (leftIsEmpty()) {
                toLeft(); 
            }
            break;
        case 39:
            if (rightIsEmpty()) {
                toRight();
            }
            break;
        case 40:
            if (bottomIsEmpty()) {
                moveDown();
            }
            break;
        }
}

var nextStep = function () {
    if (bottomIsEmpty()) {
        moveDown();
        setTimeout(nextStep, 250);
    }
    else {
        shape.forEach(function (square) {
         square
           squaresStorage.push(
                {
                    'x': square.position().left,
                    'y': square.position().bottom
                }
            )
        });
        if (shape[3].position().bottom != 41) {
            newShape();
        }
    }
}

var moveDown = function () {
    shape.forEach(function (square) {
         square
            .attr("y",square.position().top + 38);
    })
}

var newSquare = function (xOffset, yOffset) {
    var square = svg.append('rect')
        .attr('x', 201 + xOffset*40)
        .attr('y', 1 + yOffset*40)
        .attr('width', 38)
        .attr('height', 38)

    shape.push(square);
}

var newShape = function  () {
    for (var i = 0; i < 4; i ++) {
        shape.pop();
    }

    var magicNumber = randomNumber(0,3)

    switch(magicNumber) {
        case 0:
            newSquare(1,0);
            newSquare(0,1);
            newSquare(1,1);
            newSquare(2,1);
            break;
        case 1:
            newSquare(0,0);
            newSquare(0,1);
            newSquare(1,1);
            newSquare(1,0);
            break;
        case 2:
            newSquare(0,0);
            newSquare(0,1);
            newSquare(0,2);
            newSquare(0,3);
            break;
        case 3:
            newSquare(0,0);
            newSquare(0,1);
            newSquare(1,1);
            newSquare(2,1);
            break;
    }
    setTimeout(nextStep, 250);
}

var rotate = function () {

}

var toLeft = function () {
    shape.forEach(function (square) {
         square
           .attr("x",square.position().left - 42);
    });
}

var toRight = function () {
    shape.forEach(function (square) {
        square
           .attr("x",square.position().left + 38);
    });
}

var leftIsEmpty = function () {
    for (var i = 0; i < 4; i++ ) {
        var left = shape[i].position().left;
        var bottom = shape[i].position().bottom;
        if (left < 40) return false;

        var temp = squaresStorage.filter(function(item) {
            if (item.x === left - 40 && item.y  === bottom) return item;
        })
        if (temp.length > 0) return false;
    }

    return true;
}

var rightIsEmpty = function () {
    for (var i = 0; i < 4; i++ ) {
        var left = shape[i].position().left;
        var bottom = shape[i].position().bottom;

        if (left > 400) return false;

        var temp = squaresStorage.filter(function(item) {
            if (item.x === left + 40 && item.y  === bottom) return item;
        })
        if (temp.length > 0) return false;
    }

    return true;
}

var bottomIsEmpty = function () {
    for (var i = 0; i < 4; i++ ) {
        var left = shape[i].position().left;
        var bottom = shape[i].position().bottom;

        var temp = squaresStorage.filter(function(item) {
            if (item.y === bottom + 40 && item.x === left) return item;
        })
        if (temp.length > 0) return false;

        if (bottom === 721) return false;
    }

    return true;
}

drawGrid();
newShape();

