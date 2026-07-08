import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { BOARD_ROWS, COLS, SKY_ROWS, TRIANGLE_MASK, CONTROL_LABELS, CONTROL_COLORS } from '../../models/game';

@Component({
  selector: 'app-game-play',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (gameState(); as state) {
      <div class="game">
        <div class="game__header">
          <h2>🔺 El Triángulo Colaborativo</h2>
          <span class="game__status" [class.playing]="state.status === 'playing'" [class.finished]="state.status === 'finished'">
            @if (state.status === 'playing') { ▶ En juego }
            @else if (state.status === 'finished' && state.derrota) { 💥 Pieza fuera }
            @else if (state.status === 'finished') { 🏁 ¡Triángulo completado! }
            @else { ⏳ Esperando }
          </span>
        </div>

        <div class="game__layout">
          <div class="board-wrapper">
            <div class="board" [class.board--finished]="state.status === 'finished'">
              @for (row of rows; track row) {
                <div class="board__row" [class.board__row--sky]="row < SKY_ROWS">
                  @for (col of cols; track col) {
                    @if (esTriangulo(row, col)) {
                      <div
                        class="cell cell--tri"
                        [class.filled]="cellOcupada(row, col)"
                        [class.active]="celdaActiva(row, col)"
                        [style.--cell-color]="colorCelda(row, col)"
                      ></div>
                    } @else if (row < SKY_ROWS) {
                      <div
                        class="cell cell--sky"
                        [class.cell--sky-active]="celdaActiva(row, col)"
                        [class.cell--sky-filled]="cellOcupada(row, col)"
                      ></div>
                    } @else {
                      <div
                        class="cell cell--sky"
                        [class.cell--sky-active]="celdaActiva(row, col)"
                        [class.cell--sky-filled]="cellOcupada(row, col)"
                      ></div>
                    }
                  }
                </div>
              }

              @if (state.status === 'finished') {
                <div class="overlay" [class.overlay--derrota]="state.derrota" [class.overlay--victoria]="!state.derrota">
                  <div class="overlay__content">
                    @if (state.derrota) {
                      <span class="overlay__icon">💥</span>
                      <h2 class="overlay__title">Pieza fuera del triángulo</h2>
                      <p class="overlay__desc">¡Inténtenlo de nuevo, coordínense mejor!</p>
                    } @else {
                      <span class="overlay__icon">🎉</span>
                      <h2 class="overlay__title">¡Triángulo Completado!</h2>
                      <p class="overlay__desc">Gran trabajo en equipo</p>
                    }
                    <div class="overlay__actions">
                      <button class="overlay-btn" (click)="reintentar()">🔄 Intentar de nuevo</button>
                      <button class="overlay-btn overlay-btn--sec" (click)="salir()">🏠 Salir</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="sidebar">
            <div class="controls-panel">
              <h3>🎮 Controles</h3>
              @for (p of state.players; track p.id) {
                <div class="control-card" [class.me]="p.id === playerId()">
                  <span class="control-name">{{ p.id === playerId() ? '👤 Tú' : '👥 ' + p.name }}</span>
                  <div class="control-actions">
                    @for (c of p.control; track c) {
                      <span class="control-action" [style.background]="CONTROL_COLORS[c]">
                        {{ CONTROL_LABELS[c] }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>

            @if (misControles(); as controles) {
              <div class="action-panel">
                <p class="action-hint">Tus controles:</p>
                <div class="action-buttons">
                  @for (c of controles; track c) {
                    <button
                      class="action-btn"
                      [style.--btn-ctrl]="CONTROL_COLORS[c]"
                      (pointerdown)="enviarAccion(c)"
                    >
                      {{ CONTROL_LABELS[c] }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="loading"><p>Cargando juego...</p></div>
    }
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #1a1a2e; color: #eee; -webkit-user-select: none; user-select: none; touch-action: manipulation; }
    .game { max-width: 1100px; margin: 0 auto; padding: 1rem; }
    .game__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
    .game__header h2 { margin: 0; font-size: 1.2rem; }
    .game__status { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: rgba(255,255,255,0.1); }
    .game__status.playing { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
    .game__status.finished { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
    .game__layout { display: flex; gap: 1rem; align-items: flex-start; }
    .board-wrapper { flex: 1; display: flex; justify-content: center; padding: 0.5rem 0; }
    .board { display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative; }
    .board--finished .cell { opacity: 0.5; }
    .board__row { display: flex; gap: 2px; }

    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      z-index: 10;
      padding: 1rem;
    }
    .overlay--derrota { background: rgba(231, 76, 60, 0.35); }
    .overlay--victoria { background: rgba(46, 204, 113, 0.25); }
    .overlay__content { text-align: center; max-width: 320px; }
    .overlay__icon { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .overlay__title { margin: 0 0 0.5rem; font-size: 1.3rem; }
    .overlay__desc { margin: 0 0 1.25rem; color: rgba(255,255,255,0.85); font-size: 0.95rem; }
    .overlay__actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .overlay-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      background: #6C5CE7;
      color: #fff;
      touch-action: manipulation;
      transition: transform 0.15s;
    }
    .overlay-btn:active { transform: scale(0.95); }
    .overlay-btn--sec { background: rgba(255,255,255,0.15); color: #eee; }

    .cell { width: 36px; height: 36px; border-radius: 4px; transition: all 0.15s; }

    .cell--sky { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
    .cell--sky-active { background: rgba(241,196,15,0.25); border: 1px solid rgba(241,196,15,0.4); box-shadow: 0 0 8px rgba(241,196,15,0.3); }
    .cell--sky-filled { background: rgba(108,92,231,0.15); border: 1px solid rgba(108,92,231,0.25); }

    .cell--tri { background: rgba(108,92,231,0.08); border: 1px solid rgba(108,92,231,0.2); }
    .cell--tri.filled { background: var(--cell-color, #6C5CE7); border-color: rgba(255,255,255,0.5); box-shadow: 0 0 8px var(--cell-color, #6C5CE7); }
    .cell--tri.active { background: #f1c40f; border-color: #f39c12; box-shadow: 0 0 12px #f1c40f; animation: pulse 0.8s infinite alternate; }
    @keyframes pulse { from { box-shadow: 0 0 8px #f1c40f; } to { box-shadow: 0 0 16px #f39c12; } }

    .sidebar { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 1rem; }
    .sidebar .controls-panel { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem; }
    .sidebar .controls-panel h3 { margin: 0 0 0.75rem; font-size: 0.95rem; }
    .sidebar .control-card { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.03); gap: 0.5rem; }
    .sidebar .control-card.me { background: rgba(108,92,231,0.15); border: 1px solid rgba(108,92,231,0.3); }
    .sidebar .control-name { font-size: 0.85rem; flex-shrink: 0; }
    .sidebar .control-actions { display: flex; gap: 0.35rem; flex-wrap: wrap; justify-content: flex-end; }
    .sidebar .control-action { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; color: #fff; font-weight: 600; white-space: nowrap; }

    .action-panel { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 0.75rem; text-align: center; }
    .action-hint { margin: 0 0 0.5rem; font-size: 0.85rem; }
    .action-buttons { display: flex; gap: 0.5rem; }
    .action-btn { flex: 1; padding: 1rem; font-size: 1.3rem; font-weight: 700; border: none; border-radius: 12px; background: var(--btn-ctrl, #6C5CE7); color: #fff; cursor: pointer; transition: transform 0.1s; touch-action: manipulation; }
    .action-btn:active { transform: scale(0.95); }
    .loading { text-align: center; padding: 4rem; color: var(--text-secondary); }

    @media (max-width: 768px) {
      .game { padding: 0.5rem; }
      .game__header h2 { font-size: 1rem; }
      .game__status { font-size: 0.7rem; }
      .game__layout { flex-direction: column; align-items: center; }
      .board-wrapper { padding: 0.25rem 0; }
      .board { gap: 1px; }
      .board__row { gap: 1px; }
      .cell { width: 7.5vw; height: 7.5vw; max-width: 32px; max-height: 32px; border-radius: 3px; }
      .sidebar { width: 100%; max-width: 400px; }
      .sidebar .control-card { padding: 0.4rem 0.6rem; }
      .sidebar .control-name { font-size: 0.8rem; }
      .sidebar .control-action { font-size: 0.7rem; }
      .action-btn { padding: 0.85rem; font-size: 1.1rem; }
    }

    @media (max-width: 400px) {
      .cell { width: 7vw; height: 7vw; max-width: 28px; max-height: 28px; }
    }
  `,
})
export class GamePlay {
  private gameService = inject(GameService);
  private router = inject(Router);

  protected gameState = this.gameService.gameState;
  protected playerId = this.gameService.playerId;

  protected rows = Array.from({ length: BOARD_ROWS }, (_, i) => i);
  protected cols = Array.from({ length: COLS }, (_, i) => i);

  protected CONTROL_LABELS = CONTROL_LABELS;
  protected CONTROL_COLORS = CONTROL_COLORS;
  protected SKY_ROWS = SKY_ROWS;

  protected misControles = computed(() => {
    const state = this.gameState();
    const pid = this.playerId();
    if (!state || !pid) return null;
    return state.players.find(p => p.id === pid)?.control ?? null;
  });

  constructor() {
    if (!this.gameService.gameId()) {
      this.router.navigate(['/juego/crear']);
    }
  }

  protected esTriangulo(row: number, col: number) {
    if (row < SKY_ROWS) return false;
    return TRIANGLE_MASK[row - SKY_ROWS]?.[col] ?? false;
  }

  protected cellOcupada(row: number, col: number) {
    return this.gameState()?.board[row]?.[col] !== null;
  }

  protected celdaActiva(row: number, col: number) {
    const piece = this.gameState()?.currentPiece;
    if (!piece) return false;
    return piece.shape.some(([r, c]) => piece.row + r === row && piece.col + c === col);
  }

  protected colorCelda(row: number, col: number) {
    return this.gameState()?.board[row]?.[col] ? '#6C5CE7' : undefined;
  }

  protected enviarAccion(action: string) {
    this.gameService.sendAction(action);
  }

  protected reintentar() {
    this.gameService.restartGame();
  }

  protected salir() {
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }
}
