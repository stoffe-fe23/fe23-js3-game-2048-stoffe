/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Main App component, display game board and Start Game button and handle user input.  

    TODO:
    * GameOver state when game has ended.  -- Show Game Over dialog box. 
    * Score-keeping and highscore-tracking. 
    * Better visual representation of board movement? 
*/
import { useState, useEffect, useReducer } from 'react';
import './App.css';
import GameBoard from './GameBoard';
import GameTools from "./GameTools";

function App() {
    const touchStart = { x: 0, y: 0, time: 0 };

    /*********************************************************************
     * React hooks
     *********************************************************************/

    // State tracking if a game is currently on. 
    const [gameOn, setGameOn] = useState(false);

    // Keep track of the game score. 
    const [scoreTotal, setScoreTotal] = useState(0);

    // Save game board state (4x4 square grid) - Handle game actions
    const [gameBoard, gameBoardDispatch] = useReducer((state, action) => {
        const game = new GameTools(state, onScoreUpdate, onGameOver);

        switch (action.type) {
            case "SwipeLeft":
            case "ArrowLeft":
                gameOn && game.moveLeft();
                break;
            case "SwipeRight":
            case "ArrowRight":
                gameOn && game.moveRight();
                break;
            case "SwipeUp":
            case "ArrowUp":
                gameOn && game.moveUp();
                break;
            case "SwipeDown":
            case "ArrowDown":
                gameOn && game.moveDown();
                break;
            case "InitGame":
                game.resetGameBoard();
                game.addRandomNumberToBoard(2);
                setGameOn(true);
                setScoreTotal(0);
                break;
            case "GameOver":
                setGameOn(false);
                break;
        }
        return game.getBoardData();
    }, [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]);

    // Set keydown handler on document to detect arrow key presses.
    useEffect(() => {
        document.addEventListener("keydown", onArrowKeyDown);

        // Clean up event handler when unmounting component. 
        return () => document.removeEventListener("keydown", onArrowKeyDown);
    }, []);


    /*********************************************************************
     * Event handlers
     *********************************************************************/

    // Event handler responding to arrow key presses to control the game on devices without touch screens. 
    function onArrowKeyDown(event) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            gameBoardDispatch({ type: event.key });
        }
    }

    // TODO: Kolla istället dndkit för swipe-event mm. (npm modul)
    // Track swipes on touch screens: store start coordinates and time
    function onTouchStart(event) {
        touchStart.y = event.touches[0].clientY;
        touchStart.x = event.touches[0].clientX;
        touchStart.time = Date.now();
    }


    // Track swipes on touch screens: compare end coordinates to start coordinates to determine direction. 
    function onTouchEnd(event) {
        const touchEnd = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY,
            time: Date.now()
        }
        const moveThreshold = 50; // Must move at least this far to count as a swipe.

        // Check if touch has lasted long enough (0.15sec) to count as a swipe instead of a click
        if ((touchEnd.time - touchStart.time) >= 150) {
            // Swipe up
            if (touchStart.y - touchEnd.y >= moveThreshold) {
                console.log("UP");
                gameBoardDispatch({ type: "SwipeUp" });
            }
            // Swipe down
            else if (touchEnd.y - touchStart.y >= moveThreshold) {
                console.log("DOWN");
                gameBoardDispatch({ type: "SwipeDown" });
            }
            // Swipe left
            else if (touchStart.x - touchEnd.x >= moveThreshold) {
                console.log("LEFT");
                gameBoardDispatch({ type: "SwipeLeft" });
            }
            // Swipe right
            else if (touchEnd.x - touchStart.x >= moveThreshold) {
                console.log("RIGHT");
                gameBoardDispatch({ type: "SwipeRight" });
            }
        }
    }


    // Event handler for the Start/Reset game button
    function onGameStart(event) {
        gameBoardDispatch({ type: "InitGame" });
    }


    /*********************************************************************
     * GameTools callbacks
     *********************************************************************/

    // Callback function updating the game score when a move has been made. 
    function onScoreUpdate(score) {
        setScoreTotal((currentScore) => currentScore + score);
        // We just got a square with a value of 2048. The game is won!
        if (score == 2048) {
            // TODO: Show victory box/screen. 
            console.log("VICTORY!");
            setGameOn(false);
            alert("Victory!");
        }
    }


    // Handle game over condition, either victory or defeat. 
    function onGameOver() {
        // TODO: Show game over box/screen.
        console.log("GAME OVER!");
        setGameOn(false);
        alert("Game Over!");
    }


    /*********************************************************************
     * Component elements JSX
     *********************************************************************/

    return (
        <>
            <h1>2048!</h1>
            <button onClick={onGameStart}>{gameOn ? "Börja om" : "Spela!"}</button>
            <span className="score-display"><strong>Poäng: </strong>{scoreTotal}</span>
            <GameBoard board={gameBoard} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />
        </>
    )
}

export default App;