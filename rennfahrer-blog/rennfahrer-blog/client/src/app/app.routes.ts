import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
