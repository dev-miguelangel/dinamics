import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  host: {
    'class': 'navbar',
    '[hidden]': 'oculto()',
  },
  template: `
    <nav class="navbar__inner">
      <a routerLink="/" class="navbar__logo" (click)="cerrar()">
        <span class="navbar__icon">🎯</span>
        <span class="navbar__title">Dinámicas</span>
      </a>

      <button class="hamburger" (click)="toggle()" [class.open]="abierto()" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>

      <div class="navbar__overlay" [class.show]="abierto()" (click)="cerrar()"></div>

      <div class="navbar__links" [class.show]="abierto()">
        <a routerLink="/dinamicas" routerLinkActive="active" class="navbar__link" (click)="cerrar()">Guía</a>
        <a routerLink="/juego/crear" routerLinkActive="active" class="navbar__link" (click)="cerrar()">Jugar</a>
        <a routerLink="/juego/unirse" routerLinkActive="active" class="navbar__link" (click)="cerrar()">Unirse</a>
        <a routerLink="/aleatorio" routerLinkActive="active" class="navbar__link" (click)="cerrar()">Aleatorio</a>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
    }
    .navbar__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .navbar__logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text);
      font-weight: 700;
      font-size: 1.25rem;
      z-index: 2;
    }
    .navbar__icon { font-size: 1.5rem; }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      z-index: 2;
      touch-action: manipulation;
    }
    .hamburger span {
      display: block;
      width: 24px;
      height: 2.5px;
      background: var(--text);
      border-radius: 2px;
      transition: all 0.3s;
    }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    .navbar__overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 0;
    }
    .navbar__overlay.show { display: block; }

    .navbar__links {
      display: flex;
      gap: 0.5rem;
    }
    .navbar__link {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      transition: all 0.2s;
    }
    .navbar__link:hover { color: var(--text); background: var(--bg-secondary); }
    .navbar__link.active { color: var(--primary); background: var(--primary-bg); }

    @media (max-width: 640px) {
      .hamburger { display: flex; }
      .navbar__links {
        position: fixed;
        top: 0;
        right: -280px;
        width: 260px;
        height: 100vh;
        flex-direction: column;
        background: var(--surface);
        padding: 5rem 1.5rem 1.5rem;
        gap: 0.25rem;
        transition: right 0.3s ease;
        z-index: 1;
        box-shadow: -4px 0 12px rgba(0,0,0,0.1);
      }
      .navbar__links.show { right: 0; }
      .navbar__link {
        padding: 0.75rem 1rem;
        font-size: 1.05rem;
        border-radius: 10px;
      }
    }
  `,
})
export class Navbar {
  private router = inject(Router);

  protected oculto = computed(() => this.router.url.startsWith('/juego/jugar'));
  protected abierto = signal(false);

  protected toggle() { this.abierto.update(v => !v); }
  protected cerrar() { this.abierto.set(false); }
}
