import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { DinamicasService } from '../../services/dinamicas.service';
import { DynamicaCard } from '../../shared/dynamica-card/dynamica-card';
import { CATEGORIAS, type Categoria } from '../../models/dinamica';

@Component({
  selector: 'app-dinamicas-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DynamicaCard],
  template: `
    <header class="page-header">
      <h1>Dinámicas de Equipo</h1>
      <p>Selecciona una categoría para filtrar o explora todas las dinámicas disponibles.</p>
    </header>

    <div class="filters">
      <button class="filter-btn" [class.active]="!categoriaFiltro()" (click)="categoriaFiltro.set(null)">
        Todas
      </button>
      @for (entry of categorias(); track entry.key) {
        <button
          class="filter-btn"
          [class.active]="categoriaFiltro() === entry.key"
          [style.--filter-color]="entry.color"
          (click)="categoriaFiltro.set(entry.key)"
        >
          {{ entry.label }}
        </button>
      }
    </div>

    <div class="grid">
      @for (d of dinamicasFiltradas(); track d.id) {
        <app-dynamica-card [dinamica]="d" />
      } @empty {
        <div class="empty">
          <p>No hay dinámicas en esta categoría.</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .page-header h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
    }
    .page-header p {
      margin: 0;
      color: var(--text-secondary);
    }
    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 2rem;
    }
    .filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover {
      border-color: var(--primary);
      color: var(--text);
    }
    .filter-btn.active {
      background: var(--primary-bg);
      border-color: var(--primary);
      color: var(--primary);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }
    .empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
  `,
})
export class DinamicasList {
  private service = inject(DinamicasService);

  protected categoriaFiltro = signal<Categoria | null>(null);

  protected categorias = () =>
    Object.entries(CATEGORIAS).map(([key, value]) => ({ key: key as Categoria, ...value }));

  protected dinamicasFiltradas = computed(() => {
    const filtro = this.categoriaFiltro();
    if (!filtro) return this.service.dinamicas();
    return this.service.getPorCategoria(filtro);
  });
}
