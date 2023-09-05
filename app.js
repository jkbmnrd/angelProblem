const board = document.getElementById("board"); // allow for the board to be used
const gridSize = 50; // Board size is gridSize x gridSize tiles
const center = Math.floor(gridSize/2); // set the center tile of the grid
const border = []; // create empty array for border to fit

let angelPosition = {x: center, y: center };

// Selecting the value of k:
var k = 1; // Angel Movement Variable 
var kSelector = document.getElementById("kSelector"); // Dropdown Box

kSelector.addEventListener('change', function() { 
    var selectedK = kSelector.value;
    k = selectedK; // when new item selected, value of k changes
    console.log('Selected angel movement: ' + selectedK + ' tiles');
})

// Selecting the prototype devil intelligence:
var d = 0;
var dSelector = document.getElementById("dSelector"); // Dropdown Box

dSelector.addEventListener('change', function() { 
    var dType = dSelector.value;
    d = dType; // when new item selected, the devil's AI type changes
    console.log('The Devil will use the flawed type', dType, 'intelligence.');
})

// Commands:
startgame();

// Start the game:
function startgame() {
    createBoard();
}

// Random Number Generation
function rng(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Generating the "Checkerboard":
function createBoard() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");

            if (x == center && y == center) {
                tile.classList.add("moved");
                tile.classList.add("angel");
                tile.textContent = "A";
            }

            if (x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1) {
                tile.classList.add("border");
                border.push({ x, y });
            }

            tile.dataset.x = x; // Set data-x attribute
            tile.dataset.y = y; // Set data-y attribute

            tile.addEventListener("click", () => moveAngel(x,y));
            board.appendChild(tile);
            console.log('Board Generated.');
        }
    }
}

// Angel Movement (Through Clicks!)
function moveAngel(newX, newY) {
    console.log('Attempting movement.');
    const distX = Math.abs(newX - angelPosition.x);
    const distY = Math.abs(newY - angelPosition.y);
    
    // Ensure that the angel is moving either vertically, horizontally, or diagonally with a distance of k
    if (distX <= k && distY <= k) {
        const targetTile = document.querySelector(`.tile[data-x="${newX}"][data-y="${newY}"]`);
        
        // Check if the target tile is a devil tile or wall tile
        if (!targetTile.classList.contains("devil") && !targetTile.classList.contains("wall") && !targetTile.classList.contains("angel")) {
            const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);
            angelTile.textContent = " ";
            angelPosition.x = newX;
            angelPosition.y = newY;
            updateBoard();
        } else {
            console.log('Cannot move to this tile.');
        }
    }
}

// Updating the Board:
function updateBoard() {
    const tiles = document.querySelectorAll(".tile");
    tiles.forEach((tile) => tile.classList.remove("angel"));
    const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);
    angelTile.classList.add("moved");
    angelTile.classList.add("angel");
    angelTile.textContent = "A";
    devilFloor(d);
    console.log(d);
    winCondition();
}

// Border Win State:
function winCondition() {
    const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);

    if (border.some(tile => tile.x === angelPosition.x && tile.y === angelPosition.y)) {
        alert("Angel has reached a border tile! You win!");
    }
}

// Calculating the shortest distance to the border:
function calculateDistanceToBorder(x,y) {
    const distances = { // THIS CREATES THE ABILITY TO CALL "TOP, BOTTOM, LEFT, RIGHT"!!!
        top: y,
        bottom: gridSize - y - 1,
        left: x,
        right: gridSize - x - 1,
    };
    return distances;
}

// Find the closest border side to the angel
function findClosestBorder() {
    const distances = calculateDistanceToBorder(angelPosition.x, angelPosition.y);
    let closestBorder = 'top';
    let closestDistance = distances.top;

    for (const border of ['bottom', 'left', 'right']) {
        if (distances[border] < closestDistance) {
            closestBorder = border;
            closestDistance = distances[border];
        }
    }
    console.log(closestBorder);
    return closestBorder;
}

// Devil Intelligences:
 // Random Number Generation
 function rng(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Modify the devilFloor function to place the devil near the closest border
function devilFloor() {
    const closestBorder = findClosestBorder();
    const panicMode = panic();
    let devilX, devilY;

    if (panicMode === 'true') {
        switch (closestBorder) {
            case 'top':
                devilX = angelPosition.x;
                devilY = angelPosition.y - rng(3);
                break;
            case 'bottom':
                devilX = angelPosition.x;
                devilY = angelPosition.y + rng(3);
                break;
            case 'left':
                devilX = angelPosition.x - rng(3);
                devilY = angelPosition.y;
                break;
            case 'right':
                devilX = angelPosition.x + rng(3);
                devilY = angelPosition.y;
                break;
    } 
} else {
    switch (closestBorder) {
        case 'top':
            devilX = angelPosition.x;
            devilY = angelPosition.y - 5;
            break;
        case 'bottom':
            devilX = angelPosition.x;
            devilY = angelPosition.y + 5;
            break;
        case 'left':
            devilX = angelPosition.x - 5;
            devilY = angelPosition.y;
            break;
        case 'right':
            devilX = angelPosition.x + 5;
            devilY = angelPosition.y;
            break;
        default:
            break;
    }
}

    const devilTile = document.querySelector(`.tile[data-x="${devilX}"][data-y="${devilY}"]`);
    if (devilTile.classList.contains("border") || devilTile.classList.contains("devil")) {
        return;
    }
    devilTile.classList.add("devil");
    devilTile.textContent = "D";

    // Panic Mode
    function panic() {
        const distances = calculateDistanceToBorder(angelPosition.x, angelPosition.y);
        let closestBorder = 'top';
        let panicMode = 'false';
        let closestDistance = distances.top;

        for (const border of ['bottom', 'left', 'right']) {
            if (distances[border] < closestDistance) {
                closestBorder = border;
                closestDistance = distances[border];
            }
        }
        if (closestDistance <= 5) {
            panicMode = 'true';
            console.log("panic!");
            }
        return panicMode;
    }
} 