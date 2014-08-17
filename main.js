
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

var square;

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
        }
}

var nextStep = function () {
    if (bottomIsEmpty()) {
        square
            .attr("y",square.position().top + 38);
        setTimeout(nextStep, 250);
    }
    else {
        squaresStorage.push(
                {
                    'x': square.position().left,
                    'y': square.position().bottom
                }
            )
        newSquare();
    }
}

var newSquare = function () {
    square = svg.append('rect')
        .attr('x', 201)
        .attr('y', 1)
        .attr('width', 38)
        .attr('height', 38)

    setTimeout(nextStep, 250);
}

var toLeft = function () {
    square
        .attr("x",square.position().left - 42);
}

var toRight = function () {
    square
        .attr("x",square.position().left + 38);
}

var leftIsEmpty = function () {
    var left = square.position().left;
    var bottom = square.position().bottom;
    if (left < 40) return false;

    var temp = squaresStorage.filter(function(item) {
        if (item.x === left - 40 && item.y  === bottom) return item;
    })
    if (temp.length > 0) return false;

    return true;
}

var rightIsEmpty = function () {
    var left = square.position().left;
    var bottom = square.position().bottom;

    if (square.position().right > 440) return false;

    var temp = squaresStorage.filter(function(item) {
        if (item.x === left + 40 && item.y  === bottom) return item;
    })
    if (temp.length > 0) return false;

    return true;
}

var bottomIsEmpty = function () {
    var left = square.position().left;
    var bottom = square.position().bottom;

    var temp = squaresStorage.filter(function(item) {
        if (item.y === bottom + 40 && item.x === left) return item;
    })
    if (temp.length > 0) return false;

    if (bottom === 721) return false;

    return true;
}

drawGrid();
newSquare();

