import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    // Corretto: ora combacia con il percorso cercato dalla guardia
    path: 'auth/login',
    loadChildren: () => import('./features/auth/login/login.routes').then(m => m.loginRoutes)
  },
  {
    path: 'medico',
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.medicoRoutes),
    // canActivate: [authGuard, roleGuard], // Proteggi l'intero blocco
    data: { expectedRole: 'medico' }     // Dichiara che tutto ciò che sta dentro 'medico' richiede questo ruolo
  },
  {
    path: 'paziente',
    loadChildren: () => import('./features/paziente/paziente.routes').then(m => m.pazienteRoutes)
  },

  // Quando l'app parte vuota, prova ad andare su login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // IMPORTANTE: il jolly deve mandare al LOGIN, non a medico, altrimenti crea il loop!
  { path: '**', redirectTo: 'auth/login' }
];