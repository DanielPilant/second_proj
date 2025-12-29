var board = [];
var selectedSquare = null;
var currentTurn = 'white';
var moveHistory = [];
var boardHistory = []; // Stack to store board states for undo
var moveCount = 0;
var leaderboard = [];
var currentUser = localStorage.getItem("currentUser");

// Unicode piece symbols
var pieces = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Setup the board with starting position
function initBoard() {
    board = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    renderBoard();
    loadLeaderboard();
}

// Draw the board on screen
function renderBoard() {
    var chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';

    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var square = document.createElement('div');
            square.setAttribute('data-row', row);
            square.setAttribute('data-col', col);

            // Alternate light and dark squares
            var isLight = (row + col) % 2 === 0;
            square.className = 'square ' + (isLight ? 'light' : 'dark');

            // Add piece if there's one on this square
            if (board[row][col]) {
                var piece = document.createElement('div');
                piece.className = 'piece';
                piece.textContent = board[row][col];
                square.appendChild(piece);
            }

            square.addEventListener('click', function () {
                handleSquareClick(this);
            });

            chessboard.appendChild(square);
        }
    }
}

// Handle when player clicks a square
function handleSquareClick(square) {
    var row = parseInt(square.getAttribute('data-row'));
    var col = parseInt(square.getAttribute('data-col'));
    var piece = board[row][col];

    if (selectedSquare) {
        // Already have a piece selected - try to move it
        var fromRow = selectedSquare.row;
        var fromCol = selectedSquare.col;

        if (isValidMove(fromRow, fromCol, row, col)) {
            movePiece(fromRow, fromCol, row, col);
            clearHighlights();
            selectedSquare = null;
        } else {
            // Invalid move - deselect and maybe select new piece
            clearHighlights();
            selectedSquare = null;

            if (piece && isPieceColor(piece, currentTurn)) {
                selectSquare(row, col, square);
            }
        }
    } else {
        // No piece selected yet - select one
        if (piece && isPieceColor(piece, currentTurn)) {
            selectSquare(row, col, square);
        }
    }
}

// Mark a square as selected and show valid moves
function selectSquare(row, col, square) {
    selectedSquare = { row: row, col: col };
    square.classList.add('selected');
    highlightValidMoves(row, col);
}

// Remove all highlights from board
function clearHighlights() {
    var squares = document.querySelectorAll('.square');
    for (var i = 0; i < squares.length; i++) {
        squares[i].classList.remove('selected', 'valid-move');
    }
}

// Light up all squares where the piece can move
function highlightValidMoves(row, col) {
    for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
            if (isValidMove(row, col, r, c)) {
                var squares = document.querySelectorAll('.square');
                var index = r * 8 + c;
                squares[index].classList.add('valid-move');
            }
        }
    }
}

// Check if piece belongs to this color
function isPieceColor(piece, color) {
    var whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    var blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];

    if (color === 'white') {
        return whitePieces.indexOf(piece) !== -1;
    } else {
        return blackPieces.indexOf(piece) !== -1;
    }
}

// Check if move is legal according to chess rules
function isValidMove(fromRow, fromCol, toRow, toCol) {
    // Can't move to the same square
    if (fromRow === toRow && fromCol === toCol) return false;
    // Can't move outside the board
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

    var piece = board[fromRow][fromCol];
    var targetPiece = board[toRow][toCol];

    // Can't capture your own pieces
    if (targetPiece && isPieceColor(targetPiece, currentTurn)) return false;

    var rowDiff = Math.abs(toRow - fromRow);
    var colDiff = Math.abs(toCol - fromCol);

    // PAWN movement rules
    if (piece === '♙' || piece === '♟') {
        // White pawns move up (-1), black pawns move down (+1)
        var direction = piece === '♙' ? -1 : 1;
        var startRow = piece === '♙' ? 6 : 1;

        // Forward movement (no capture)
        if (toCol === fromCol && !targetPiece) {
            // Single step forward
            if (toRow === fromRow + direction) return true;
            // Double step from starting position
            if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) return true;
        }

        // Diagonal capture
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
            return true;
        }
        return false;
    }

    // ROOK movement rules (horizontal and vertical)
    if (piece === '♖' || piece === '♜') {
        if (rowDiff === 0 || colDiff === 0) {
            return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }

    // BISHOP movement rules (diagonal only)
    if (piece === '♗' || piece === '♝') {
        if (rowDiff === colDiff) {
            return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }

    // QUEEN movement rules (combination of rook and bishop)
    if (piece === '♕' || piece === '♛') {
        if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
            return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
    }

    // KNIGHT movement rules (L-shape: 2+1 or 1+2)
    if (piece === '♘' || piece === '♞') {
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            return true;
        }
        return false;
    }

    // KING movement rules (one square in any direction)
    if (piece === '♔' || piece === '♚') {
        if (rowDiff <= 1 && colDiff <= 1) {
            return true;
        }
        return false;
    }

    return false;
}

// Make sure no pieces block the path (for rooks, bishops, queens)
function isPathClear(fromRow, fromCol, toRow, toCol) {
    var rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
    var colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);

    var currentRow = fromRow + rowStep;
    var currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) return false;
        currentRow += rowStep;
        currentCol += colStep;
    }

    return true;
}

// Execute a piece movement with animation
function movePiece(fromRow, fromCol, toRow, toCol) {
    var piece = board[fromRow][fromCol];
    var capturedPiece = board[toRow][toCol];

    // Save current board state before making the move
    saveBoardState();

    // Animate the move
    animateMove(fromRow, fromCol, toRow, toCol, function () {
        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = '';

        moveCount++;
        addMoveToHistory(piece, fromRow, fromCol, toRow, toCol, capturedPiece);

        if (capturedPiece === '♔' || capturedPiece === '♚') {
            showWinner(currentTurn);
        } else {
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            updateTurnIndicator();
        }

        renderBoard();
        updateUndoButton();
    });
}

function animateMove(fromRow, fromCol, toRow, toCol, callback) {
    var squares = document.querySelectorAll('.square');
    var fromIndex = fromRow * 8 + fromCol;
    var toIndex = toRow * 8 + toCol;

    var fromSquare = squares[fromIndex];
    var toSquare = squares[toIndex];

    var pieceElement = fromSquare.querySelector('.piece');
    if (!pieceElement) {
        callback();
        return;
    }

    // Highlight source square
    fromSquare.classList.add('highlight-from');

    // Get positions
    var fromRect = fromSquare.getBoundingClientRect();
    var toRect = toSquare.getBoundingClientRect();

    var deltaX = toRect.left - fromRect.left;
    var deltaY = toRect.top - fromRect.top;

    // Clone the piece for animation
    var movingPiece = pieceElement.cloneNode(true);
    movingPiece.classList.add('moving');
    movingPiece.style.position = 'fixed';
    movingPiece.style.left = fromRect.left + 'px';
    movingPiece.style.top = fromRect.top + 'px';
    movingPiece.style.width = fromRect.width + 'px';
    movingPiece.style.height = fromRect.height + 'px';
    movingPiece.style.fontSize = '50px';
    movingPiece.style.display = 'flex';
    movingPiece.style.alignItems = 'center';
    movingPiece.style.justifyContent = 'center';
    movingPiece.style.zIndex = '1000';

    document.body.appendChild(movingPiece);

    // Hide original piece
    pieceElement.style.opacity = '0';

    // Animate captured piece if exists
    var capturedElement = toSquare.querySelector('.piece');
    if (capturedElement) {
        capturedElement.classList.add('captured');
    }

    // Animate the move
    setTimeout(function () {
        movingPiece.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
    }, 10);

    // Complete the animation
    setTimeout(function () {
        document.body.removeChild(movingPiece);
        fromSquare.classList.remove('highlight-from');
        callback();
    }, 350);
}

// Update whose turn it is
function updateTurnIndicator() {
    var indicator = document.getElementById('turnIndicator');
    indicator.textContent = currentTurn === 'white' ? "White's Turn" : "Black's Turn";
}

// Record the move in history
function addMoveToHistory(piece, fromRow, fromCol, toRow, toCol, captured) {
    var cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var fromPos = cols[fromCol] + (8 - fromRow);
    var toPos = cols[toCol] + (8 - toRow);

    var moveText = moveCount + '. ' + piece + ' ' + fromPos + ' → ' + toPos;
    if (captured) {
        moveText += ' (captured ' + captured + ')';
    }

    moveHistory.push(moveText);

    var historyDiv = document.getElementById('moveHistory');
    var entry = document.createElement('div');
    entry.className = 'move-entry';
    entry.textContent = moveText;
    historyDiv.appendChild(entry);
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

// Show victory popup
function showWinner(winner) {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('winnerPopup').style.display = 'block';
    document.getElementById('winnerText').textContent = (winner === 'white' ? 'White' : 'Black') + ' Wins!';
    document.getElementById('totalMoves').textContent = moveCount;
}

// Save game to leaderboard
function saveToLeaderboard() {
    var name = document.getElementById('winnerName').value.trim();
    if (!name) {
        alert('Please enter a name!');
        return;
    }

    var entry = {
        name: name,
        moves: moveCount,
        date: new Date().toLocaleDateString()
    };

    leaderboard.push(entry);
    leaderboard.sort(function (a, b) {
        return a.moves - b.moves;
    });

    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }

    localStorage.setItem('chessLeaderboard', JSON.stringify(leaderboard));

    // Save to user's chess stats
    if (currentUser) {
        saveToUserStats(moveCount);
    }

    displayLeaderboard();
    backToLobby();
}

// Update user's game stats
function saveToUserStats(moves) {
    var users = JSON.parse(localStorage.getItem("users")) || [];

    // Find user in list
    var userIndex = users.findIndex(function (u) {
        return u.username === currentUser;
    });

    if (userIndex !== -1) {
        // Setup chess stats if needed
        if (!users[userIndex].games) {
            users[userIndex].games = {};
        }
        if (!users[userIndex].games.chess) {
            users[userIndex].games.chess = {
                highScore: 1000 - moves, // Less moves = higher score
                gamesPlayed: 0
            };
        }

        // Score: fewer moves = better
        var currentScore = 1000 - moves;

        users[userIndex].games.chess.gamesPlayed += 1;

        // Update best score if this was better
        if (currentScore > users[userIndex].games.chess.highScore) {
            users[userIndex].games.chess.highScore = currentScore;
        }

        localStorage.setItem("users", JSON.stringify(users));
        console.log("Stats updated:", users[userIndex].games.chess);
    }
}

// Load leaderboard from storage
function loadLeaderboard() {
    var saved = localStorage.getItem('chessLeaderboard');
    if (saved) {
        leaderboard = JSON.parse(saved);
        displayLeaderboard();
    }
}

// Render the leaderboard on screen
function displayLeaderboard() {
    var leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardDiv.innerHTML = '<p style="text-align: center; color: #999;">No entries yet</p>';
        return;
    }

    for (var i = 0; i < leaderboard.length; i++) {
        var entry = document.createElement('div');
        entry.className = 'leaderboard-entry';
        entry.innerHTML = '<span><strong>' + (i + 1) + '.</strong> ' + leaderboard[i].name + '</span><span><strong>' + leaderboard[i].moves + '</strong> moves</span>';
        leaderboardDiv.appendChild(entry);
    }
}

// Reset game and go back to main menu
function backToLobby() {
    board = [];
    selectedSquare = null;
    currentTurn = 'white';
    moveHistory = [];
    boardHistory = [];
    moveCount = 0;

    document.getElementById('moveHistory').innerHTML = '';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('winnerPopup').style.display = 'none';
    document.getElementById('winnerName').value = '';

    initBoard();
    updateTurnIndicator();
    updateUndoButton();
}

// Save current board state for undo feature
function saveBoardState() {
    // Make a copy of the board
    var boardCopy = [];
    for (var i = 0; i < board.length; i++) {
        boardCopy[i] = board[i].slice();
    }

    // Save the snapshot
    boardHistory.push({
        board: boardCopy,
        turn: currentTurn,
        moveCount: moveCount
    });
}

// Undo the last move
function undoMove() {
    if (boardHistory.length === 0) return;

    // Get the previous state
    var previousState = boardHistory.pop();

    // Restore the board
    board = previousState.board;
    currentTurn = previousState.turn;
    moveCount = previousState.moveCount;

    // Remove the last move from history display
    var historyDiv = document.getElementById('moveHistory');
    if (historyDiv.lastChild) {
        historyDiv.removeChild(historyDiv.lastChild);
    }

    // Remove the last move from moveHistory array
    if (moveHistory.length > 0) {
        moveHistory.pop();
    }

    // Update the UI
    renderBoard();
    updateTurnIndicator();
    updateUndoButton();
    clearHighlights();
    selectedSquare = null;
}

// Enable/disable the undo button
function updateUndoButton() {
    var undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.disabled = boardHistory.length === 0;
    }
}

initBoard();

