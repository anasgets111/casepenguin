"use client";
import { useState, useEffect, useRef } from "react";

const INITIAL_SPEED = 200;
const CELL_SIZE = 10;
const DIRECTIONS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const getRandomPosition = (gridSize: { rows: number; cols: number }) => ({
  x: Math.floor(Math.random() * gridSize.cols),
  y: Math.floor(Math.random() * gridSize.rows),
});

const generateObstacles = (
  gridSize: { rows: number; cols: number },
  count: number,
  snake: { x: number; y: number }[],
) => {
  const obstacles = [];
  for (let i = 0; i < count; i++) {
    let position: { x: number; y: number };
    do {
      position = getRandomPosition(gridSize);
    } while (
      snake.some(
        (segment) => segment.x === position.x && segment.y === position.y,
      )
    );
    obstacles.push(position);
  }
  return obstacles;
};
const SnakeGame = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(getRandomPosition({ rows: 25, cols: 25 }));
  const [obstacles, setObstacles] = useState(
    generateObstacles({ rows: 25, cols: 25 }, 5, snake),
  );
  const [powerUp, setPowerUp] = useState<{
    x: number;
    y: number;
    type: string;
  } | null>(null);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 25 });

  useEffect(() => {
    const calculateAvailableHeight = () => {
      if (gameContainerRef.current) {
        setAvailableHeight(gameContainerRef.current.clientHeight);
      }
    };

    calculateAvailableHeight();
    window.addEventListener("resize", calculateAvailableHeight);
    return () => window.removeEventListener("resize", calculateAvailableHeight);
  }, []);

  useEffect(() => {
    const calculateGridSize = () => {
      const screenWidth = window.innerWidth;
      const newGridCols = Math.floor((screenWidth * 0.9) / CELL_SIZE);
      const newGridRows = Math.floor(availableHeight / CELL_SIZE);

      setGridSize({ rows: newGridRows, cols: newGridCols });
    };

    calculateGridSize();
  }, [availableHeight]);

  useEffect(() => {
    setFood(getRandomPosition(gridSize));
    setObstacles(generateObstacles(gridSize, 5, snake));
  }, [gridSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (DIRECTIONS[e.key]) {
        setDirection(DIRECTIONS[e.key]);
      }
    };
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection(deltaX > 0 ? DIRECTIONS.ArrowRight : DIRECTIONS.ArrowLeft);
      } else {
        setDirection(deltaY > 0 ? DIRECTIONS.ArrowDown : DIRECTIONS.ArrowUp);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = {
          x: (newSnake[0].x + direction.x + gridSize.cols) % gridSize.cols,
          y: (newSnake[0].y + direction.y + gridSize.rows) % gridSize.rows,
        };
        if (
          newSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y,
          ) ||
          obstacles.some(
            (obstacle) => obstacle.x === head.x && obstacle.y === head.y,
          )
        ) {
          if (lives > 1) {
            setLives(lives - 1);
            setSnake([{ x: 10, y: 10 }]);
            setDirection({ x: 1, y: 0 });
            return prevSnake;
          } else {
            setGameOver(true);
            setHighScore((prev) => Math.max(prev, score));
            localStorage.setItem(
              "highScore",
              JSON.stringify(Math.max(highScore, score)),
            );
            clearInterval(interval);
            return prevSnake;
          }
        }
        newSnake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          setFood(getRandomPosition(gridSize));
          setScore(score + 1);
          setSpeed((speed) => Math.max(50, speed - 5));
          if (Math.random() < 0.2) {
            const powerUpType =
              Math.random() < 0.5 ? "speedBoost" : "extraPoints";
            setPowerUp({
              ...getRandomPosition(gridSize),
              type: powerUpType,
            });
          }
        } else if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
          setActivePowerUp(powerUp.type);
          setPowerUp(null);
          if (powerUp.type === "speedBoost") {
            setSpeed((speed) => Math.max(50, speed - 100));
            setTimeout(() => {
              setSpeed(INITIAL_SPEED);
              setActivePowerUp(null);
            }, 5000);
          } else if (powerUp.type === "extraPoints") {
            setScore(score + 10);
            setActivePowerUp(null);
          }
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [
    direction,
    food,
    gameOver,
    score,
    speed,
    obstacles,
    lives,
    powerUp,
    gridSize,
  ]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("highScore");
    if (savedHighScore) {
      setHighScore(JSON.parse(savedHighScore));
    }
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomPosition(gridSize));
    setObstacles(generateObstacles(gridSize, 5, snake));
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setLives(3);
    setPowerUp(null);
    setActivePowerUp(null);
  };

  const clearHighScore = () => {
    localStorage.removeItem("highScore");
    setHighScore(0);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < gridSize.rows; y++) {
      for (let x = 0; x < gridSize.cols; x++) {
        let className = "bg-black";
        if (snake.some((segment) => segment.x === x && segment.y === y)) {
          className = "bg-green-500";
        } else if (food.x === x && food.y === y) {
          className = "bg-red-500";
        } else if (
          obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y)
        ) {
          className = "bg-gray-500";
        } else if (powerUp && powerUp.x === x && powerUp.y === y) {
          className =
            powerUp.type === "speedBoost" ? "bg-blue-500" : "bg-yellow-400";
        }
        cells.push(
          <div key={`${x}-${y}`} className={`${className} h-full w-full`} />,
        );
      }
    }
    return cells;
  };

  return (
    <div
      ref={gameContainerRef} // Reference to the game container
      className="flex h-screen flex-col items-center justify-center bg-gray-800"
      style={{ height: "90vh" }}
    >
      <div className="mb-4 flex w-full shrink-0 justify-between px-4 text-2xl text-white">
        <div>Score: {score}</div>
        <div>
          High Score: {highScore}
          <button
            onClick={clearHighScore}
            className="ml-2 rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700"
          >
            Clear
          </button>
        </div>
        <div>Lives: {lives}</div>
      </div>

      {activePowerUp && (
        <div className="mb-4 shrink-0 text-xl text-white">
          Active Power-Up: {activePowerUp}
        </div>
      )}

      <div
        className="grid grow"
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${gridSize.rows}, ${CELL_SIZE}px)`,
          gap: "1px",
        }}
      >
        {renderGrid()}
      </div>

      {gameOver && (
        <div className="mt-4 shrink-0">
          <div className="mb-4 text-2xl text-white">Game Over!</div>
          <button
            onClick={resetGame}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
