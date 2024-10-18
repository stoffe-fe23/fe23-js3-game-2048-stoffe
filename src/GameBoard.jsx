/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Board component, 4x4 grid of game squares with numeric values shown on them. 
*/
import { useRef, useEffect } from "react";
import GameSquare from "./GameSquare";
import OverlaySquare from "./OverlaySquare";


function GameBoard({ board, onTouchStart, onTouchEnd }) {
    let squareCount = 0;
    let cellCount = 0;

    const overlayRef = useRef(null);
    const boardRef = useRef(null);
    const cellRef = useRef(null);

    // Animate moves when the game board updates. 
    useEffect(() => {
        if (board.moves.length) {
            // Show move overlay (starting at previous move gamestate)
            overlayRef.current.style.display = "grid";

            // Animate the squares into the position of the current gamestate.
            board.moves.forEach((move) => {
                moveOverlaySquare(...move);
            });

            // Hide move overlay after 1 sec (block anim speed)
            setTimeout(() => overlayRef.current.style.display = "none", 1000);
        }
    }, [board]);


    // Move a square on the overlay board into the specified position. 
    function moveOverlaySquare(moveFrom, moveTo) {
        const board = overlayRef.current;
        const targetCell = document.querySelector(`#cell-${(moveFrom.row * 4) + moveFrom.col}`);
        const destCell = document.querySelector(`#square-${(moveTo.row * 4) + moveTo.col}`);

        targetCell.style.zIndex = 2;

        // Horizontal/row movement
        if (moveFrom.row == moveTo.row) {
            const destOffset = getRelativePosition(board, destCell).left;
            targetCell.style.left = `${destOffset}px`;
        }
        // Vertical/column movement
        else {
            const destOffset = getRelativePosition(board, destCell).top;
            targetCell.style.top = `${destOffset}px`;
        }
    }

    // Get position of a square inside the board element. 
    function getRelativePosition(parent, child) {
        const parentPos = parent.getBoundingClientRect();
        const childPos = child.getBoundingClientRect();
        const parentBorderSize = Number(getComputedStyle(parent).borderLeftWidth.slice(0, -2));
        return {
            top: childPos.top - parentPos.top - parentBorderSize,
            right: childPos.right - parentPos.right - parentBorderSize,
            bottom: childPos.bottom - parentPos.bottom - parentBorderSize,
            left: childPos.left - parentPos.left - parentBorderSize
        };
    }

    // Build game boards and create a square for each element in the board array.
    // The main gameboard is always shown, while the overlay board is briefly displayed
    // to animate square movement when the game state updates. 
    return (<>
        <div id="game-boards" ref={boardRef}>
            <div id="game-board" className="game-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} >
                {
                    board.board.map((row, rowIdx) => {
                        return row.map((col, colIdx) => {
                            // Save first square as reference to size the overlay squares after. 
                            if (squareCount == 0) {
                                return <GameSquare key={squareCount} id={squareCount++} value={board.board[rowIdx][colIdx]} ref={cellRef} />
                            }
                            else {
                                return <GameSquare key={squareCount} id={squareCount++} value={board.board[rowIdx][colIdx]} />
                            }
                        })
                    })
                }

            </div>
            <div id="overlay-board" ref={overlayRef}>
                {
                    board.overlay.map((row, rowIdx) => {
                        return row.map((col, colIdx) => {
                            return <OverlaySquare key={cellCount} id={cellCount++} col={colIdx} row={rowIdx} board={boardRef} squareTemplate={cellRef} value={board.overlay[rowIdx][colIdx]} />
                        })
                    })
                }
            </div>
        </div>
    </>);
}

export default GameBoard;