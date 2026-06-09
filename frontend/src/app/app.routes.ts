import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadChildren: () => import('./features/auth/login/login.routes').then(m => m.loginRoutes)
  },
  {
    path: 'medico',
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.medicoRoutes),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'medico' }
  },
  {
    path: 'paziente',
    loadChildren: () => import('./features/paziente/paziente.routes').then(m => m.pazienteRoutes),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'paziente' }
  },

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];