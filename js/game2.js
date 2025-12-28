var board = [];
        var selectedSquare = null;
        var currentTurn = 'white';
        var moveHistory = [];
        var moveCount = 0;
        var leaderboard = [];
        var currentUser = localStorage.getItem("currentUser");

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

        function renderBoard() {
            var chessboard = document.getElementById('chessboard');
            chessboard.innerHTML = '';

            for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                    var square = document.createElement('div');
                    square.setAttribute('data-row', row);
                    square.setAttribute('data-col', col);
                    
                    var isLight = (row + col) % 2 === 0;
                    square.className = 'square ' + (isLight ? 'light' : 'dark');
                    
                    if (board[row][col]) {
                        var piece = document.createElement('div');
                        piece.className = 'piece';
                        piece.textContent = board[row][col];
                        square.appendChild(piece);
                    }
                    
                    square.addEventListener('click', function() {
                        handleSquareClick(this);
                    });
                    
                    chessboard.appendChild(square);
                }
            }
        }

        function handleSquareClick(square) {
            var row = parseInt(square.getAttribute('data-row'));
            var col = parseInt(square.getAttribute('data-col'));
            var piece = board[row][col];

            if (selectedSquare) {
                var fromRow = selectedSquare.row;
                var fromCol = selectedSquare.col;
                
                if (isValidMove(fromRow, fromCol, row, col)) {
                    movePiece(fromRow, fromCol, row, col);
                    clearHighlights();
                    selectedSquare = null;
                } else {
                    clearHighlights();
                    selectedSquare = null;
                    
                    if (piece && isPieceColor(piece, currentTurn)) {
                        selectSquare(row, col, square);
                    }
                }
            } else {
                if (piece && isPieceColor(piece, currentTurn)) {
                    selectSquare(row, col, square);
                }
            }
        }

        function selectSquare(row, col, square) {
            selectedSquare = { row: row, col: col };
            square.classList.add('selected');
            highlightValidMoves(row, col);
        }

        function clearHighlights() {
            var squares = document.querySelectorAll('.square');
            for (var i = 0; i < squares.length; i++) {
                squares[i].classList.remove('selected', 'valid-move');
            }
        }

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

        function isPieceColor(piece, color) {
            var whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
            var blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
            
            if (color === 'white') {
                return whitePieces.indexOf(piece) !== -1;
            } else {
                return blackPieces.indexOf(piece) !== -1;
            }
        }

        function isValidMove(fromRow, fromCol, toRow, toCol) {
            if (fromRow === toRow && fromCol === toCol) return false;
            if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
            
            var piece = board[fromRow][fromCol];
            var targetPiece = board[toRow][toCol];
            
            if (targetPiece && isPieceColor(targetPiece, currentTurn)) return false;

            var rowDiff = Math.abs(toRow - fromRow);
            var colDiff = Math.abs(toCol - fromCol);

            if (piece === '♙' || piece === '♟') {
                var direction = piece === '♙' ? -1 : 1;
                var startRow = piece === '♙' ? 6 : 1;
                
                if (toCol === fromCol && !targetPiece) {
                    if (toRow === fromRow + direction) return true;
                    if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) return true;
                }
                
                if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
                    return true;
                }
                return false;
            }

            if (piece === '♖' || piece === '♜') {
                if (rowDiff === 0 || colDiff === 0) {
                    return isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;
            }

            if (piece === '♗' || piece === '♝') {
                if (rowDiff === colDiff) {
                    return isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;
            }

            if (piece === '♕' || piece === '♛') {
                if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
                    return isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;
            }

            if (piece === '♘' || piece === '♞') {
                if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                    return true;
                }
                return false;
            }

            if (piece === '♔' || piece === '♚') {
                if (rowDiff <= 1 && colDiff <= 1) {
                    return true;
                }
                return false;
            }

            return false;
        }

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

        function movePiece(fromRow, fromCol, toRow, toCol) {
            var piece = board[fromRow][fromCol];
            var capturedPiece = board[toRow][toCol];
            
            // Animate the move
            animateMove(fromRow, fromCol, toRow, toCol, function() {
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
            setTimeout(function() {
                movingPiece.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
            }, 10);

            // Complete the animation
            setTimeout(function() {
                document.body.removeChild(movingPiece);
                fromSquare.classList.remove('highlight-from');
                callback();
            }, 350);
        }

        function updateTurnIndicator() {
            var indicator = document.getElementById('turnIndicator');
            indicator.textContent = currentTurn === 'white' ? "White's Turn" : "Black's Turn";
        }

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

        function showWinner(winner) {
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('winnerPopup').style.display = 'block';
            document.getElementById('winnerText').textContent = (winner === 'white' ? 'White' : 'Black') + ' Wins!';
            document.getElementById('totalMoves').textContent = moveCount;
        }

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
            leaderboard.sort(function(a, b) {
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

        function saveToUserStats(moves) {
            // Retrieve the current list from localStorage
            var users = JSON.parse(localStorage.getItem("users")) || [];
            
            // Find the index of the current user
            var userIndex = users.findIndex(function(u) {
                return u.username === currentUser;
            });
            
            if (userIndex !== -1) {
                // Initialize chess stats if they don't exist
                if (!users[userIndex].games) {
                    users[userIndex].games = {};
                }
                if (!users[userIndex].games.chess) {
                    users[userIndex].games.chess = {
                        highScore: 1000 - moves, // Convert moves to score (fewer moves = higher score)
                        gamesPlayed: 0
                    };
                }
                
                // Calculate score: fewer moves = higher score
                var currentScore = 1000 - moves;
                
                // Update chess stats
                users[userIndex].games.chess.gamesPlayed += 1;
                
                // Update high score if this game was better (higher score)
                if (currentScore > users[userIndex].games.chess.highScore) {
                    users[userIndex].games.chess.highScore = currentScore;
                }
                
                // Save back to localStorage
                localStorage.setItem("users", JSON.stringify(users));
                console.log("User stats saved:", users[userIndex].games.chess);
            }
        }

        function loadLeaderboard() {
            var saved = localStorage.getItem('chessLeaderboard');
            if (saved) {
                leaderboard = JSON.parse(saved);
                displayLeaderboard();
            }
        }

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

        function backToLobby() {
            board = [];
            selectedSquare = null;
            currentTurn = 'white';
            moveHistory = [];
            moveCount = 0;
            
            document.getElementById('moveHistory').innerHTML = '';
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('winnerPopup').style.display = 'none';
            document.getElementById('winnerName').value = '';
            
            initBoard();
            updateTurnIndicator();
        }

        initBoard();

