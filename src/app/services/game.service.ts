import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '../models/game';

@Injectable({ providedIn: 'root' })
export class GameService {
  private socket: Socket | null = null;

  readonly gameState = signal<GameState | null>(null);
  readonly connected = signal(false);
  readonly error = signal<string | null>(null);
  readonly playerId = signal<string | null>(null);
  readonly gameId = signal<string | null>(null);
  readonly joinCode = signal<string | null>(null);

  private get serverUrl(): string | undefined {
    return typeof window !== 'undefined' ? window.location.origin : undefined;
  }

  connect() {
    if (this.socket?.connected) return;
    this.socket = io(this.serverUrl);

    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));

    this.socket.on('game-created', ({ gameId, joinCode, playerId }) => {
      this.gameId.set(gameId);
      this.joinCode.set(joinCode);
      this.playerId.set(playerId);
    });

    this.socket.on('game-joined', ({ gameId, playerId }) => {
      this.gameId.set(gameId);
      this.playerId.set(playerId);
      this.error.set(null);
    });

    this.socket.on('game-state', (state: GameState) => {
      this.gameState.set(state);
    });

    this.socket.on('error-msg', (msg: string) => {
      this.error.set(msg);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.gameState.set(null);
    this.connected.set(false);
    this.playerId.set(null);
    this.gameId.set(null);
    this.joinCode.set(null);
  }

  createGame(maxPlayers: number) {
    this.socket?.emit('create-game', { maxPlayers });
  }

  joinGame(gameId: string, playerName: string) {
    this.socket?.emit('join-game', { gameId, playerName });
  }

  startGame() {
    this.socket?.emit('start-game');
  }

  restartGame() {
    this.socket?.emit('restart-game');
  }

  sendAction(action: 'left' | 'right' | 'rotate' | 'change_shape') {
    this.socket?.emit('player-action', { action });
  }

  leaveGame() {
    this.socket?.emit('leave-game');
    this.disconnect();
  }
}
