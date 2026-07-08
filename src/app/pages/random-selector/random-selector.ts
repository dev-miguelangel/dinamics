import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryBadge } from '../../shared/category-badge/category-badge';
import { DinamicasService } from '../../services/dinamicas.service';
import type { Dinamica } from '../../models/dinamica';

@Component({
  selector: 'app-random-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryBadge],
  template: `
    <div class="selector">
      <h1>🎲 Dinámica Aleatoria</h1>
      <p>¿No sabes por dónde empezar? Deja que el azar decida.</p>

      <button class="spin-btn" (click)="seleccionarAleatoria()" [disabled]="animando()">
        {{ animando() ? '🎰 Girando...' : '🎲 ¡Elegir una dinámica!' }}
      </button>

      @if (seleccionada(); as d) {
        <div class="resultado" [class.show]="!animando()">
          <div class="resultado__card">
            <div class="resultado__icon">{{ d.icono }}</div>
            <h2 class="resultado__nombre">{{ d.nombre }}</h2>
            <app-category-badge [categoria]="d.categoria" />
            <p class="resultado__desc">{{ d.descripcion }}</p>
            <div class="resultado__meta">
              <span>⏱ {{ d.duracion }} min</span>
              <span>👥 {{ d.participantesMin }}-{{ d.participantesMax }} pers.</span>
            </div>
            <a [routerLink]="['/dinamica', d.id]" class="btn btn--primary">Ver Detalle</a>
          </div>
        </div>
      } @else {
        <div class="placeholder">
          <span class="placeholder__icon">❓</span>
          <p>Presiona el botón para descubrir tu próxima dinámica</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      text-align: center;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
    }
    p {
      margin: 0 0 2rem;
      color: var(--text-secondary);
    }
    .spin-btn {
      padding: 1rem 2rem;
      font-size: 1.2rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }
    .spin-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    .spin-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .resultado {
      margin-top: 2rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease;
    }
    .resultado.show {
      opacity: 1;
      transform: translateY(0);
    }
    .resultado__card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
    }
    .resultado__icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .resultado__nombre {
      margin: 0 0 0.75rem;
      font-size: 1.5rem;
    }
    .resultado__desc {
      margin: 1rem 0;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    .resultado__meta {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin: 1rem 0 1.5rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .placeholder {
      margin-top: 3rem;
    }
    .placeholder__icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }
    .placeholder p {
      color: var(--text-secondary);
    }
  `,
})
export class RandomSelector {
  private service = inject(DinamicasService);

  protected seleccionada = signal<Dinamica | null>(null);
  protected animando = signal(false);

  protected seleccionarAleatoria() {
    this.animando.set(true);
    this.seleccionada.set(null);

    const candidatas = this.service.dinamicas();
    const interval = setInterval(() => {
      const random = candidatas[Math.floor(Math.random() * candidatas.length)];
      this.seleccionada.set(random);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const final = this.service.aleatoria();
      this.seleccionada.set(final);
      this.animando.set(false);
    }, 1500);
  }
}
