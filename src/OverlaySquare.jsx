/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Square component, a square of the overlay board showing a numeric value 
    and animating movement into a new position on the board. 
*/
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function OverlaySquare({ id, value, moveFrom, moveTo }) {

    const squareRef = useRef(null);

    useLayoutEffect(() => {
        // TODO: Get square size from style instead of hardcoding... 
        const moveSquareX = (moveTo.col - moveFrom.col) * 74;
        const moveSquareY = (moveTo.row - moveFrom.row) * 74;

        setTimeout(() => squareRef.current.style.transform = `translate(${moveSquareX}px, ${moveSquareY}px)`, 30);
    }, [moveTo]);

    return (<div ref={squareRef} className={"game-board-cell game-overlay-cell game-board-cell-" + value} id={`cell-${id}`}>{value != 0 ? value : ""}</div>);
}

