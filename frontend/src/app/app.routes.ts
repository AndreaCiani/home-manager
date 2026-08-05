import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'spesa' },
  {
    path: 'spesa',
    title: 'Lista della spesa · home-manager',
    loadComponent: () =>
      import('./pages/lista-spesa/lista-spesa.component').then((m) => m.ListaSpesaComponent),
  },
  {
    path: 'dispensa',
    title: 'Dispensa · home-manager',
    loadComponent: () =>
      import('./pages/dispensa/dispensa.component').then((m) => m.DispensaComponent),
  },
  { path: '**', redirectTo: 'spesa' },
];
