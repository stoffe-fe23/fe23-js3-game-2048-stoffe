/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Game Square component, a square of the game board showing a numeric value. 
    If the value is 0 the square is not displaying any value. 
*/
import { useEffect, useRef } from "react";

export default function OverlaySquare({ id, value, col, row, squareTemplate, board }) {

    const squareRef = useRef(null);
    useEffect(() => {
        // UGLY! Reference from actual board fow now -- FIND A BETTER WAY TO DO THIS! useRef?
        // const cellSize = document.querySelector("#square-0").getBoundingClientRect().width;

        const cellSize = squareTemplate.current.getBoundingClientRect().width;

        squareRef.current.style.width = `${cellSize}px`;
        squareRef.current.style.height = `${cellSize}px`;
        squareRef.current.style.left = `${col * cellSize}px`;
        squareRef.current.style.top = `${row * cellSize}px`;
        // squareRef.current.style.backgroundColor = "lightseagreen";

    }, [value]);


    return (<div ref={squareRef} className={value > 0 ? "game-board-cell game-overlay-cell game-board-cell-" + value : "game-board-cell game-overlay-cell"} id={`cell-${id}`}>{value != 0 ? value : ""}</div>);
}

