import React, { useState, useRef, useEffect } from "react";
import { useInterval } from "./useInterval";
import {
  CANVAS_SIZE,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS,
} from "./constants";

import "./styles.css";

import eat from "./sounds/beep.wav";
import end from "./sounds/end.wav";
import main from "./sounds/main.mp3";

const eatAppleSound = new Audio(eat);
const mainSound = new Audio(main);
const endGameSound = new Audio(end);

export const App = () => {
  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const startGame = () => {
    mainSound.play();
    setSnake(SNAKE_START);
    setApple(createAple());
    setDir([0, -1]);
    setSpeed(SPEED);
    setGameOver(false);
  };

  const endGame = () => {
    endGameSound.play();
    mainSound.pause();
    setSpeed(null);
    setGameOver(true);
    if (localStorage.getItem("highscore") < score) {
      localStorage.setItem("highscore", score);
    }
    setScore(0);
  };

  const moveSnake = ({ keyCode }) => {
    if (dir[1] === -1) {
      keyCode >= 37 && keyCode < 40 && setDir(DIRECTIONS[keyCode]);
    }
    if (dir[1] === 1) {
      keyCode >= 37 &&
        keyCode < 40 &&
        keyCode !== 38 &&
        setDir(DIRECTIONS[keyCode]);
    }
    if (dir[0] === -1) {
      keyCode >= 37 &&
        keyCode <= 40 &&
        keyCode !== 39 &&
        setDir(DIRECTIONS[keyCode]);
    }
    if (dir[0] === 1) {
      keyCode > 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);
    }
  };

  const createAple = () =>
    apple.map((_, i) => Math.floor((Math.random() * CANVAS_SIZE[i]) / SCALE));

  const checkCollision = (piece, snk = snake) => {
    if (
      piece[0] * SCALE >= CANVAS_SIZE[0] ||
      piece[0] < 0 ||
      piece[1] * SCALE >= CANVAS_SIZE[1] ||
      piece[1] < 0
    )
      return true;

    for (const segment of snk) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
    }

    return false;
  };

  const checkAppleCollision = (newSnake) => {
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = createAple();
      while (checkCollision(newApple, newSnake)) {
        newApple = createAple();
      }
      setApple(newApple);
      eatAppleSound.play();
      setScore(score + 1);
      setSpeed(speed - 10);
      return true;
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) endGame();
    if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
    setSnake(snakeCopy);
  };

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
    context.fillStyle = "pink";
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = "lightblue";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  useInterval(() => gameLoop(), speed);

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyDown={(e) => moveSnake(e)}
      className={"app"}
    >
      <canvas
        ref={canvasRef}
        width={`${CANVAS_SIZE[0]}px`}
        height={`${CANVAS_SIZE[1]}px`}
      />
      {gameOver && <div className={"game-over-popup"}>GAME OVER!</div>}
      <div className={"info-row"}>
        <button onClick={startGame} className={"start-game-button"}>
          Start Game
        </button>
        <div>
          <div>Your score is: {score}</div>
          <div>Your speed is: {(score + 1) * 10} km/h</div>
        </div>
        <div>Highscore is: {localStorage.getItem("highscore")}</div>
      </div>
    </div>
  );
};
