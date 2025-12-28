// JavaScript for Snake Game

const width = 20; // 20x20 grid
const gridElement = document.getElementById("grid"); // The main grid container
const scoreDisplay = document.getElementById("currentScore"); // Current score display
const highScoreDisplay = document.getElementById("highScore"); // High score display
const startBtn = document.getElementById("startBtn"); // Start button
const pauseBtn = document.getElementById("pauseBtn"); // Pause button
const msgDisplay = document.getElementById("message"); // Message display
const soundtrack = document.getElementById("gamemusic"); // Background music
const coinSound = document.getElementById("coin-sound"); // Sound when eating apple
const loseSound = document.getElementById("lose-sound"); // Sound on game over
const diamondAppearSound = document.getElementById("diamond-appear-sound"); // Sound when diamond appears
const diamondEatSound = document.getElementById("diamond-eat-sound"); // Sound when eating diamond
const diamondTimerBar = document.getElementById("diamond-timer-bar"); // Diamond timer bar
const diamondContainer = document.getElementById("diamond-timer-container"); // Diamond timer container

let squares = []; // Array to hold grid squares
let currentSnake = [2, 1, 0]; // Initial snake positions
let direction = 1; // Initial direction (moving right)
let appleIndex = 0; // Initial apple position
let diamondIndex = 0; // Initial diamond position
let score = 0; // Initial score
let intervalTime = 200; // Initial speed
let timerId = 0; // Timer ID for game loop
let diamondTimeoutId = null; // Timeout ID for diamond disappearance
const diamondDuration = 5000; // Diamond stays for 5 seconds

// -------------- User and High Score Management -------------- //

// Check if user is logged in
const currentUser = localStorage.getItem("currentUser");

// If not logged in, redirect to homepage
if (!currentUser) {
  window.location.href = "../index.html";
}

// Retrieve user data and high score
let users = JSON.parse(localStorage.getItem("users")) || [];
const loggedInUser = users.find((user) => user.username === currentUser);
let highScore = 0;

// If user has a high score, retrieve it
if (loggedInUser && loggedInUser.games && loggedInUser.games.snake) {
  highScore = loggedInUser.games.snake.highScore;
}

// Display the high score on the page
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

// Initialize the grid
createGrid();

// Start or restart the game
function startGame() {
  console.log("Game started");
  soundtrack.volume = 0.2;
  soundtrack.play();

  squares.forEach((square) => {
    square.classList.remove(
      "snake-head",
      "snake-body",
      "snake-part",
      "food",
      "diamond"
    );
    square.style.transform = "";
  });

  squares[appleIndex].classList.remove("food");

  clearInterval(timerId);

  currentSnake = [2, 1, 0];
  score = 0;
  scoreDisplay.textContent = score;
  direction = 1;
  intervalTime = 200;
  msgDisplay.textContent = "";
  diamondIndex = 0;
  clearTimeout(diamondTimeoutId);
  removeDiamond();

  drawSnake();
  generateApple();

  timerId = setInterval(move, intervalTime);
}

// Move the snake in the current direction
function move() {
  if (
    (currentSnake[0] + width >= width * width && direction === width) ||
    (currentSnake[0] % width === width - 1 && direction === 1) ||
    (currentSnake[0] % width === 0 && direction === -1) ||
    (currentSnake[0] - width < 0 && direction === -width) ||
    squares[currentSnake[0] + direction].classList.contains("snake-body")
  ) {
    soundtrack.pause();
    soundtrack.currentTime = 0;
    loseSound.volume = 0.2;
    loseSound.play();
    return gameOver();
  }

  const tail = currentSnake.pop();
  squares[tail].classList.remove("snake-head", "snake-body", "snake-part");
  squares[tail].style.transform = "";

  currentSnake.unshift(currentSnake[0] + direction);

  if (squares[currentSnake[0]].classList.contains("diamond")) {
    diamondEatSound.volume = 0.2;
    diamondEatSound.play();
    removeDiamond();
    diamondIndex = 0;
    score += 5;
    scoreDisplay.textContent = score;
  }

  if (squares[currentSnake[0]].classList.contains("food")) {
    coinSound.volume = 0.2;
    coinSound.play();
    squares[currentSnake[0]].classList.remove("food");
    currentSnake.push(tail);
    score++;
    scoreDisplay.textContent = score;

    if (score % 5 === 0 && intervalTime > 50) {
      clearInterval(timerId);
      intervalTime = intervalTime * 0.9;
      timerId = setInterval(move, intervalTime);
    }

    generateApple();
    generateDiamond();
  }
  drawSnake();
}

// Generate a new apple at a random position
function generateApple() {
  do {
    appleIndex = Math.floor(Math.random() * squares.length);
  } while (squares[appleIndex].classList.contains("snake-part"));

  squares[appleIndex].classList.add("food");
}

// Generate a diamond at a random position with a chance
function generateDiamond() {
  if (diamondIndex !== 0) return;

  var randomChance = Math.random();
  console.log("Random chance for diamond:", randomChance);
  if (randomChance > 0.3) return;

  do {
    diamondIndex = Math.floor(Math.random() * squares.length);
  } while (
    squares[diamondIndex].classList.contains("snake-part") ||
    squares[diamondIndex].classList.contains("food")
  );

  squares[diamondIndex].classList.add("diamond");
  diamondAppearSound.volume = 0.2;
  diamondAppearSound.play();

  diamondContainer.classList.remove("hidden");

  diamondTimerBar.classList.remove("animate-timer");
  void diamondTimerBar.offsetWidth;
  diamondTimerBar.classList.add("animate-timer");

  clearTimeout(diamondTimeoutId);

  diamondTimeoutId = setTimeout(() => {
    removeDiamond();
  }, diamondDuration);
}

// Remove the diamond from the grid
function removeDiamond() {
  if (diamondIndex !== 0) {
    squares[diamondIndex].classList.remove("diamond");
    diamondIndex = 0;
  }
  diamondContainer.classList.add("hidden");
  diamondTimerBar.classList.remove("animate-timer");
}

// Control the snake with arrow keys or WASD
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

// Handle game over scenario
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

// Draw the snake on the grid
function drawSnake() {
  currentSnake.forEach((index, i) => {
    const square = squares[index];
    square.classList.remove("snake-head", "snake-body", "snake-part");
    square.style.transform = "";
    square.classList.add("snake-part");

    if (i === 0) {
      square.classList.add("snake-head");
      square.style.transform = getRotationStyle(direction) + " scale(1.8)";
    } else {
      square.classList.add("snake-body");
    }
  });
}

// Get rotation style based on direction
function getRotationStyle(dir) {
  if (dir === width) return "rotate(0deg)";
  if (dir === -width) return "rotate(180deg)";
  if (dir === 1) return "rotate(-90deg)";
  if (dir === -1) return "rotate(90deg)";

  return "rotate(0deg)";
}

document.addEventListener("keydown", control);
startBtn.addEventListener("click", startGame);
