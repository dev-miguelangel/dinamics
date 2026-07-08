import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryBadge } from '../../shared/category-badge/category-badge';
import { DinamicasService } from '../../services/dinamicas.service';

@Component({
  selector: 'app-dynamica-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryBadge],
  host: {
    'class': 'dynamica-detail',
  },
  template: `
    @if (dinamica(); as d) {
      <div class="detail">
        <button class="back-btn" (click)="volver()">← Volver</button>

        <div class="detail__header">
          <span class="detail__icon">{{ d.icono }}</span>
          <div>
            <h1 class="detail__title">{{ d.nombre }}</h1>
            <app-category-badge [categoria]="d.categoria" />
          </div>
        </div>

        <div class="detail__meta">
          <span>⏱ {{ d.duracion }} minutos</span>
          <span>👥 {{ d.participantesMin }}-{{ d.participantesMax }} participantes</span>
        </div>

        <section class="detail__section">
          <h2>Descripción</h2>
          <p>{{ d.descripcion }}</p>
        </section>

        <section class="detail__section">
          <h2>🎯 Objetivo</h2>
          <p>{{ d.objetivo }}</p>
        </section>

        @if (d.materiales.length > 0) {
          <section class="detail__section">
            <h2>📦 Materiales Necesarios</h2>
            <ul>
              @for (mat of d.materiales; track mat) {
                <li>{{ mat }}</li>
              }
            </ul>
          </section>
        }

        <section class="detail__section">
          <h2>📋 Instrucciones</h2>
          <ol>
            @for (inst of d.instrucciones; track inst; let i = $index) {
              <li>{{ inst }}</li>
            }
          </ol>
        </section>

        <section class="detail__section">
          <h2>💡 Consejos</h2>
          <ul>
            @for (tip of d.consejos; track tip) {
              <li>{{ tip }}</li>
            }
          </ul>
        </section>

        <div class="detail__actions">
          <a routerLink="/aleatorio" class="btn btn--primary">Otra Dinámica Aleatoria</a>
          <a routerLink="/dinamicas" class="btn btn--secondary">Ver Todas</a>
        </div>
      </div>
    } @else {
      <div class="not-found">
        <h2>Dinámica no encontrada</h2>
        <p>La dinámica que buscas no existe.</p>
        <a routerLink="/dinamicas" class="btn btn--primary">Ver todas las dinámicas</a>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .back-btn {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.5rem 0;
      margin-bottom: 1rem;
    }
    .back-btn:hover {
      text-decoration: underline;
    }
    .detail__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .detail__icon {
      font-size: 3rem;
      line-height: 1;
    }
    .detail__title {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
    }
    .detail__meta {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
      flex-wrap: wrap;
    }
    .detail__section {
      margin-bottom: 2rem;
    }
    .detail__section h2 {
      font-size: 1.15rem;
      margin: 0 0 0.75rem;
    }
    .detail__section p {
      margin: 0;
      line-height: 1.7;
      color: var(--text-secondary);
    }
    .detail__section ul,
    .detail__section ol {
      margin: 0;
      padding-left: 1.5rem;
    }
    .detail__section li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
      color: var(--text-secondary);
    }
    .detail__actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }
    .not-found {
      text-align: center;
      padding: 4rem 1.5rem;
    }
    .not-found h2 {
      margin: 0 0 0.5rem;
    }
    .not-found p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }
  `,
})
export class DynamicaDetail {
  private service = inject(DinamicasService);
  private location = inject(Location);

  private idFromUrl = () => {
    const path = this.location.path();
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  protected dinamica = computed(() => this.service.getPorId(this.idFromUrl()));

  protected volver() {
    this.location.back();
  }
}
