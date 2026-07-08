const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const browserDistPath = path.join(__dirname, '../dist/dinamicas/browser');
app.use(express.static(browserDistPath));

const BOARD_ROWS = 9;
const COLS = 9;
const SKY_ROWS = 4;

const TRIANGLE_MASK = [
  [false, false, false, false, true, false, false, false, false],
  [false, false, false, true, true, true, false, false, false],
  [false, false, true, true, true, true, true, false, false],
  [false, true, true, true, true, true, true, true, false],
  [true, true, true, true, true, true, true, true, true],
];

function createEmptyBoard() {
  return Array.from({ length: BOARD_ROWS }, () => Array(COLS).fill(null));
}

const PIECE_TYPES = [
  { shape: [[0, 0]], name: 'single' },
  { shape: [[0, 0], [0, 1]], name: 'h2' },
  { shape: [[0, 0], [0, 1], [0, 2]], name: 'h3' },
  { shape: [[0, 0], [1, 0]], name: 'v2' },
  { shape: [[0, 0], [1, 0], [1, 1]], name: 'l1' },
  { shape: [[0, 0], [0, 1], [1, 0]], name: 'l2' },
];

function rotatePiece(shape) {
  const maxR = Math.max(...shape.map(([r]) => r));
  const maxC = Math.max(...shape.map(([c]) => c));
  return shape.map(([r, c]) => [c, maxR - r]);
}

function randomPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return { shape: type.shape.map(([r, c]) => [r, c]), name: type.name };
}

function sinColision(board, shape, row, col) {
  for (const [r, c] of shape) {
    const rr = row + r;
    const cc = col + c;
    if (rr < 0 || rr >= BOARD_ROWS || cc < 0 || cc >= COLS) return false;
    if (board[rr][cc] !== null) return false;
  }
  return true;
}

function dentrodelTriangulo(shape, row, col) {
  for (const [r, c] of shape) {
    const rr = row + r;
    const cc = col + c;
    if (rr < SKY_ROWS) return false;
    if (!TRIANGLE_MASK[rr - SKY_ROWS][cc]) return false;
  }
  return true;
}

function lockPiece(board, shape, row, col) {
  for (const [r, c] of shape) {
    board[row + r][col + c] = 'x';
  }
}

function spawnPiece(board) {
  const piece = randomPiece();
  const width = Math.max(...piece.shape.map(([, c]) => c));
  const startCol = Math.floor((COLS - width - 1) / 2);
  if (sinColision(board, piece.shape, 0, startCol)) {
    return { piece, row: 0, col: startCol };
  }
  return null;
}

function isGameWon(board) {
  for (let r = SKY_ROWS; r < BOARD_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (TRIANGLE_MASK[r - SKY_ROWS][c] && board[r][c] === null) return false;
    }
  }
  return true;
}

class GameSession {
  constructor(id, maxPlayers) {
    this.id = id;
    this.joinCode = id.substring(0, 6).toUpperCase();
    this.maxPlayers = maxPlayers;
    this.players = [];
    this.status = 'waiting';
    this.board = createEmptyBoard();
    this.currentPiece = null;
    this.pieceRow = 0;
    this.pieceCol = 0;
    this.fallInterval = null;
    this.controlAssignments = {};
    this.fallIntervalMs = 2000;
    this.derrota = false;
  }

  addPlayer(name, socketId) {
    const player = { id: uuidv4(), name, socketId, ready: false };
    this.players.push(player);
    return player;
  }

  removePlayer(socketId) {
    const idx = this.players.findIndex(p => p.socketId === socketId);
    if (idx !== -1) { this.players.splice(idx, 1); return true; }
    return false;
  }

  getPlayerBySocket(socketId) {
    return this.players.find(p => p.socketId === socketId);
  }

  assignControls() {
    const pool = ['left', 'right', 'rotate', 'change_shape'];
    let assignments = [];
    if (this.players.length >= 4) {
      for (let i = 0; i < this.players.length; i++) {
        assignments.push(pool[i % pool.length]);
      }
    } else {
      assignments = [...pool];
      for (let i = assignments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
      }
    }
    this.controlAssignments = {};
    for (let i = 0; i < this.players.length; i++) {
      const start = Math.floor(i * pool.length / this.players.length);
      const end = Math.floor((i + 1) * pool.length / this.players.length);
      this.controlAssignments[this.players[i].id] = assignments.slice(start, end);
    }
  }

  start() {
    this.status = 'playing';
    this.board = createEmptyBoard();
    this.fallIntervalMs = 2000;
    this.derrota = false;
    this.assignControls();
    const spawned = spawnPiece(this.board);
    if (spawned) {
      this.currentPiece = spawned.piece;
      this.pieceRow = spawned.row;
      this.pieceCol = spawned.col;
    }
    this.startFallTimer();
    this.broadcastState();
  }

  startFallTimer() {
    this.stopFallTimer();
    this.fallInterval = setInterval(() => this.tick(), this.fallIntervalMs);
  }

  stopFallTimer() {
    if (this.fallInterval) { clearInterval(this.fallInterval); this.fallInterval = null; }
  }

  tick() {
    if (this.status !== 'playing' || !this.currentPiece) return;
    const newRow = this.pieceRow + 1;
    if (sinColision(this.board, this.currentPiece.shape, newRow, this.pieceCol)) {
      this.pieceRow = newRow;
    } else {
      if (dentrodelTriangulo(this.currentPiece.shape, this.pieceRow, this.pieceCol)) {
        this.lockAndSpawn();
      } else {
        this.derrota = true;
        this.status = 'finished';
        this.stopFallTimer();
      }
    }
    this.broadcastState();
  }

  lockAndSpawn() {
    if (!this.currentPiece) return;
    lockPiece(this.board, this.currentPiece.shape, this.pieceRow, this.pieceCol);
    this.currentPiece = null;
    this.fallIntervalMs = this.fallIntervalMs * 0.98;
    if (isGameWon(this.board)) {
      this.status = 'finished';
      this.stopFallTimer();
      this.broadcastState();
      return;
    }
    const spawned = spawnPiece(this.board);
    if (spawned) {
      this.currentPiece = spawned.piece;
      this.pieceRow = spawned.row;
      this.pieceCol = spawned.col;
      this.startFallTimer();
    } else {
      this.derrota = true;
      this.status = 'finished';
      this.stopFallTimer();
    }
  }

  handleAction(playerId, action) {
    if (this.status !== 'playing' || !this.currentPiece) return false;
    const allowed = this.controlAssignments[playerId] || [];
    if (!allowed.includes(action)) return false;
    const shape = this.currentPiece.shape;
    let moved = false;
    if (action === 'left' && sinColision(this.board, shape, this.pieceRow, this.pieceCol - 1)) {
      this.pieceCol--; moved = true;
    } else if (action === 'right' && sinColision(this.board, shape, this.pieceRow, this.pieceCol + 1)) {
      this.pieceCol++; moved = true;
    } else if (action === 'rotate') {
      const rotated = rotatePiece(shape);
      if (sinColision(this.board, rotated, this.pieceRow, this.pieceCol)) {
        this.currentPiece.shape = rotated;
        moved = true;
      }
    } else if (action === 'change_shape') {
      const nueva = randomPiece();
      if (sinColision(this.board, nueva.shape, this.pieceRow, this.pieceCol)) {
        this.currentPiece = { ...this.currentPiece, shape: nueva.shape };
        moved = true;
      }
    }
    if (moved) this.broadcastState();
    return moved;
  }

  broadcastState() {
    io.to(this.id).emit('game-state', this.getState());
  }

  getState() {
    return {
      id: this.id,
      status: this.status,
      derrota: this.derrota,
      players: this.players.map(p => ({
        id: p.id, name: p.name,
        control: this.controlAssignments[p.id] || null,
      })),
      board: this.board,
      currentPiece: this.currentPiece ? {
        shape: this.currentPiece.shape,
        row: this.pieceRow,
        col: this.pieceCol,
      } : null,
      maxPlayers: this.maxPlayers,
    };
  }
}

const games = new Map();
const joinCodeMap = new Map();

io.on('connection', (socket) => {
  let currentGameId = null;

  socket.on('create-game', ({ maxPlayers }) => {
    const id = uuidv4();
    const game = new GameSession(id, maxPlayers);
    games.set(id, game);
    joinCodeMap.set(game.joinCode, id);
    currentGameId = id;
    socket.join(id);
    const player = game.addPlayer('Anfitrión', socket.id);
    socket.emit('game-created', { gameId: id, joinCode: game.joinCode, playerId: player.id });
    game.broadcastState();
  });

  socket.on('join-game', ({ gameId, playerName }) => {
    let game = games.get(gameId);
    if (!game) game = games.get(joinCodeMap.get(gameId.toUpperCase()));
    if (!game) { socket.emit('error-msg', 'La sala no existe'); return; }
    if (game.players.length >= game.maxPlayers) { socket.emit('error-msg', 'Sala llena'); return; }
    if (game.status !== 'waiting') { socket.emit('error-msg', 'El juego ya comenzó'); return; }
    currentGameId = game.id;
    socket.join(game.id);
    const player = game.addPlayer(playerName, socket.id);
    socket.emit('game-joined', { gameId: game.id, playerId: player.id, players: game.players.map(p => ({ id: p.id, name: p.name })) });
    game.broadcastState();
  });

  socket.on('start-game', () => {
    const game = games.get(currentGameId);
    if (!game) return;
    const player = game.getPlayerBySocket(socket.id);
    if (player && player.name === 'Anfitrión') game.start();
  });

  socket.on('player-action', ({ action }) => {
    const game = games.get(currentGameId);
    if (!game) return;
    const player = game.getPlayerBySocket(socket.id);
    if (!player) return;
    game.handleAction(player.id, action);
  });

  socket.on('restart-game', () => {
    const game = games.get(currentGameId);
    if (!game || game.status !== 'finished') return;
    game.start();
  });

  socket.on('leave-game', () => leaveGame(socket));
  socket.on('disconnect', () => leaveGame(socket));

  function leaveGame(socket) {
    if (!currentGameId) return;
    const game = games.get(currentGameId);
    if (!game) return;
    game.removePlayer(socket.id);
    if (game.players.length === 0) {
      game.stopFallTimer();
      games.delete(currentGameId);
    } else {
      game.broadcastState();
    }
    currentGameId = null;
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(browserDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Servidor de dinámicas en puerto ${PORT}`));
