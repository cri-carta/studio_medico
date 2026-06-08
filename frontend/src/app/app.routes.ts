import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    // Corretto: ora combacia con il percorso cercato dalla guardia
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'medico',
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.medicoRoutes),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'medico' }
  },
  {
    path: 'paziente',
    loadChildren: () => import('./features/paziente/paziente.routes').then(m => m.pazienteRoutes)
  },

  // Quando l'app parte vuota, prova ad andare su medico
  { path: '', redirectTo: 'medico', pathMatch: 'full' },

  // IMPORTANTE: il jolly deve mandare al LOGIN, non a medico, altrimenti crea il loop!
  { path: '**', redirectTo: 'auth/login' }
];