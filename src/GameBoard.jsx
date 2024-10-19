/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Board component, 4x4 grid of game squares with numeric values shown on them. 
*/
import { useReducer, useRef, useEffect } from "react";
import GameSquare from "./GameSquare";
import OverlaySquare from "./OverlaySquare";


function GameBoard({ board, onTouchStart, onTouchEnd }) {
    let squareCount = 0;
    let cellCount = 0;

    // Briefly display the overlay board
    // TODO: Fix - This causes flickering as the updated gameboard is displayed for a few ms before the overlay appears.
    //             This does not happen if just using CSS to show/hide the overlay instead of making React add it. 
    const [displayOverlay, setDisplayOverlay] = useReducer((state, action) => {
        if (!state && action)
            setTimeout(() => setDisplayOverlay(false), 1000);

        return !!action;
    }, false);

    const overlayRef = useRef(null);

    // Animate moves when the game board updates. 
    useEffect(() => {
        if (board.moves.length) {
            // Show move overlay (starting at previous move gamestate)
            // overlayRef.current.style.display = "grid";
            setDisplayOverlay(true);

            // WIP: Tried moving this into OverlaySquare component instead...
            // Animate the squares into the position of the current gamestate.
            /*
            board.moves.forEach((move) => {
                translateOverlaySquare(...move);
            });
            */

        }
    }, [board]);


    // Build game boards and create a square for each element in the board array.
    // The main gameboard is always shown, while the overlay board is briefly displayed
    // to animate square movement when the game state updates. 
    return (<>
        <div id="game-boards">
            <div id="game-board" className="game-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} >
                {
                    board.board.map((row, rowIdx) => {
                        return row.map((col, colIdx) => {
                            return <GameSquare key={squareCount} id={squareCount++} value={board.board[rowIdx][colIdx]} />
                        })
                    })
                }

            </div>
            {displayOverlay && <div id="overlay-board" ref={overlayRef}>
                {
                    board.overlay.map((row, rowIdx) => {
                        return row.map((col, colIdx) => {
                            // Check if there is a move involving this tile to display. 
                            let foundMove = board.moves.find((move) => move[0].row == rowIdx && move[0].col == colIdx);
                            if (!foundMove) {
                                foundMove = [{ row: rowIdx, col: colIdx }, { row: rowIdx, col: colIdx }];
                            }
                            return <OverlaySquare key={cellCount} id={cellCount++} moveFrom={foundMove[0]} moveTo={foundMove[1]} value={board.overlay[rowIdx][colIdx]} />
                        })
                    })
                }
            </div>}
        </div>
    </>);
}

export default GameBoard;