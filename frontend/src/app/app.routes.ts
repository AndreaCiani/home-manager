import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Home · home-manager',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'shopping',
    title: 'Shopping list · home-manager',
    loadComponent: () =>
      import('./pages/shopping-list/shopping-list.component').then((m) => m.ShoppingListComponent),
  },
  {
    path: 'pantry',
    title: 'Pantry · home-manager',
    loadComponent: () => import('./pages/pantry/pantry.component').then((m) => m.PantryComponent),
  },
  { path: '**', redirectTo: '' },
];
