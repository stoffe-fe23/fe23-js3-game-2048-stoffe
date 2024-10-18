/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Class with methods to manipulate the game board array.
*/

class GameTools {
    board = [];     // Game board state array
    moves = [];     // Array of of square moves that have been made on the board.

    #changes = 0;   // Track the number of changes to the gameboard a move resulted in.
    #merged = -1;   // Track row/col ID of merged square to prevent merging it again in the same move. 

    // Constructor, set current game board array and callback functions for score changes and game over. 
    constructor(gameBoard, onScoreUpdate = null, onGameOver = null) {
        if (!gameBoard) {
            this.resetGameBoard();
        }
        else {
            // Make a copy of the gameboard data to work with. 
            this.board = gameBoard.map((row) => [...row]);
        }
        this.moves = [];
        this.#changes = 0;
        this.onGameOver = onGameOver;
        this.onScoreUpdate = onScoreUpdate;
    }


    /*********************************************************************
     * Results retrieval methods 
     *********************************************************************/

    // Get the full board array.  
    getBoardData() {
        return this.board;
    }

    // Get an array of coalesced square movements that have been performed.
    // I.e. all moves originating from the same square are merged into a single move. 
    // Return data is an array of move-arrays. Move-arrays contain two objects with the row and col of 
    // the start position and destination position of that move. E.g:  
    //[ /*    START             DEST   */
    //  [{row: 0, col: 0}, {row: 0, col: 0}], 
    //  [{row: 0, col: 0}, {row: 0, col: 0}] 
    //]
    getSquareMoves() {
        const moveList = [];

        this.moves.forEach((move, itr) => {
            const [start, end] = move;

            // Check if this start position matches the end position of a previous move. 
            const idx = moveList.findIndex((findMove) => {
                const [foundStart, foundEnd, foundLast] = findMove;
                return (foundLast.row == start.row) && (foundLast.col == start.col);
            });

            // No previous move, just add the move to the list.
            if (idx === -1) {
                moveList.push([
                    { row: start.row, col: start.col },
                    { row: end.row, col: end.col },
                    { row: end.row, col: end.col }
                ]);
            }
            // Found previous move, update its destination position instead. 
            else {
                moveList[idx] = [
                    { row: moveList[idx][0].row, col: moveList[idx][0].col },
                    { row: end.row, col: end.col },
                    { row: end.row, col: end.col }
                ];
            }
        });

        // Remove the element tracking last position of squares, just needed above. 
        moveList.forEach((move, moveIdx) => {
            move.pop();
        })

        return moveList;
    }


    /*********************************************************************
     * Board setup methods
     *********************************************************************/

    // Reset the board array to a blank default state. 
    resetGameBoard() {
        this.#changes = 0;
        this.moves = [];
        this.board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    }


    // Find any empty squares on the game board (where value = 0)
    getEmptyPositions() {
        const emptyPositions = [];
        this.board.forEach((row, rowIdx) => {
            row.forEach((col, colIdx) => {
                if (this.board[rowIdx][colIdx] == 0) {
                    emptyPositions.push({ row: rowIdx, col: colIdx });
                }
            })
        });

        return emptyPositions;
    }


    // Get an array with the specified number of empty squares on the game board, if available.  
    getRandomEmptyPositions(posCount = 1) {
        const availablePos = this.getEmptyPositions();
        const randomPos = [];
        const usedIndexes = [];

        if (availablePos.length >= posCount) {
            for (let i = 0; i < posCount; i++) {
                let rndIdx = Math.floor(Math.random() * availablePos.length);
                // Prevent getting the same square again if getting more than one. 
                while (usedIndexes.includes(rndIdx)) {
                    rndIdx = Math.floor(Math.random() * availablePos.length);
                }
                usedIndexes.push(rndIdx);
                randomPos.push(availablePos[rndIdx]);
            }
        }
        else {
            return false;
        }
        return randomPos;
    }


    // Add the specified number of 2s (75% chance) or 4s (25% chance) to the game board.
    addRandomNumberToBoard(count = 1) {
        const positions = this.getRandomEmptyPositions(count);
        if ((positions !== false) && (positions.length == count)) {
            for (const pos of positions) {
                // Add new number to board, 75% chance of it being a 2, 25% chance of a 4. 
                this.board[pos.row][pos.col] = Math.ceil(Math.random() * 100) > 75 ? 4 : 2;
            }
        }
    }


    /*********************************************************************
     * Board movement methods
     *********************************************************************/

    // Row: Move all squares with values as far to the left on the game board as possible.
    moveLeft() {
        for (let row = 0; row < 4; row++) {
            this.#merged = -1;
            this.moveBoardRowOrCol(row, 1, "left");
        }
        this.updateGameState();
    }


    // Row: Move all squares with values as far to the right on the game board as possible.
    moveRight() {
        for (let row = 0; row < 4; row++) {
            this.#merged = -1;
            this.moveBoardRowOrCol(row, 2, "right");
        }
        this.updateGameState();
    }


    // Column: Move all squares with values as far up on the game board as possible.
    moveUp() {
        for (let col = 3; col >= 0; col--) {
            this.#merged = -1;
            this.moveBoardRowOrCol(1, col, "up");
        }
        this.updateGameState();
    }


    // Column: Move all squares with values as far down on the game board as possible.
    moveDown() {
        for (let col = 3; col >= 0; col--) {
            this.#merged = -1;
            this.moveBoardRowOrCol(2, col, "down");
        }
        this.updateGameState();
    }


    // Shift all numbers on the board in a row or column in the specified direction. 
    moveBoardRowOrCol(row, col, dir, depth = 0, checkAll = true) {
        if (depth > 20) {
            console.error(row, col, "Runaway recursion in moveBoardRowOrCol()? Aborting...");
            return;
        }

        let cmpRow, cmpCol, nextRow, nextCol, mergeIdx;
        let isValidRange = false;

        // Setup depending on movement direction...
        switch (dir) {
            case "left":
                isValidRange = (col > 0) && (col < 4);
                cmpRow = row;
                cmpCol = col - 1;
                nextRow = row;
                nextCol = col + 1;
                mergeIdx = cmpCol;
                break;
            case "right":
                isValidRange = (col >= 0) && (col < 3);
                cmpRow = row;
                cmpCol = col + 1;
                nextRow = row;
                nextCol = col - 1;
                mergeIdx = cmpCol;
                break;
            case "up":
                isValidRange = (row > 0) && (row < 4);
                cmpRow = row - 1;
                cmpCol = col;
                nextRow = row + 1;
                nextCol = col;
                mergeIdx = cmpRow;
                break;
            case "down":
                isValidRange = (row >= 0) && (row < 3);
                cmpRow = row + 1;
                cmpCol = col;
                nextRow = row - 1;
                nextCol = col;
                mergeIdx = cmpRow;
                break;
        }

        if (isValidRange) {
            // Switch places of a number and an adjacent zero depending on direction. 
            if ((this.board[cmpRow][cmpCol] == 0) && (this.board[row][col] != 0)) {
                this.board[cmpRow][cmpCol] = this.board[row][col];
                this.board[row][col] = 0;
                this.#changes++;
                this.moves.push([{ row: row, col: col }, { row: cmpRow, col: cmpCol }]);
                // Check if there is another adjacent zero from the new position. 
                this.moveBoardRowOrCol(cmpRow, cmpCol, dir, depth + 1, false);
            }

            // Combine adjacent same (not zero) numbers. A just combined number may not be combined again in the same move.
            if ((this.#merged !== mergeIdx) && this.board[cmpRow][cmpCol] && this.board[row][col] && (this.board[cmpRow][cmpCol] == this.board[row][col])) {
                this.board[cmpRow][cmpCol] = this.board[row][col] + this.board[cmpRow][cmpCol];
                this.board[row][col] = 0;
                this.#changes++;
                this.moves.push([{ row: row, col: col }, { row: cmpRow, col: cmpCol }]);
                this.#merged = mergeIdx;
                this.onScoreUpdate(this.board[cmpRow][cmpCol]);
            }

            // Check the next column or row in the direction.  
            if (checkAll)
                this.moveBoardRowOrCol(nextRow, nextCol, dir, depth + 1, true);

        }
    }


    // When a board move has been made, check for victory/loss condition or update the board with a new number.
    updateGameState() {
        // Check for Game Over.
        // TODO: ALSO have to check if there are any moves possible (i.e. adjacent same numbers), not just if the board is full... 
        if (!this.getEmptyPositions().length) {
            this.onGameOver();
            return;
        }

        // Add a new number/square to the board if a move has been made. 
        if (this.#changes) {
            this.addRandomNumberToBoard();
            this.#changes = 0;
        }
    }

}

export default GameTools;