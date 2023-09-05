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
            k = selectedK;
            console.log('Selected angel movement: ' + selectedK + ' tiles');
        })

        // Generate Board
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
                }
            }
        }

        // Move Angel
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
                    blockOneStepToBorder();
                    updateBoard();
                } else {
                    console.log('Cannot move to this tile.');
                }
            }
        }
        

        // Function to Update Board and Play Devil Movement
        function updateBoard() {
            const tiles = document.querySelectorAll(".tile");
            tiles.forEach((tile) => tile.classList.remove("angel"));
            const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);
            angelTile.classList.add("moved");
            angelTile.classList.add("angel");
            angelTile.textContent = "A";
            borderWin();
        }

        // Border Win State
        function borderWin() {
            const angelTile = document.querySelector(`.tile[data-x="${angelPosition.x}"][data-y="${angelPosition.y}"]`);

            if (border.some(tile => tile.x === angelPosition.x && tile.y === angelPosition.y)) {
                alert("Angel has reached a border tile! You win!");
            }
        }

        function calculateDistanceToBorder(x, y) {
            const distances = {
              top: y,
              bottom: gridSize - y - 1,
              left: x,
              right: gridSize - x - 1,
            };
            return Math.min(...Object.values(distances));
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
                }
            }
            console.log(closestBorder);
            return closestBorder;
        }

        // Random Number Generation
        function rng(max) {
            return Math.floor(Math.random() * max) + 1;
        }

        class Node {
            constructor(x, y, parent = null, g = 0, h = 0) {
              this.x = x;
              this.y = y;
              this.parent = parent;
              this.g = g;
              this.h = h;
            }
          
            get f() {
              return this.g + this.h;
            }
          }
          
          function findShortestPathToBorder() {
            const openSet = [];
            const closedSet = [];
            const startNode = new Node(angelPosition.x, angelPosition.y);
            openSet.push(startNode);
          
            while (openSet.length > 0) {
              // Find the node with the lowest f value in the open set
              let currentNode = openSet[0];
              for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < currentNode.f) {
                  currentNode = openSet[i];
                }
              }
          
              // Move the current node from open set to closed set
              openSet.splice(openSet.indexOf(currentNode), 1);
              closedSet.push(currentNode);
          
              // Check if the current node is at the border
              if (border.some((tile) => tile.x === currentNode.x && tile.y === currentNode.y)) {
                return reconstructPath(currentNode);
              }
          
              // Generate neighbor nodes
                const neighbors = [
                    new Node(currentNode.x, currentNode.y - 1, currentNode),
                    new Node(currentNode.x, currentNode.y + 1, currentNode),
                    new Node(currentNode.x - 1, currentNode.y, currentNode),
                    new Node(currentNode.x + 1, currentNode.y, currentNode),
                    new Node(currentNode.x - 1, currentNode.y - 1, currentNode),
                    new Node(currentNode.x + 1, currentNode.y - 1, currentNode),
                    new Node(currentNode.x - 1, currentNode.y + 1, currentNode),
                    new Node(currentNode.x + 1, currentNode.y + 1, currentNode),
                ];
          
              for (const neighbor of neighbors) {
                if (closedSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                  continue;
                }
          
                if (
                  !neighborNodeIsBlocked(neighbor) &&
                  !openSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)
                ) {
                  neighbor.g = currentNode.g + 1;
                  neighbor.h = calculateDistanceToBorder(neighbor.x, neighbor.y);
                  openSet.push(neighbor);
                }
              }
            }
          
            // If no path is found, return null
            return null;
          }
          
          function neighborNodeIsBlocked(node) {
            const tile = document.querySelector(`.tile[data-x="${node.x}"][data-y="${node.y}"]`);
            return tile.classList.contains("devil") || tile.classList.contains("angel");
          }
          
          function reconstructPath(node) {
            const path = [];
            while (node !== null) {
              path.unshift({ x: node.x, y: node.y });
              node = node.parent;
            }
            return path;
          }
          
          function blockOneStepToBorder() {
            const path = findShortestPathToBorder();
            if (path) {
                for (let i = 1; i < path.length - 1; i++) {
                    const step = path[i];
                    if (step) {
                        const tile = document.querySelector(`.tile[data-x="${step.x}"][data-y="${step.y}"]`);
                    }
                }
            }
        }
          

          function startGame() {
            createBoard();
          }
          
          startGame();







        // Devil Intelligence
        /*function devilFloor() {
            const closestBorder = findClosestBorder(); //determine closest border (top, left, right, bottom)
            let devilDistX = 0;
            let devilDistY = 0;
            let alternativePlacementX = false;
            let alternativePlacementY = false;
            const devilTiles = document.querySelectorAll(".tile.devil");
            const devilTilesArray = Array.from(devilTiles).map(tile => ({
                x: parseInt(tile.dataset.x),
                y: parseInt(tile.dataset.y)
            }));
            console.log(devilTilesArray);
            let devilX = [];
            let devilY = [];

            if (devilDistX > devilDistY && devilDistX < 5) {
                alternativePlacementX = true;
                console.log("placement X =", alternativePlacementX);
            } else if (devilDistY > devilDistX && devilDistY < 5) {
                alternativePlacementY = true;
                console.log("placement Y =", alternativePlacementY);
            }

            if (devilTiles.length === 0) {
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

            if (angelPosition.y === 23 && devilTiles.length === 1) {
                devilX = 27;
                devilY = 19;
            }

            if (angelPosition.y === 22 && devilTiles.length === 2) {
                devilX = 23;
                devilY = 19;
            }

            if (angelPosition.y === 21 && angelPosition.x === 25 && devilTiles.length === 3) {
                devilX = 24;
                devilY = 19;
            }

            if (angelPosition.y === 20 && angelPosition.x === 25 && devilTiles.length === 4) {
                devilX = 26;
                devilY = 19;
            }

        const devilTile = document.querySelector(`.tile[data-x="${devilX}"][data-y="${devilY}"]`);
        devilTile.classList.add("devil");
        devilTile.textContent = "D";

    }
            /*const closestBorder = findClosestBorder(); //determine closest border (top, left, right, bottom)
            let devilDistX = 0;
            let devilDistY = 0;
            let alternativePlacementX = false;
            let alternativePlacementY = false;
            const devilTiles = document.querySelectorAll(".tile.devil");
            const devilTilesArray = Array.from(devilTiles).map(tile => ({
                x: parseInt(tile.dataset.x),
                y: parseInt(tile.dataset.y)
            }));
            console.log(devilTilesArray);

            for (const devilDistance of devilTilesArray) {
                devilDistX = Math.abs(angelPosition.x - devilDistance.x);
                devilDistY = Math.abs(angelPosition.y - devilDistance.y);
                console.log(devilDistX);
                console.log(devilDistY);
            }

            let devilX = 0; // initialize devil
            let devilY = 0; // initialize devil

            if (devilDistX > devilDistY && devilDistX < 5) {
                alternativePlacementX = true;
                console.log("placement X =", alternativePlacementX);
            } else if (devilDistY > devilDistX && devilDistY < 5) {
                alternativePlacementY = true;
                console.log("placement Y =", alternativePlacementY);
            }

            if (alternativePlacementX === true) {
                switch (closestBorder) {
                    case 'top' || 'bottom':
                        devilX = angelPosition.x++;
                        devilY = angelPosition.y + devilDistY;
                        console.log("attempting");

                    break;
                    case 'left' || 'right':



                    break;
                }
            } else if (alternativePlacementY === true) {
                switch (closestBorder) {
                    case 'top' || 'bottom':
                        devilX = angelPosition.x + 1;
                        devilY = angelPosition.y + devilDistY;
                        
                        console.log("attempting");
                        break;
                        
                    case 'left' || 'right':



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

            if (devil = 0) {
                devil = 1; // first tile disabled
            }

            console.log(devilX, devilY);

            const devilTile = document.querySelector(`.tile[data-x="${devilX}"][data-y="${devilY}"]`);
            devilTile.classList.add("devil");
            devilTile.textContent = "D";
        } */



            /*const closestBorder = findClosestBorder();
            let devilX, devilY;

            const devilTilesArray = [];
            const devilTiles = document.querySelectorAll(".tile.devil");
            devilTiles.forEach(function(devilDistance) {
                const x = parseInt(devilDistance.dataset.x);
                const y = parseInt(devilDistance.dataset.y);
                devilTilesArray.push({ x, y });
            });
            console.log(devilTilesArray);
            console.log(angelPosition);

            let closestDevilX = 5;
            let closestDevilY = 5;
            for (const devilDistance of devilTilesArray) {
                const devilDistX = Math.abs(angelPosition.x - devilDistance.x);
                const devilDistY = Math.abs(angelPosition.y - devilDistance.y);
                if (closestDevilX < devilDistX) {
                    closestDevilX = { x: devilDistance.x, y: devilDistance.y };
                    console.log(closestDevilX);
                }
                if (closestDevilY < devilDistY) {
                    closestDevilY = { x: devilDistance.x, y: devilDistance.y };
                    console.log(closestDevilY);
                }
            }

            let closestTile = 5000;
            if (closestDevilY > closestDevilX) {
                closestTile = (closestDevilY.y - angelPosition.y);
            } else {
                closestTile = (closestDevilY.y - angelPosition.y);
            }
            
            if (closestTile <= 4) {
                switch (closestBorder) {
                    case 'top':
                        devilX = closestDevilX + 1;
                        devilY = angelPosition.y;
                        break;
                    case 'bottom':
                        devilX = closestDevilX - 1;
                        devilY = angelPosition.y;
                        break;
                    case 'left':
                        devilX = angelPosition.x;
                        devilY = closestDevilY + 1;
                        break;
                    case 'right':
                        devilX = angelPosition.x;
                        devilY = closestDevilY - 1;
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
            devilTile.classList.add("devil");
            devilTile.textContent = "D";
} */



/* Placement Prevention (Future)

            if ((devilTile.classList.contains("border") || devilTile.classList.contains("devil") || devilTile === "null")) {
                devilX = angelPosition.x + rng(3);
                devilY = angelPosition.y + rng(3);
                if (devilX === null || devilY === null) {
                    devilX = Math.floor(Math.random() * gridSize);
                    devilY = Math.floor(Math.random() * gridSize);
                }
            const devilTile = document.querySelector(`.tile[data-x="${devilX}"][data-y="${devilY}"]`); */ 