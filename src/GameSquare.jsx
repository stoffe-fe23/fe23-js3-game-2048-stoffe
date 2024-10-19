/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Square component, a square of the game board showing a numeric value. 
    If the value is 0 the square is not displaying any value. 
*/
import { forwardRef } from "react";

// TODO: Revert this, forwardRef no longer needed here.... 
const GameSquare = forwardRef(({ id, value }, ref) => {
    return (<div ref={ref} className={value > 0 ? "game-board-cell game-board-cell-" + value : "game-board-cell"} id={`square-${id}`}>{value != 0 ? value : ""}</div>);
});

export default GameSquare;

