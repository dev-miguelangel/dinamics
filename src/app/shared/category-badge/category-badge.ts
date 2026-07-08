import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CATEGORIAS, type Categoria } from '../../models/dinamica';

@Component({
  selector: 'app-category-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--badge-color]': 'color()',
  },
  template: `
    <span class="badge">{{ label() }}</span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: color-mix(in srgb, var(--badge-color) 15%, transparent);
      color: var(--badge-color);
    }
  `,
})
export class CategoryBadge {
  categoria = input.required<Categoria>();

  protected color = computed(() => CATEGORIAS[this.categoria()]?.color ?? '#666');
  protected label = computed(() => CATEGORIAS[this.categoria()]?.label ?? this.categoria());
}
