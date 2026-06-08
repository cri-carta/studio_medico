import { Routes } from '@angular/router';
// Importa le guardie che abbiamo creato
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
export const routes: Routes = [
    {
    path: 'auth',
    // Carica pigramente il componente di login (o un sotto-routing standalone)
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'medico',
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.medicoRoutes),
    canActivate: [authGuard, roleGuard], // Proteggi l'intero blocco
    data: { expectedRole: 'medico' }     // Dichiara che tutto ciò che sta dentro 'medico' richiede questo ruolo
  },
  {
    path: 'paziente',
    // Carica pigramente le rotte figlie per il paziente
    loadChildren: () => import('./features/paziente/paziente.routes').then(m => m.pazienteRoutes)
  },

  // Reindirizzamento alla homepage del medico (o ad auth se preferisci far fare prima il login)
  { path: '', redirectTo: 'medico', pathMatch: 'full' },

  // Wildcard per gestire le rotte inesistenti
  { path: '**', redirectTo: 'medico' }
];
