// JavaScript for Snake Game
// import { getAllUsers, saveAllUsers } from "./util.js";

// -------------- DOM Elements -------------- //

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
const btnEasy = document.getElementById("btnEasy"); // Easy difficulty button
const btnMedium = document.getElementById("btnMedium"); // Medium difficulty button
const btnHard = document.getElementById("btnHard"); // Hard difficulty button
const stopBtn = document.getElementById("stopBtn"); // Stop button

// -------------- Game Variables -------------- //

let squares = []; // Array to hold grid squares
let currentSnake = [2, 1, 0]; // Initial snake positions
let direction = 1; // Initial direction (moving right)
let appleIndex = 0; // Initial apple position
let diamondIndex = 0; // Initial diamond position
let score = 0; // Initial score
let startingSpeed = 200; // Default speed
let intervalTime = startingSpeed; // Initial speed
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

// Set difficulty level based on button click
function setDifficulty(speed, selectedBtn) {
  startingSpeed = speed;

  btnEasy.classList.remove("selected");
  btnMedium.classList.remove("selected");
  btnHard.classList.remove("selected");

  selectedBtn.classList.add("selected");
}

// Start or restart the game
function startGame() {
  pauseBtn.hidden = false; // Show pause button
  stopBtn.hidden = false; // Show stop button

  // Play background music
  soundtrack.volume = 0.3;
  soundtrack.currentTime = 0;
  soundtrack.play();

  btnEasy.hidden = true;
  btnMedium.hidden = true;
  btnHard.hidden = true;
  startBtn.textContent = "Restart Game";

  // Clear the grid of any previous snake, food, or diamond
  squares.forEach((square) => {
    square.classList.remove("snake-head", "snake-body", "snake-part", "food");
    square.style.transform = "";
  });

  // Reset game variables to initial state
  clearInterval(timerId);
  clearTimeout(diamondTimeoutId);
  currentSnake = [2, 1, 0];
  score = 0;
  scoreDisplay.textContent = score;
  direction = 1;
  intervalTime = startingSpeed;
  msgDisplay.textContent = "";
  removeDiamond();
  diamondIndex = 0;

  // Draw the initial snake and generate the first apple
  drawSnake();
  generateApple();

  timerId = setInterval(move, intervalTime);
}

// Pause or resume the game
function PauseResumeGame() {
  // If the game is currently running, pause it
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    soundtrack.pause();
    pauseBtn.textContent = "Resume";
  } else {
    timerId = setInterval(move, intervalTime);
    soundtrack.volume = 0.3;
    soundtrack.play();

    pauseBtn.textContent = "Pause Game";
    msgDisplay.textContent = "";
  }
}

// Stop the game and reset everything
function stopGame() {
  clearInterval(timerId);
  timerId = null;
  soundtrack.pause();
  soundtrack.currentTime = 0;
  pauseBtn.hidden = true;
  stopBtn.hidden = true;
  msgDisplay.textContent = "";
  // Clear the grid of any previous snake, food, or diamond
  squares.forEach((square) => {
    square.classList.remove("snake-head", "snake-body", "snake-part", "food");
    square.style.transform = "";
  });
  btnEasy.hidden = false;
  btnMedium.hidden = false;
  btnHard.hidden = false;
  startBtn.textContent = "Start Game";
}

// Move the snake in the current direction
function move() {
  // -------------- Check for Collisions -------------- //

  // Check for collisions with walls or self
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

  // -------------- Move Snake -------------- //

  // Move the snake by removing the tail and adding a new head
  const tail = currentSnake.pop();
  squares[tail].classList.remove("snake-head", "snake-body", "snake-part");
  squares[tail].style.transform = "";

  // Add new head based on current direction
  currentSnake.unshift(currentSnake[0] + direction);

  // -------------- Check for Food and Diamond Consumption -------------- //

  // Check if the snake has eaten a diamond
  if (squares[currentSnake[0]].classList.contains("diamond")) {
    diamondEatSound.volume = 0.2;
    diamondEatSound.play();
    removeDiamond();
    diamondIndex = 0;
    score += 5;
    scoreDisplay.textContent = score;
  }

  // Check if the snake has eaten an apple
  if (squares[currentSnake[0]].classList.contains("food")) {
    coinSound.volume = 0.2;
    coinSound.play();
    squares[currentSnake[0]].classList.remove("food");
    currentSnake.push(tail);
    score++;
    scoreDisplay.textContent = score;
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
  // Only generate if there isn't already a diamond
  if (diamondIndex !== 0) return;

  // 70% chance to not generate a diamond
  var randomChance = Math.random();
  if (randomChance > 0.3) return;

  // Find a position that is not occupied by the snake or food
  do {
    diamondIndex = Math.floor(Math.random() * squares.length);
  } while (
    squares[diamondIndex].classList.contains("snake-part") ||
    squares[diamondIndex].classList.contains("food")
  );

  // Show the diamond on the grid
  squares[diamondIndex].classList.add("diamond");
  diamondAppearSound.volume = 0.2;
  diamondAppearSound.play();

  // Show and animate the diamond timer bar
  diamondContainer.classList.remove("hidden");

  // Restart the CSS animation
  diamondTimerBar.classList.remove("animate-timer");

  // Trigger reflow to restart the animation
  void diamondTimerBar.offsetWidth;

  // Add the animation class back
  diamondTimerBar.classList.add("animate-timer");

  // Set timeout to remove the diamond after duration
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
  if (
    (e.key === "ArrowRight" || e.key === "d" || e.key === "D") &&
    direction !== -1
  ) {
    direction = 1;
  } else if (
    (e.key === "ArrowUp" || e.key === "w" || e.key === "W") &&
    direction !== width
  ) {
    direction = -width;
  } else if (
    (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") &&
    direction !== 1
  ) {
    direction = -1;
  } else if (
    (e.key === "ArrowDown" || e.key === "s" || e.key === "S") &&
    direction !== -width
  ) {
    direction = width;
  } else if ((e.key === "p" || e.key === "P") && (timerId || !timerId)) {
    PauseResumeGame();
  }
}

// Handle game over scenario
function gameOver() {
  // -------------- Stop the Game -------------- //
  pauseBtn.hidden = true;
  clearInterval(timerId);
  msgDisplay.textContent = "Game Over!";

  // -------------- Update User Data and High Score -------------- //

  // 1. Retrieve the current list from memory
  let users = getAllUsers();

  // 2. Find the index (location) of the user in the list
  const userIndex = users.findIndex((user) => user.username === currentUser);

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
    saveAllUsers(users);
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

// -------------- Event Listeners -------------- //

// Listen for key presses and button clicks
document.addEventListener("keydown", control);
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", PauseResumeGame);
btnEasy.addEventListener("click", () => setDifficulty(400, btnEasy));
btnMedium.addEventListener("click", () => setDifficulty(200, btnMedium));
btnHard.addEventListener("click", () => setDifficulty(100, btnHard));
stopBtn.addEventListener("click", stopGame);

// Initial difficulty selection
setDifficulty(200, btnMedium);
