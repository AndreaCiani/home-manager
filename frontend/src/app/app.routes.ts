import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'shopping' },
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
  { path: '**', redirectTo: 'shopping' },
];
