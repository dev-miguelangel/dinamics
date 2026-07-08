import { Component, ChangeDetectionStrategy, inject, signal, effect, OnDestroy, type EffectRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game-join',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="join">
      <h1>🔗 Unirse a una Dinámica</h1>
      <p class="subtitle">Ingresa el código que te compartió tu equipo</p>

      <div class="card">
        <div class="field">
          <label for="codigo">Código de la sala</label>
          <input id="codigo" [value]="codigo()" (input)="codigo.set($any($event.target).value.toUpperCase())" placeholder="Ej: ABC123" maxlength="6" class="input code-input" />
        </div>
        <div class="field">
          <label for="nombre">Tu nombre</label>
          <input id="nombre" [value]="nombre()" (input)="nombre.set($any($event.target).value)" placeholder="Ej: Ana" class="input" />
        </div>

        <button class="btn btn--primary join-btn" (click)="unirse()" [disabled]="!puedeUnirse()">
          {{ cargando() ? '⏳ Conectando...' : '🚀 Unirse' }}
        </button>

        @if (error(); as err) {
          <p class="error">{{ err }}</p>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; max-width: 450px; margin: 0 auto; padding: 2rem 1.5rem; text-align: center; touch-action: manipulation; }
    h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
    .subtitle { color: var(--text-secondary); margin: 0 0 2rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; text-align: left; }
    .field { margin-bottom: 1.25rem; }
    label { display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box; }
    .input:focus { outline: none; border-color: var(--primary); }
    .code-input { font-size: 1.5rem; text-align: center; letter-spacing: 0.3rem; font-family: monospace; text-transform: uppercase; }
    .join-btn { width: 100%; padding: 0.875rem; font-size: 1.05rem; margin-top: 0.5rem; touch-action: manipulation; }
    .error { color: #e74c3c; font-size: 0.875rem; margin: 0.75rem 0 0; text-align: center; }
    @media (max-width: 480px) { :host { padding: 1.5rem 1rem; } h1 { font-size: 1.4rem; } .card { padding: 1.25rem; } }
  `,
})
export class GameJoin implements OnDestroy {
  private gameService = inject(GameService);
  private router = inject(Router);

  protected codigo = signal('');
  protected nombre = signal('');
  protected cargando = signal(false);
  protected error = signal<string | null>(null);

  private esperandoRespuesta = signal(false);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private errorEffect: EffectRef | null = null;
  private navegarEffect: EffectRef | null = null;

  constructor() {
    const route = inject(ActivatedRoute);
    const codigoParam = toSignal(route.queryParamMap.pipe(map(p => p.get('codigo'))));
    const inicial = codigoParam();
    if (inicial) this.codigo.set(inicial.toUpperCase());

    this.gameService.disconnect();
    this.gameService.connect();

    this.errorEffect = effect(() => {
      const err = this.gameService.error();
      if (err) {
        this.error.set(err);
        this.cargando.set(false);
        this.esperandoRespuesta.set(false);
        if (this.timeoutId) clearTimeout(this.timeoutId);
      }
    });

    this.navegarEffect = effect(() => {
      if (!this.esperandoRespuesta()) return;
      if (this.gameService.gameId()) {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.cargando.set(false);
        this.esperandoRespuesta.set(false);
        this.router.navigate(['/juego/sala']);
      }
    });
  }

  ngOnDestroy() {
    this.errorEffect?.destroy();
    this.navegarEffect?.destroy();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  protected puedeUnirse() {
    return !this.cargando() && this.codigo().length >= 4 && this.nombre().trim().length > 0;
  }

  protected unirse() {
    if (!this.puedeUnirse()) return;
    this.cargando.set(true);
    this.error.set(null);
    this.esperandoRespuesta.set(true);
    this.gameService.joinGame(this.codigo(), this.nombre().trim());

    this.timeoutId = setTimeout(() => {
      this.error.set('No se pudo conectar con la sala. Verifica el código.');
      this.cargando.set(false);
      this.esperandoRespuesta.set(false);
    }, 5000);
  }
}
