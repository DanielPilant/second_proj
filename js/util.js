// Utility functions for user management

function getAllUsers() {
  const usersJSON = localStorage.getItem("users");
  if (!usersJSON) return [];
  return JSON.parse(usersJSON);
}

function saveAllUsers(usersArray) {
  const usersJSON = JSON.stringify(usersArray);
  localStorage.setItem("users", usersJSON);
}

function registerUser(username, password) {
  const users = getAllUsers(); // 1. Get everyone

  // 2. Check if user already exists
  // The find function searches the array for someone with this name
  const existingUser = users.find((user) => user.username === username);

  if (existingUser) {
    alert("Username is taken!");
    return false; // Registration failed
  }

  // 3. Create new user object
  const newUser = {
    username: username,
    password: password,
    highScore: 0, // Starts with 0 points
    gamesPlayed: 0, // Can also add how many games played
  };

  // 4. Add to list and save
  users.push(newUser);
  saveAllUsers(users);

  alert("Registered successfully!");
  return true;
}

function loginUser(username, password) {
  const users = getAllUsers();

  // Search for user with same name and password
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Found! Save in separate memory who is currently logged in
    localStorage.setItem("currentUser", username);
    alert("Logged in successfully, " + username);

    // Here we usually redirect the user to the game page
    // window.location.href = "game.html";
    return true;
  } else {
    alert("Incorrect username or password");
    return false;
  }
}
// פונקציה שמחליפה בין המצבים (מסתירה אחד, מראה את השני)
function toggleForms() {
  // 1. תופסים את שני האלמנטים (הטפסים) מה-HTML
  const loginSec = document.getElementById("login-section");
  const regSec = document.getElementById("register-section");

  // 2. משנים את המצב שלהם
  // classList.toggle אומר: "אם יש לו את המחלקה hidden - תוריד אותה. אם אין - תוסיף אותה."
  loginSec.classList.toggle("hidden");
  regSec.classList.toggle("hidden");
}
