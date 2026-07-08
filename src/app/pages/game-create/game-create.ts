import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="create">
      <h1>🎮 Crear Nueva Dinámica</h1>
      <p class="subtitle">El Triángulo Colaborativo — Construyan juntos el triángulo perfecto</p>

      <div class="card">
        <h2>¿Cuántas personas participarán?</h2>
        <div class="input-group">
          <button class="step-btn" (click)="ajustar(-1)" [disabled]="participantes() <= 2">−</button>
          <span class="count">{{ participantes() }}</span>
          <button class="step-btn" (click)="ajustar(1)" [disabled]="participantes() >= 6">+</button>
        </div>
        <p class="hint">Mínimo 2, máximo 6 personas</p>

        <button class="btn btn--primary create-btn" (click)="crear()" [disabled]="!connected()">
          {{ connected() ? '✨ Crear Sala' : 'Conectando...' }}
        </button>
      </div>

      <div class="info">
        <h3>¿Cómo funciona?</h3>
        <ul>
          <li>Cada persona recibe un control aleatorio (izquierda, derecha o rotar)</li>
          <li>Las piezas caen como en Tetris y deben encajar en un triángulo de 5 capas</li>
          <li>¡Deben comunicarse y coordinarse para construir el triángulo entre todos!</li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem; text-align: center; touch-action: manipulation; }
    h1 { margin: 0 0 0.5rem; font-size: 2rem; }
    .subtitle { color: var(--text-secondary); margin: 0 0 2rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; }
    .card h2 { font-size: 1.2rem; margin: 0 0 1.5rem; }
    .input-group { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 0.5rem; }
    .step-btn { width: 48px; height: 48px; border-radius: 50%; border: 2px solid var(--border); background: var(--surface); font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; touch-action: manipulation; }
    .step-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .step-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .count { font-size: 2.5rem; font-weight: 800; min-width: 3rem; color: var(--primary); }
    .hint { color: var(--text-secondary); font-size: 0.85rem; margin: 0.5rem 0 1.5rem; }
    .create-btn { width: 100%; padding: 1rem; font-size: 1.1rem; touch-action: manipulation; }
    .info { text-align: left; background: var(--primary-bg); border-radius: 12px; padding: 1.5rem; }
    .info h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .info ul { margin: 0; padding-left: 1.25rem; }
    .info li { margin-bottom: 0.5rem; line-height: 1.5; color: var(--text-secondary); }
    @media (max-width: 480px) { :host { padding: 1.5rem 1rem; } h1 { font-size: 1.5rem; } .card { padding: 1.25rem; } .step-btn { width: 44px; height: 44px; } }
  `,
})
export class GameCreate {
  private gameService = inject(GameService);
  private router = inject(Router);

  protected participantes = signal(3);
  protected connected = this.gameService.connected;

  constructor() {
    this.gameService.connect();
  }

  protected ajustar(delta: number) {
    this.participantes.update(v => Math.max(2, Math.min(6, v + delta)));
  }

  protected crear() {
    this.gameService.createGame(this.participantes());
    this.router.navigate(['/juego/sala']);
  }
}
