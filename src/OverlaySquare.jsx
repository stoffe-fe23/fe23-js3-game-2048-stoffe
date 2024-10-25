/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Square overlay component. A square of the overlay board showing a numeric value 
    and animating its movement into a new position on the board. 
*/
import { useLayoutEffect, useRef } from "react";

export default function OverlaySquare({ id, value, moveFrom, moveTo }) {

    const squareRef = useRef(null);

    useLayoutEffect(() => {
        // Get the position to translate this square to. 
        const cellStyle = getComputedStyle(squareRef.current);
        const moveSquareX = (moveTo.col - moveFrom.col) * Math.round(cellStyle.width.slice(0, -2));
        const moveSquareY = (moveTo.row - moveFrom.row) * Math.round(cellStyle.height.slice(0, -2));

        // Needs to be slightly delayed or the CSS transition animation will not play... (.game-overlay-cell in App.css)
        setTimeout(() => squareRef.current.style.transform = `translate(${moveSquareX}px, ${moveSquareY}px)`, 30);
    }, [moveTo]);

    return (
        <div
            ref={squareRef}
            className={"game-board-cell game-overlay-cell game-board-cell-" + value}
            id={`cell-${id}`}
        >
            {value != 0 ? value : ""}
        </div>
    );
}

