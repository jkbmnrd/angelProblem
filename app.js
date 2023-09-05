        // Constants
        const board = document.getElementById("board");
        const gridSize = 50; // Board size is gridSize x gridSize tiles
        const center = Math.floor(gridSize/2); // set the center tile of the grid
        const border = [];

        // Positional Determinants
        let angelPosition = {x: center, y: center };

        // Variables
        var k = 1; // Angel Movement Variable 
        var kSelector = document.getElementById("kSelector"); // Dropdown Box

        // Dropdown Box for Angel Movement
        kSelector.addEventListener('change', function() {
            var selectedK = kSelector.value;
            var k = selectedK;
            console.log('Selected angel movement: ' + selectedK + ' tiles');
        })

        // Generate Board
        function createBoard() {
            var angelPlaced = 0;
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const tile = document.createElement("div");
                    tile.classList.add("tile");

                    if (x == center && y == center) {
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
                }
            }
        }

        // Move Angel
        function moveAngel(newX, newY) {
            console.log('Attempting movement.');

            const distX = Math.abs(newX - angelPosition.x);
            const distY = Math.abs(newY - angelPosition.y);
            if (distX <= k && distY <= k) {
                const targetTile = document.querySelector(`.tile[data-x="${newX}"][data-y="${newY}"]`);
                
                // Check if the target tile is a devil tile
                if (!targetTile.classList.contains("devil")) {
                    const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);
                    angelTile.textContent = " ";
                    angelPosition.x = newX;
                    angelPosition.y = newY;
                    updateBoard();
                } else {
                    alert('Cannot move to a devil tile.');
                }
            }
        }

        // Update Board
        function updateBoard() {
            const tiles = document.querySelectorAll(".tile");
            tiles.forEach((tile) => tile.classList.remove("angel"));
            const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);
            angelTile.classList.add("angel");
            angelTile.textContent = "A";
            devilFloor();
            borderWin();
        }

        /* The Devil // (random movement)
        function devilFloor() {
            const devilX = Math.floor(Math.random() * gridSize);
            const devilY = Math.floor(Math.random() * gridSize);

            const devilTile = document.querySelector(`.tile[data-x="${devilX}"][data-y="${devilY}"]`);
            devilTile.classList.add("devil");
            devilTile.textContent = "D";
        }  */

        // The Border (Win Condition)
        function borderWin() {
            const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);

            if (border.some(tile => tile.x === angelPosition.x && tile.y === angelPosition.y)) {
                alert("Angel has reached a border tile! You win!");
            }
        }

        // Calculate the distance from the angel to each border
        function calculateDistanceToBorder(x, y) {
            const distances = {
                top: y,
                bottom: gridSize - y - 1,
                left: x,
                right: gridSize - x - 1
            };
            return distances;
        }

        // Find the closest border to the angel
        function findClosestBorder() {
            const distances = calculateDistanceToBorder(angelPosition.x, angelPosition.y);
            let closestBorder = 'top';
            let closestDistance = distances.top;

            for (const border of ['bottom', 'left', 'right']) {
                if (distances[border] < closestDistance) {
                    closestBorder = border;
                    closestDistance = distances[border];
                } /*else {
                    closestBorder = 'none';
                } */
            }

            return closestBorder;
        }

        /* Find closest devil tile to angel
        function findClosestDevil() {
            const angelX = angelPosition.x;
            const angelY = angelPosition.y;
            let closestDevilTile = null;
            let closestDistance = Infinity;
        
            // Iterate through all devil tiles and calculate their distances from the angel
            const devilTiles = document.querySelectorAll(".tile.devil");
            devilTiles.forEach((devilTile) => {
                const devilX = parseInt(devilTile.dataset.x);
                const devilY = parseInt(devilTile.dataset.y);
                const distance = Math.sqrt(Math.pow(angelX - devilX, 2) + Math.pow(angelY - devilY, 2));
        
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestDevilTile = devilTile;
                }
            });
            return closestDevilTile;
        } */

        // Modify the devilFloor function to place the devil near the closest border
        function devilFloor() {
            const closestBorder = findClosestBorder();
            //findClosestDevil();
            let devilX, devilY;

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
                /*case 'none':
                    devilX = closestDevilTile.x;
                    devilY = closestDevilTile.y;
                    break; */
                default:
                    break;
            }

            const devilTile = document.querySelector(`.tile[data-x="${devilX}"][data-y="${devilY}"]`);
            devilTile.classList.add("devil");
            devilTile.textContent = "D";
} 

createBoard();