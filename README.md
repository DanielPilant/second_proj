# Web Game Platform - Frontend Project (2/7)

## Overview
This project was developed as the second out of seven projects in an academic Full Stack development course. It focuses on core Frontend technologies—HTML, CSS, and Vanilla JavaScript—without the use of external frameworks. The platform features an interactive environment with multiple games, showcasing advanced DOM manipulation, complex state management, and persistent data storage.

## Screenshots

| Authentication Screen | Game Lobby |
| :---: | :---: |
| <img width="400" alt="Authentication Screen" src="https://github.com/user-attachments/assets/e3b713e6-29b5-4585-86d2-200986e55156" /> | <img width="400" alt="Game Lobby" src="https://github.com/user-attachments/assets/2eae17f2-ffc6-4256-bf95-f344939c0386" /> |
| **Snake Game** | **PVP Chess** |
| <img width="400" alt="Snake Game" src="https://github.com/user-attachments/assets/3fe2031a-7594-40c8-8f0b-52c1f30957cf" /> | <img width="400" alt="PVP Chess" src="https://github.com/user-attachments/assets/71bb3923-1d82-475f-a54c-e13f01f27806" /> |

## Features & Project Structure
The platform is built with a modular architecture, divided into several specialized screens:

* **Authentication Screen:** The entry point (`index.html`), allowing users to log in and access their personalized dashboard.
* **Game Lobby:** The central hub (`lobby.html`). It displays a welcome greeting for the current user, a gallery of available games, and a personal leaderboard showing high scores and total games played for each title.
* **Game 1: Snake:** A modernized version of the classic Snake game (`game1.html`) featuring custom graphics and sound effects.
* **Game 2: PVP Chess:** A comprehensive two-player Chess game (`game2.html`).
    * **Full Game Logic:** Implements complete movement rules for all pieces (Pawn, Rook, Knight, Bishop, Queen, and King), including path-blocking checks and move validation.
    * **Move History:** Provides a real-time visual log of all moves executed during the match.
    * **Undo System:** Features an advanced "Undo Move" capability that tracks board states, allowing players to revert their last action.
    * **Leaderboard:** Includes a competitive scoring system where a lower move count results in a higher ranking.
    * **Visuals & Animations:** Uses Unicode characters for pieces and features smooth CSS-driven movement animations.

## Technologies Used
* **HTML5:** Structured the application using semantic elements and integrated media via `<audio>` tags.
* **CSS3:** Custom styling with modular files. Includes transition animations for a polished user experience.
* **Vanilla JavaScript (ES6+):** All game mechanics and lobby logic are written in pure JavaScript, using 2D arrays to manage board states.
* **Local Storage:** Extensively used for user authentication, saving high scores, and maintaining leaderboards across sessions.

## Folder Architecture
* `html/` - Contains the lobby and game markup files.
* `css/` - Contains modular stylesheets for each screen.
* `js/` - Contains the logic for the lobby, games, and shared utility functions.
* `assets/` - Contains images and sound effect resources.

## Getting Started
1.  Download or clone the project repository.
2.  Open the `index.html` file in the root directory using any modern web browser.
3.  Log in to explore the lobby and start playing!
