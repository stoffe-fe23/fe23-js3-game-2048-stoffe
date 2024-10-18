/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Board component, 4x4 grid of game squares with numeric values shown on them. 
*/
import GameSquare from "./GameSquare";


function GameBoard({ board, onTouchStart, onTouchEnd }) {
    let count = 0;

    // Build game board and create a square for each element in the board array.
    return (<>
        <div id="game-board" className="game-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} >
            {
                board.map((row, rowIdx) => {
                    return row.map((col, colIdx) => {
                        return <GameSquare key={count} id={`square-${count++}`} value={board[rowIdx][colIdx]} />
                    })
                })
            }

        </div>
    </>);
}

export default GameBoard;