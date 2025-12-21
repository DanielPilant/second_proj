class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.gameOver = false;
        this.enPassantTarget = null;
        this. castlingRights = {
            white: { kingSide: true, queenSide: true },
            black:  { kingSide: true, queenSide: true }
        };
        
        this.pieces = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight:  '♘', pawn: '♙' },
            black:  { king: '♚', queen: '♛', rook:  '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };
        
        this.initBoard();
        this.renderBoard();
        this.setupEventListeners();
    }
    
    initBoard() {
        // Initialize empty board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up black pieces (row 0 and 1)
        this.board[0] = [
            { type: 'rook', color: 'black' },
            { type: 'knight', color: 'black' },
            { type: 'bishop', color: 'black' },
            { type: 'queen', color: 'black' },
            { type: 'king', color: 'black' },
            { type: 'bishop', color: 'black' },
            { type: 'knight', color: 'black' },
            { type: 'rook', color: 'black' }
        ];
        this.board[1] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' }));
        
        // Set up white pieces (row 6 and 7)
        this.board[6] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' }));
        this.board[7] = [
            { type: 'rook', color: 'white' },
            { type: 'knight', color: 'white' },
            { type: 'bishop', color: 'white' },
            { type: 'queen', color: 'white' },
            { type: 'king', color: 'white' },
            { type: 'bishop', color: 'white' },
            { type: 'knight', color: 'white' },
            { type: 'rook', color: 'white' }
        ];
    }
    
    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document. createElement('div');
                square. classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan. classList.add('piece');
                    pieceSpan.classList.add(`${piece.color}-piece`);
                    pieceSpan.textContent = this.pieces[piece.color][piece.type];
                    square.appendChild(pieceSpan);
                }
                
                // Highlight selected piece
                if (this.selectedPiece && 
                    this.selectedPiece.row === row && 
                    this.selectedPiece.col === col) {
                    square.classList.add('selected');
                }
                
                // Highlight valid moves
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    if (this.board[row][col]) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                // Highlight king in check
                if (piece && piece.type === 'king' && 
                    piece.color === this.currentPlayer && 
                    this.isKingInCheck(piece.color)) {
                    square.classList.add('check');
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                chessboard.appendChild(square);
            }
        }
    }
    
    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
    }
    
    handleSquareClick(row, col) {
        if (this.gameOver) return;
        
        const piece = this.board[row][col];
        
        // If a piece is already selected
        if (this.selectedPiece) {
            // Check if clicking on a valid move
            const isValidMove = this.validMoves.some(move => move. row === row && move.col === col);
            
            if (isValidMove) {
                this.movePiece(this.selectedPiece. row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.validMoves = [];
            } else if (piece && piece.color === this.currentPlayer) {
                // Select a different piece of same color
                this.selectedPiece = { row, col };
                this.validMoves = this.getValidMoves(row, col);
            } else {
                // Deselect
                this.selectedPiece = null;
                this.validMoves = [];
            }
        } else if (piece && piece.color === this.currentPlayer) {
            // Select piece
            this.selectedPiece = { row, col };
            this.validMoves = this. getValidMoves(row, col);
        }
        
        this.renderBoard();
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'rook': 
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'knight': 
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'bishop': 
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col, piece. color);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }
        
        // Filter out moves that would leave king in check
        moves = moves. filter(move => {
            return !this.wouldBeInCheck(row, col, move.row, move.col, piece.color);
        });
        
        return moves;
    }
    
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        if (this.isInBounds(row + direction, col) && ! this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from start
            if (row === startRow && ! this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Captures
        for (const dc of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                // En passant
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === newRow && 
                    this.enPassantTarget.col === newCol) {
                    moves.push({ row: newRow, col: newCol, enPassant: true });
                }
            }
        }
        
        return moves;
    }
    
    getRookMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    }
    
    getBishopMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    }
    
    getQueenMoves(row, col, color) {
        return this. getSlidingMoves(row, col, color, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }
    
    getSlidingMoves(row, col, color, directions) {
        const moves = [];
        
        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (! target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }
        
        return moves;
    }
    
    getKnightMoves(row, col, color) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    getKingMoves(row, col, color) {
        const moves = [];
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        // Castling
        if (! this.isKingInCheck(color)) {
            const baseRow = color === 'white' ?  7 : 0;
            
            // King side castling
            if (this.castlingRights[color].kingSide) {
                if (! this.board[baseRow][5] && !this.board[baseRow][6]) {
                    if (! this.wouldBeInCheck(row, col, baseRow, 5, color) &&
                        !this.wouldBeInCheck(row, col, baseRow, 6, color)) {
                        moves.push({ row: baseRow, col:  6, castling: 'kingSide' });
                    }
                }
            }
            
            // Queen side castling
            if (this. castlingRights[color].queenSide) {
                if (!this.board[baseRow][1] && !this.board[baseRow][2] && !this.board[baseRow][3]) {
                    if (! this.wouldBeInCheck(row, col, baseRow, 3, color) &&
                        ! this.wouldBeInCheck(row, col, baseRow, 2, color)) {
                        moves.push({ row: baseRow, col: 2, castling: 'queenSide' });
                    }
                }
            }
        }
        
        return moves;
    }
    
    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this. board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        const moveInfo = this.validMoves.find(m => m.row === toRow && m.col === toCol);
        
        // Save state for undo
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: capturedPiece ?  { ...capturedPiece } : null,
            enPassantTarget: this.enPassantTarget,
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            moveInfo: moveInfo
        });
        
        // Handle en passant capture
        if (moveInfo && moveInfo.enPassant) {
            const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            this.board[capturedPawnRow][toCol] = null;
        }
        
        // Handle castling
        if (moveInfo && moveInfo.castling) {
            const baseRow = piece.color === 'white' ? 7 : 0;
            if (moveInfo.castling === 'kingSide') {
                this.board[baseRow][5] = this.board[baseRow][7];
                this.board[baseRow][7] = null;
            } else {
                this. board[baseRow][3] = this.board[baseRow][0];
                this.board[baseRow][0] = null;
            }
        }
        
        // Move the piece
        this.board[toRow][toCol] = piece;
        this. board[fromRow][fromCol] = null;
        
        // Handle pawn promotion
        if (piece. type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', color:  piece.color };
        }
        
        // Update en passant target
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { 
                row: (fromRow + toRow) / 2, 
                col: toCol 
            };
        } else {
            this.enPassantTarget = null;
        }
        
        // Update castling rights
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingSide = false;
            this.castlingRights[piece. color].queenSide = false;
        }
        if (piece.type === 'rook') {
            const baseRow = piece.color === 'white' ? 7 : 0;
            if (fromRow === baseRow && fromCol === 0) {
                this.castlingRights[piece.color].queenSide = false;
            }
            if (fromRow === baseRow && fromCol === 7) {
                this.castlingRights[piece.color].kingSide = false;
            }
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update UI
        this.updateTurnIndicator();
        this.updateMoveHistory(piece, fromRow, fromCol, toRow, toCol, capturedPiece);
        this.checkGameState();
    }
    
    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make temporary move
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        const inCheck = this.isKingInCheck(color);
        
        // Undo temporary move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = capturedPiece;
        
        return inCheck;
    }
    
    isKingInCheck(color) {
        // Find king position
        let kingRow, kingCol;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        // Check if any opponent piece can attack the king
        const opponentColor = color === 'white' ? 'black' :  'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this. board[row][col];
                if (piece && piece.color === opponentColor) {
                    const attacks = this.getAttackingSquares(row, col, piece);
                    if (attacks.some(sq => sq.row === kingRow && sq.col === kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    getAttackingSquares(row, col, piece) {
        // Similar to getValidMoves but without check validation
        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                return [
                    { row: row + direction, col: col - 1 },
                    { row: row + direction, col:  col + 1 }
                ].filter(sq => this.isInBounds(sq.row, sq.col));
            case 'rook':
                return this.getSlidingMoves(row, col, piece.color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
            case 'knight':
                return this.getKnightMoves(row, col, piece. color);
            case 'bishop':
                return this.getSlidingMoves(row, col, piece.color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            case 'queen':
                return this.getSlidingMoves(row, col, piece.color, [
                    [-1, 0], [1, 0], [0, -1], [0, 1],
                    [-1, -1], [-1, 1], [1, -1], [1, 1]
                ]);
            case 'king': 
                const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
                return offsets
                    .map(([dr, dc]) => ({ row: row + dr, col:  col + dc }))
                    .filter(sq => this.isInBounds(sq.row, sq.col));
            default:
                return [];
        }
    }
    
    hasLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this. board[row][col];
                if (piece && piece.color === color) {
                    if (this.getValidMoves(row, col).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    checkGameState() {
        const statusEl = document.getElementById('game-status');
        
        if (! this.hasLegalMoves(this.currentPlayer)) {
            this.gameOver = true;
            if (this.isKingInCheck(this.currentPlayer)) {
                const winner = this.currentPlayer === 'white' ? 'Black' : 'White';
                statusEl.textContent = `Checkmate! ${winner} wins! `;
            } else {
                statusEl. textContent = 'Stalemate! The game is a draw.';
            }
        } else if (this.isKingInCheck(this.currentPlayer)) {
            statusEl. textContent = 'Check! ';
        } else {
            statusEl.textContent = '';
        }
    }
    
    updateTurnIndicator() {
        const indicator = document.getElementById('turn-indicator');
        indicator.textContent = `${this.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`;
    }
    
    updateMoveHistory(piece, fromRow, fromCol, toRow, toCol, captured) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        const from = files[fromCol] + ranks[fromRow];
        const to = files[toCol] + ranks[toRow];
        const pieceSymbol = this.pieces[piece.color][piece.type];
        const captureSymbol = captured ? 'x' : '-';
        
        const movesEl = document.getElementById('moves');
        const moveNumber = Math.ceil(this.moveHistory.length / 2);
        const isWhiteMove = piece.color === 'white';
        
        if (isWhiteMove) {
            movesEl.innerHTML += `${moveNumber}. ${pieceSymbol}${from}${captureSymbol}${to} `;
        } else {
            movesEl.innerHTML += `${pieceSymbol}${from}${captureSymbol}${to}<br>`;
        }
        
        movesEl.scrollTop = movesEl.scrollHeight;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore piece to original position
        this.board[lastMove.from. row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove. to.row][lastMove.to.col] = lastMove.captured;
        
        // Handle en passant undo
        if (lastMove. moveInfo && lastMove.moveInfo. enPassant) {
            const capturedPawnRow = lastMove.piece.color === 'white' ? lastMove.to.row + 1 : lastMove. to.row - 1;
            this.board[capturedPawnRow][lastMove.to. col] = { 
                type: 'pawn', 
                color: lastMove.piece.color === 'white' ? 'black' : 'white' 
            };
        }
        
        // Handle castling undo
        if (lastMove.moveInfo && lastMove.moveInfo.castling) {
            const baseRow = lastMove.piece.color === 'white' ? 7 : 0;
            if (lastMove. moveInfo.castling === 'kingSide') {
                this.board[baseRow][7] = this.board[baseRow][5];
                this.board[baseRow][5] = null;
            } else {
                this.board[baseRow][0] = this.board[baseRow][3];
                this.board[baseRow][3] = null;
            }
        }
        
        // Restore game state
        this.enPassantTarget = lastMove.enPassantTarget;
        this. castlingRights = lastMove.castlingRights;
        this.currentPlayer = lastMove.piece.color;
        this.gameOver = false;
        this. selectedPiece = null;
        this.validMoves = [];
        
        // Update UI
        this. updateTurnIndicator();
        document.getElementById('game-status').textContent = '';
        
        // Update move history display
        const movesEl = document.getElementById('moves');
        movesEl.innerHTML = movesEl.innerHTML.replace(/[^<br>]*(<br>)?$/, '');
        
        this.renderBoard();
    }
    
    resetGame() {
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this. moveHistory = [];
        this. gameOver = false;
        this. enPassantTarget = null;
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide:  true }
        };
        
        this.initBoard();
        this.renderBoard();
        this.updateTurnIndicator();
        document.getElementById('game-status').textContent = '';
        document.getElementById('moves').innerHTML = '';
    }
}

// Start the game
const game = new ChessGame();