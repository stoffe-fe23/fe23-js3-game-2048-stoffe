/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Square component, a square of the overlay board showing a numeric value 
    and animating movement into a new position on the board. 
*/
import { useEffect, useRef, useState } from "react";

export default function OverlaySquare({ id, value, moveFrom, moveTo }) {
    // TODO: Get square size from style instead of hardcoding... 
    const moveX = (moveTo.col - moveFrom.col) * 74;
    const moveY = (moveTo.row - moveFrom.row) * 74;

    const squareRef = useRef(null);

    // TODO: Trying to fix problem below. Ugly... 
    useEffect(() => {
        // This does not trigger transition either.... 
        /*
        squareRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
        console.log("MOVING TILE", id, `translate(${moveX}px, ${moveY}px)`);
        */

        // But this does... most of the time... why? 
        const xform = squareRef.current.style.transform;
        squareRef.current.style.transform = "none";
        setTimeout(() => squareRef.current.style.transform = xform, 30);

    }, [value]);

    // TODO: This does not trigger transition anim altough the transform works correctly... 
    // Unless the overlay board is permanently visible, then square transitions animate. Why? 
    const moveStyle = { transform: `translate(${moveX}px, ${moveY}px)` };

    // console.log("OVERLAY TILE", id, `translate(${moveX}px, ${moveY}px)`);

    return (<div ref={squareRef} style={moveStyle} className={"game-board-cell game-overlay-cell game-board-cell-" + value} id={`cell-${id}`}>{value != 0 ? value : ""}</div>);
}

