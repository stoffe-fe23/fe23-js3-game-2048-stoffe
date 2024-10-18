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
    let touchStartX, touchStartY, touchTimeStart;

    /*********************************************************************
     * React hooks
     *********************************************************************/

    // State tracking if a game is currently on. 
    const [gameOn, setGameOn] = useState(false);

    // Keep track of the game score. 
    const [scoreTotal, setScoreTotal] = useState(0);

    // Disable player controls while a move is being animated.
    const [disableControls, disableControlsDispatch] = useReducer((state, action) => {
        if (!state && action) {
            setTimeout(() => disableControlsDispatch(false), 1100);
        }
        return action;

    }, true);


    // Save game board state (4x4 square grid) - Handle game actions
    // gameBoard = { board, overlay }, where board is the current game board, and
    // overlay is the state of the board before the last move, used to animate square movement. 
    const [gameBoard, gameBoardDispatch] = useReducer((state, action) => {


        if ((action.category == "controls") && gameOn && !disableControls) {
            const game = new GameTools(state.board, onScoreUpdate, onGameOver);
            switch (action.type) {
                case "SwipeLeft":
                case "ArrowLeft":
                    disableControlsDispatch(true);
                    game.moveLeft();
                    break;
                case "SwipeRight":
                case "ArrowRight":
                    disableControlsDispatch(true);
                    game.moveRight();
                    break;
                case "SwipeUp":
                case "ArrowUp":
                    disableControlsDispatch(true);
                    game.moveUp();
                    break;
                case "SwipeDown":
                case "ArrowDown":
                    disableControlsDispatch(true);
                    game.moveDown();
                    break;
            }

            return {
                board: game.getBoardData(),
                overlay: state.board,
                moves: game.getSquareMoves()
            };
        }
        else if (action.category == "gamestate") {
            const game = new GameTools(state.board, onScoreUpdate, onGameOver);

            switch (action.type) {
                case "InitGame":
                    game.resetGameBoard();
                    game.addRandomNumberToBoard(2);
                    setGameOn(true);
                    setScoreTotal(0);
                    disableControlsDispatch(false);
                    break;
                case "GameOver":
                    setGameOn(false);
                    break;
            }

            return {
                board: game.getBoardData(),
                overlay: state.board,
                moves: game.getSquareMoves()
            };
        }

        return state;
    }, {
        board: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        overlay: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        moves: []
    });


    useEffect(() => {
        // Set keydown handler on document to detect arrow key presses.
        document.addEventListener("keydown", onArrowKeyPress);
        // Set touchmove handler on document to avoid scrolling when swiping on the game board. 
        document.addEventListener("touchmove", onTouchHandler, { passive: false });

        // Clean up event handlers when unmounting component. 
        return () => {
            document.removeEventListener("keydown", onArrowKeyPress);
            document.removeEventListener("touchmove", onTouchHandler, { passive: false });
        }
    }, []);


    /*********************************************************************
     * Event handlers
     *********************************************************************/

    // Event handler responding to arrow key presses to control the game on devices without touch screens. 
    function onArrowKeyPress(event) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            gameBoardDispatch({ type: event.key, category: "controls" });
        }
    }

    // Track swipes on touch screens: compare end coordinates to start coordinates to determine direction. 
    function onTouchHandler(event) {
        if (event.type == "touchstart") {
            touchStartY = event.touches[0].clientY;
            touchStartX = event.touches[0].clientX;
            touchTimeStart = Date.now();
            window.isSwiping = true;
        }
        else if (event.type == "touchmove") {
            // Prevent page from scrolling while swiping over the game board
            if (window.isSwiping) {
                event.preventDefault();
            }
        }
        else if (event.type == "touchend") {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            const moveThreshold = 50; // Must move at least this far to count as a swipe.
            window.isSwiping = false;

            // Check if touch has lasted long enough (0.15sec) to count as a swipe instead of a click/tap
            if ((Date.now() - touchTimeStart) >= 150) {
                if (touchStartY - touchEndY >= moveThreshold) { // Swipe up
                    gameBoardDispatch({ type: "SwipeUp", category: "controls" });
                }
                else if (touchEndY - touchStartY >= moveThreshold) { // Swipe down
                    gameBoardDispatch({ type: "SwipeDown", category: "controls" });
                }
                else if (touchStartX - touchEndX >= moveThreshold) { // Swipe left
                    gameBoardDispatch({ type: "SwipeLeft", category: "controls" });
                }
                else if (touchEndX - touchStartX >= moveThreshold) { // Swipe right
                    gameBoardDispatch({ type: "SwipeRight", category: "controls" });
                }
            }
        }
    }


    // Event handler for the Start/Reset game button
    function onGameStart(event) {
        gameBoardDispatch({ type: "InitGame", category: "gamestate" });
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
            <GameBoard board={gameBoard} onTouchStart={onTouchHandler} onTouchEnd={onTouchHandler} />
        </>
    )
}

export default App;