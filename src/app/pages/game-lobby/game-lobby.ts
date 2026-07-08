import { Component, ChangeDetectionStrategy, inject, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game-lobby',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lobby">
      <h1>🔄 Sala de Espera</h1>

      <div class="join-info">
        <p class="join-label">Comparte este código con tu equipo:</p>
        <div class="join-code">{{ joinCode() }}</div>
        <button class="share-btn" (click)="compartir()">
          {{ compartido() ? '✅ ¡Copiado!' : '📤 Compartir enlace' }}
        </button>
      </div>

      <div class="players">
        <h2>Jugadores ({{ playerCount() }}/{{ maxPlayers() }})</h2>
        <div class="players-list">
          @for (p of players(); track p.id) {
            <div class="player" [class.anfitrion]="p.name === 'Anfitrión'">
              <span class="player-icon">{{ p.name === 'Anfitrión' ? '👑' : '👤' }}</span>
              <span class="player-name">{{ p.name }}</span>
            </div>
          } @empty {
            <p class="empty">Esperando jugadores...</p>
          }
        </div>
      </div>

      @if (isAnfitrion()) {
        <button class="btn btn--primary start-btn" (click)="iniciar()" [disabled]="playerCount() < 2">
          {{ playerCount() >= maxPlayers() ? '✅ ¡Todos listos! Iniciar' : '🎮 Iniciar Juego' }}
        </button>
      } @else {
        <p class="waiting">Esperando a que el anfitrión inicie el juego...</p>
      }
    </div>
  `,
  styles: `
    :host { display: block; max-width: 500px; margin: 0 auto; padding: 2rem 1.5rem; text-align: center; touch-action: manipulation; }
    h1 { margin: 0 0 1.5rem; }
    .join-info { margin-bottom: 2rem; }
    .join-label { color: var(--text-secondary); margin: 0 0 0.75rem; }
    .join-code { font-size: 3rem; font-weight: 800; letter-spacing: 0.5rem; color: var(--primary); background: var(--primary-bg); padding: 0.75rem 1.5rem; border-radius: 12px; display: inline-block; font-family: monospace; }
    .share-btn { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 0.6rem 1.25rem; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--primary); font-size: 0.9rem; font-weight: 600; cursor: pointer; touch-action: manipulation; transition: all 0.2s; }
    .share-btn:hover { border-color: var(--primary); background: var(--primary-bg); }
    .players { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .players h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    .players-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .player { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--bg); border-radius: 8px; }
    .player.anfitrion { background: var(--primary-bg); }
    .player-icon { font-size: 1.25rem; }
    .player-name { font-weight: 500; }
    .empty { color: var(--text-secondary); font-style: italic; }
    .start-btn { width: 100%; padding: 1rem; font-size: 1.1rem; touch-action: manipulation; }
    .waiting { color: var(--text-secondary); font-style: italic; }
    @media (max-width: 480px) { :host { padding: 1.5rem 1rem; } .join-code { font-size: 2.25rem; letter-spacing: 0.3rem; } }
  `,
})
export class GameLobby {
  private gameService = inject(GameService);
  private router = inject(Router);

  protected gameState = this.gameService.gameState;
  protected joinCode = this.gameService.joinCode;

  protected compartido = signal(false);

  protected players = computed(() => this.gameState()?.players ?? []);
  protected playerCount = computed(() => this.players().length);
  protected maxPlayers = computed(() => this.gameState()?.maxPlayers ?? 0);
  protected isAnfitrion = computed(() => {
    const me = this.gameService.playerId();
    return this.players().some(p => p.id === me && p.name === 'Anfitrión');
  });

  constructor() {
    if (!this.gameService.gameId()) {
      this.router.navigate(['/juego/crear']);
    }
    effect(() => {
      if (this.gameState()?.status === 'playing') {
        this.router.navigate(['/juego/jugar']);
      }
    });
  }

  protected iniciar() {
    this.gameService.startGame();
  }

  protected compartir() {
    const codigo = this.joinCode();
    if (!codigo) return;
    const url = `${window.location.origin}/juego/unirse?codigo=${codigo}`;

    if ('share' in (navigator as any)) {
      navigator.share({ title: 'Unirse a dinámica', url }).catch(() => {});
    } else {
      (navigator as any).clipboard.writeText(url).then(() => {
        this.compartido.set(true);
        setTimeout(() => this.compartido.set(false), 2000);
      });
    }
  }
}
