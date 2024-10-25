/*
    Grit-uppgift: Spelet 2048 - Javascript 3, Kristoffer Bengtsson, FE23
    Main Game App component, display game board and Start Game button and handle user input.  

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

    const [gameStatus, setGameStatus] = useState("start");

    // Keep track of the game score and higscore. 
    const [scoreTotal, setScoreTotal] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const storedHighScore = localStorage.getItem("Game2048Score");
        return storedHighScore ?? 0;
    });

    // Update highscore in storage if it changes. 
    useEffect(() => {
        localStorage.setItem("Game2048Score", highScore);
    }, [highScore]);

    // Disable player controls while a move is being animated for 1.1sec...
    const [disableControls, disableControlsDispatch] = useReducer((state, action) => {
        if (!state && action) {
            setTimeout(() => disableControlsDispatch(false), 1100);
        }
        return action;

    }, true);

    // Briefly display the game board overlay for 1 sec...
    const [displayOverlay, setDisplayOverlay] = useReducer((state, action) => {
        if (!state && action)
            setTimeout(() => setDisplayOverlay(false), 1000);

        return !!action;
    }, false);

    // Save game board state (4x4 square grid) - Handle game actions
    // gameBoard = { board, overlay, moves }, where board is the current game board, and
    // overlay is the state of the board before the last move, used to animate square movement,
    // and moves is a list of square movements to animate on the overlay.  
    const [gameBoard, gameControlDispatch] = useReducer((state, action) => {
        const game = new GameTools(state.board, onScoreUpdate, onGameOver);

        if ((action.category == "controls") && gameOn && !disableControls) {
            // Logic for manipulating the game board is located in the GameTools class. 
            // const game = new GameTools(state.board, onScoreUpdate, onGameOver);

            // React to player input, either arrow keys or swipes on the gameboard element. 
            switch (action.type) {
                case "SwipeLeft":
                case "ArrowLeft":
                    game.moveLeft();
                    break;
                case "SwipeRight":
                case "ArrowRight":
                    game.moveRight();
                    break;
                case "SwipeUp":
                case "ArrowUp":
                    game.moveUp();
                    break;
                case "SwipeDown":
                case "ArrowDown":
                    game.moveDown();
                    break;
            }

            // Lock player controls while animating the move on the gameboard overlay. 
            disableControlsDispatch(true);
            setDisplayOverlay(true);

            // New state
            return {
                board: game.getBoardData(),
                overlay: state.board,
                moves: game.getSquareMoves()
            };
        }
        else if (action.category == "gamestate") {
            // Logic for setup and reset of gameboard is in the GameTools class. 
            // const game = new GameTools(state.board, onScoreUpdate, onGameOver);

            switch (action.type) {
                case "InitGame":
                    // Start a new game, reset everything to starting state. 
                    game.resetGameBoard();
                    game.addRandomNumberToBoard(2);
                    setGameStatus("playing");
                    setGameOn(true);
                    setScoreTotal(0);
                    disableControlsDispatch(false);
                    break;
                case "GameOver":
                    // End the current game. 
                    setGameOn(false);
                    setGameStatus("gameover");
                    break;
                case "Victory":
                    // End current game with victory condition.
                    setGameOn(false);
                    setGameStatus("victory");
                    break;
            }

            // New state
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

        // Set touchmove handler on document to avoid scrolling when swiping on the game board element. 
        document.addEventListener("touchmove", onTouchHandler, { passive: false });

        // Clean up the above event handlers when unmounting component. 
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
            gameControlDispatch({ type: event.key, category: "controls" });
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
            // Prevent page from scrolling while swiping over the game board element.
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
                    gameControlDispatch({ type: "SwipeUp", category: "controls" });
                }
                else if (touchEndY - touchStartY >= moveThreshold) { // Swipe down
                    gameControlDispatch({ type: "SwipeDown", category: "controls" });
                }
                else if (touchStartX - touchEndX >= moveThreshold) { // Swipe left
                    gameControlDispatch({ type: "SwipeLeft", category: "controls" });
                }
                else if (touchEndX - touchStartX >= moveThreshold) { // Swipe right
                    gameControlDispatch({ type: "SwipeRight", category: "controls" });
                }
            }
        }
    }


    // Event handler for the Start/Reset game button
    function onGameStart(event) {
        gameControlDispatch({ type: "InitGame", category: "gamestate" });
    }


    /*********************************************************************
     * GameTools class callbacks
     *********************************************************************/

    // Callback function updating the game score when a move has been made. 
    function onScoreUpdate(score) {
        setScoreTotal((currentScore) => {
            const newScore = currentScore + score;

            // Update the highscore if this score is better.
            if (newScore > highScore) {
                setHighScore(newScore);
            }
            return newScore;
        });
        // We just got a square with a value of 2048. The game is won!
        if (score == 2048) {
            console.log("VICTORY!");
            setGameOn(false);
            setGameStatus("victory");
        }
    }


    // Handle game over condition. 
    function onGameOver() {
        console.log("GAME OVER!");
        setGameOn(false);
        setGameStatus("gameover");
    }


    /*********************************************************************
     * Component elements JSX
     *********************************************************************/

    const gameStatusStrings = {
        victory: "Victory!",
        gameover: "Game Over!",
        playing: "Reach 2048",
        start: "Play 2048"
    }

    return (
        <div id="game-2048">
            <h1 className={`game-status-${gameStatus}`}>{gameStatusStrings[gameStatus] ?? "2048"}</h1>
            <div className="scores">
                <span className="score-display"><strong>Score: </strong>{scoreTotal}</span>
                <span className="highscore-display"><strong>Highscore: </strong>{highScore}</span>
            </div>
            <GameBoard board={gameBoard} displayOverlay={displayOverlay} onTouchStart={onTouchHandler} onTouchEnd={onTouchHandler} />
            <button onClick={onGameStart}>{gameOn ? "Restart" : "Play!"}</button>
        </div>
    )
}

export default App;