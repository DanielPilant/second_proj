const width = 20;
const gridElement = document.getElementById("grid");
const scoreDisplay = document.getElementById("currentScore");
const highScoreDisplay = document.getElementById("highScore");
const startBtn = document.getElementById("startBtn");
const msgDisplay = document.getElementById("message");

let squares = [];
let currentSnake = [2, 1, 0];
let direction = 1;
let appleIndex = 0;
let score = 0;
let intervalTime = 200;
let timerId = 0;

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreDisplay.textContent = highScore;

function createGrid() {
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    gridElement.appendChild(square);
    squares.push(square);
  }
}
createGrid();

function startGame() {
  currentSnake.forEach((index) => squares[index].classList.remove("snake"));
  squares[appleIndex].classList.remove("food");
  clearInterval(timerId);

  currentSnake = [2, 1, 0];
  score = 0;
  scoreDisplay.textContent = score;
  direction = 1;
  intervalTime = 200;
  msgDisplay.textContent = "";

  currentSnake.forEach((index) => squares[index].classList.add("snake"));
  generateApple();

  timerId = setInterval(move, intervalTime);
}

function move() {
  if (
    (currentSnake[0] + width >= width * width && direction === width) ||
    (currentSnake[0] % width === width - 1 && direction === 1) ||
    (currentSnake[0] % width === 0 && direction === -1) ||
    (currentSnake[0] - width < 0 && direction === -width) ||
    squares[currentSnake[0] + direction].classList.contains("snake")
  ) {
    return gameOver();
  }

  const tail = currentSnake.pop();
  squares[tail].classList.remove("snake");

  currentSnake.unshift(currentSnake[0] + direction);

  if (squares[currentSnake[0]].classList.contains("food")) {
    squares[currentSnake[0]].classList.remove("food");
    squares[tail].classList.add("snake");
    currentSnake.push(tail);

    score++;
    scoreDisplay.textContent = score;

    if (score % 5 === 0 && intervalTime > 50) {
      clearInterval(timerId);
      intervalTime = intervalTime * 0.9;
      timerId = setInterval(move, intervalTime);
    }

    generateApple();
  }

  squares[currentSnake[0]].classList.add("snake");
}

function generateApple() {
  do {
    appleIndex = Math.floor(Math.random() * squares.length);
  } while (squares[appleIndex].classList.contains("snake"));

  squares[appleIndex].classList.add("food");
}

function control(e) {
  if (e.key === "ArrowRight" && direction !== -1) {
    direction = 1;
  } else if (e.key === "ArrowUp" && direction !== width) {
    direction = -width;
  } else if (e.key === "ArrowLeft" && direction !== 1) {
    direction = -1;
  } else if (e.key === "ArrowDown" && direction !== -width) {
    direction = width;
  }
}

function gameOver() {
  clearInterval(timerId);
  msgDisplay.textContent = "Game Over!";

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    highScoreDisplay.textContent = highScore;
    msgDisplay.textContent += " New High Score!";
  }
}

document.addEventListener("keydown", control);
startBtn.addEventListener("click", startGame);
