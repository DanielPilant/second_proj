// Utility functions for user management

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

function getAllUsers() {
  const usersJSON = localStorage.getItem(USERS_KEY);
  if (!usersJSON) return [];
  return JSON.parse(usersJSON);
}

function saveAllUsers(usersArray) {
  const usersJSON = JSON.stringify(usersArray);
  localStorage.setItem(USERS_KEY, usersJSON);
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
    games: {
      snake: {
        highScore: 0,
        gamesPlayed: 0,
      },
      chess: {
        highScore: 0,
        gamesPlayed: 0,
      },
    },
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
    localStorage.setItem(CURRENT_USER_KEY, username);
    window.location.href = "../html/game1.html";

    // Here we usually redirect the user to the game page
    // window.location.href = "game.html";
    return true;
  } else {
    alert("Incorrect username or password");
    return false;
  }
}
// Functions that connect the button in HTML to our logic

function handleRegisterClick() {
  // Critical step: retrieving information from fields in HTML
  // Make sure you have id="regUser" and id="regPass" for registration inputs in HTML
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;

  // Call our corrected function with the data we retrieved
  const success = registerUser(user, pass);

  if (success) {
    // If successful, switch back to login form
    toggleForms();
  }
}

function handleLoginClick() {
  // Make sure you have id="loginUser" and id="loginPass" in HTML
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  // Call the corrected function
  loginUser(user, pass);
}
// Function that toggles between states (hides one, shows the other)
function toggleForms() {
  // 1. Get both elements (forms) from HTML
  const loginSec = document.getElementById("login-section");
  const regSec = document.getElementById("register-section");

  // 2. Change their state
  // classList.toggle means: "If it has the class hidden - remove it. If not - add it."
  loginSec.classList.toggle("hidden");
  regSec.classList.toggle("hidden");
}
