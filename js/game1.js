// JavaScript for Snake Game

const width = 20; // 20x20 grid
const gridElement = document.getElementById("grid"); // The main grid container
const scoreDisplay = document.getElementById("currentScore"); // Current score display
const highScoreDisplay = document.getElementById("highScore"); // High score display
const startBtn = document.getElementById("startBtn"); // Start button
const pauseBtn = document.getElementById("pauseBtn"); // Pause button
const msgDisplay = document.getElementById("message"); // Message display

let squares = []; // Array to hold grid squares
let currentSnake = [2, 1, 0]; // Initial snake positions
let direction = 1; // Initial direction (moving right)
let appleIndex = 0; // Initial apple position
let score = 0; // Initial score
let intervalTime = 200; // Initial speed
let timerId = 0; // Timer ID for game loop

const currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
  window.location.href = "../index.html";
}
let users = JSON.parse(localStorage.getItem("users")) || [];
const loggedInUser = users.find((u) => u.username === currentUser);
let highScore = 0;
if (loggedInUser && loggedInUser.games && loggedInUser.games.snake) {
  highScore = loggedInUser.games.snake.highScore;
}

highScoreDisplay.textContent = highScore;

// -------------- functions -------------- //

// Create the grid by generating divs for each square in the css grid
function createGrid() {
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    gridElement.appendChild(square);
    squares.push(square);
  }
}
createGrid();

// Start or restart the game
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
  if ((e.key === "ArrowRight" || e.key === "d") && direction !== -1) {
    direction = 1;
  } else if ((e.key === "ArrowUp" || e.key === "w") && direction !== width) {
    direction = -width;
  } else if ((e.key === "ArrowLeft" || e.key === "a") && direction !== 1) {
    direction = -1;
  } else if ((e.key === "ArrowDown" || e.key === "s") && direction !== -width) {
    direction = width;
  }
}

function gameOver() {
  clearInterval(timerId);
  msgDisplay.textContent = "Game Over!";

  // 1. Retrieve the current list from memory
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // 2. Find the index (location) of the user in the list
  const userIndex = users.findIndex((u) => u.username === currentUser);

  // If the user is found (and they should be found if logged in)
  if (userIndex !== -1) {
    // Helper variable for easy access to snake data
    let snakeStats = users[userIndex].games.snake;

    // Update the number of games played
    snakeStats.gamesPlayed += 1;

    // Check if a record was broken
    if (score > snakeStats.highScore) {
      snakeStats.highScore = score;
      highScore = score; // Update local variable
      highScoreDisplay.textContent = highScore; // Update display
      msgDisplay.textContent += " New High Score!";
    }

    // Very important: Return the updated data into the main user
    users[userIndex].games.snake = snakeStats;

    // 3. Final save to Local Storage
    localStorage.setItem("users", JSON.stringify(users));
  }
}
document.addEventListener("keydown", control);
startBtn.addEventListener("click", startGame);
