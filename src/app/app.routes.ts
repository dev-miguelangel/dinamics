import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Dinámicas de Juegos - Team Building',
  },
  {
    path: 'dinamicas',
    loadComponent: () => import('./pages/dinamicas/dinamicas-list').then(m => m.DinamicasList),
    title: 'Todas las Dinámicas',
  },
  {
    path: 'dinamica/:id',
    loadComponent: () => import('./pages/dynamica-detail/dynamica-detail').then(m => m.DynamicaDetail),
    title: 'Detalle de Dinámica',
  },
  {
    path: 'aleatorio',
    loadComponent: () => import('./pages/random-selector/random-selector').then(m => m.RandomSelector),
    title: 'Dinámica Aleatoria',
  },
  {
    path: 'juego/crear',
    loadComponent: () => import('./pages/game-create/game-create').then(m => m.GameCreate),
    title: 'Crear Dinámica Interactiva',
  },
  {
    path: 'juego/unirse',
    loadComponent: () => import('./pages/game-join/game-join').then(m => m.GameJoin),
    title: 'Unirse a Dinámica',
  },
  {
    path: 'juego/sala',
    loadComponent: () => import('./pages/game-lobby/game-lobby').then(m => m.GameLobby),
    title: 'Sala de Espera',
  },
  {
    path: 'juego/jugar',
    loadComponent: () => import('./pages/game-play/game-play').then(m => m.GamePlay),
    title: 'El Triángulo Colaborativo',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
