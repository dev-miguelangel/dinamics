import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DynamicaCard } from '../../shared/dynamica-card/dynamica-card';
import { DinamicasService } from '../../services/dinamicas.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DynamicaCard],
  template: `
    <section class="hero">
      <h1 class="hero__title">Dinámicas de Juegos</h1>
      <p class="hero__subtitle">
        Fortalece tu equipo con dinámicas diseñadas para mejorar la comunicación,
        confianza, creatividad y colaboración.
      </p>
      <div class="hero__actions">
        @if (mostrarOpciones()) {
          <a routerLink="/juego/crear" class="btn btn--primary">Crear Partida</a>
          <a routerLink="/juego/unirse" class="btn btn--secondary">Unirse a Partida</a>
        } @else {
          <button (click)="mostrarOpciones.set(true)" class="btn btn--primary">🎮 Jugar Ahora</button>
        }
        <a routerLink="/dinamicas" class="btn btn--secondary">Explorar Dinámicas</a>
      </div>
    </section>

    <section class="section section--highlight">
      <div class="featured-game">
        <div class="featured-game__content">
          <span class="featured-game__badge">🔥 Nueva</span>
          <h2 class="section__title">🔺 El Triángulo Colaborativo</h2>
          <p class="featured-game__desc">
            Una dinámica interactiva en tiempo real. Cada persona recibe controles únicos
            (izquierda, derecha o rotar) y deben coordinarse para construir un triángulo
            entre todos, ¡como un Tetris en equipo!
          </p>
          <div class="featured-game__actions">
            <a routerLink="/juego/crear" class="btn btn--primary">Crear Sala</a>
            <a routerLink="/juego/unirse" class="btn btn--secondary">Unirse con Código</a>
          </div>
        </div>
        <div class="featured-game__preview">
          <div class="preview-triangle">
            <div class="p-row"><span class="p-cell"></span><span class="p-cell p-cell--fill"></span><span class="p-cell"></span></div>
            <div class="p-row"><span class="p-cell"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell"></span></div>
            <div class="p-row"><span class="p-cell"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell"></span></div>
            <div class="p-row"><span class="p-cell"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell"></span></div>
            <div class="p-row"><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span><span class="p-cell p-cell--fill"></span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">¿Por qué dinámicas de equipo?</h2>
      <div class="benefits">
        <div class="benefit">
          <span class="benefit__icon">🤝</span>
          <h3>Mejora la Comunicación</h3>
          <p>Ejercicios prácticos que rompen barreras y fomentan el diálogo abierto.</p>
        </div>
        <div class="benefit">
          <span class="benefit__icon">🔗</span>
          <h3>Fortalece Vínculos</h3>
          <p>Crea conexiones genuinas entre los miembros del equipo.</p>
        </div>
        <div class="benefit">
          <span class="benefit__icon">💡</span>
          <h3>Desarrolla Habilidades</h3>
          <p>Liderazgo, resolución de problemas y creatividad en un entorno seguro.</p>
        </div>
        <div class="benefit">
          <span class="benefit__icon">🎉</span>
          <h3>Ambiente Positivo</h3>
          <p>Genera un espacio de confianza donde todos pueden contribuir.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">Dinámicas Destacadas</h2>
      <div class="grid">
        @for (d of destacadas(); track d.id) {
          <app-dynamica-card [dinamica]="d" />
        }
      </div>
    </section>
  `,
  styles: `
    .hero {
      text-align: center;
      padding: 4rem 1.5rem 3rem;
      max-width: 700px;
      margin: 0 auto;
    }
    .hero__title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1rem;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero__subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 2rem;
    }
    .hero__actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .section--highlight {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.05), rgba(162, 155, 254, 0.05));
      border-radius: 24px;
    }
    .section__title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 1.5rem;
      text-align: center;
    }
    .featured-game {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    .featured-game__content { flex: 1; }
    .featured-game__badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #e74c3c;
      color: #fff;
      margin-bottom: 0.75rem;
    }
    .featured-game__desc {
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 1.5rem;
    }
    .featured-game__actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .featured-game__preview {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preview-triangle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .p-row { display: flex; gap: 2px; }
    .p-cell {
      width: 16px; height: 16px; border-radius: 2px;
      background: transparent;
    }
    .p-cell--fill {
      background: var(--primary);
      opacity: 0.7;
    }
    @media (max-width: 640px) {
      .featured-game { flex-direction: column; }
    }
    .benefits {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .benefit {
      text-align: center;
      padding: 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .benefit__icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
    }
    .benefit h3 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
    }
    .benefit p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }
  `,
})
export class Home {
  private service = inject(DinamicasService);

  protected mostrarOpciones = signal(false);

  protected destacadas = () => this.service.dinamicas().slice(0, 6);
}
