import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in · home-manager',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Register · home-manager',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    title: 'Home · home-manager',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'shopping',
    canActivate: [authGuard],
    title: 'Shopping list · home-manager',
    loadComponent: () =>
      import('./pages/shopping-list/shopping-list.component').then((m) => m.ShoppingListComponent),
  },
  {
    path: 'pantry',
    canActivate: [authGuard],
    title: 'Pantry · home-manager',
    loadComponent: () => import('./pages/pantry/pantry.component').then((m) => m.PantryComponent),
  },
  {
    path: 'family',
    canActivate: [authGuard],
    title: 'Family · home-manager',
    loadComponent: () => import('./pages/family/family.component').then((m) => m.FamilyComponent),
  },
  { path: '**', redirectTo: '' },
];
