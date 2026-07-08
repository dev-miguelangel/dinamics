import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryBadge } from '../category-badge/category-badge';
import type { Dinamica } from '../../models/dinamica';

@Component({
  selector: 'app-dynamica-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryBadge],
  host: {
    'class': 'dynamica-card',
  },
  template: `
    <a [routerLink]="['/dinamica', dinamica().id]" class="card">
      <div class="card__icon">{{ dinamica().icono }}</div>
      <div class="card__body">
        <div class="card__header">
          <h3 class="card__title">{{ dinamica().nombre }}</h3>
          <app-category-badge [categoria]="dinamica().categoria" />
        </div>
        <p class="card__desc">{{ dinamica().descripcion }}</p>
        <div class="card__meta">
          <span>⏱ {{ dinamica().duracion }} min</span>
          <span>👥 {{ dinamica().participantesMin }}-{{ dinamica().participantesMax }}</span>
        </div>
      </div>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
    .card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      height: 100%;
    }
    .card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .card__icon {
      font-size: 2.5rem;
      line-height: 1;
      flex-shrink: 0;
    }
    .card__body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }
    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .card__title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .card__desc {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  `,
})
export class DynamicaCard {
  dinamica = input.required<Dinamica>();
}
