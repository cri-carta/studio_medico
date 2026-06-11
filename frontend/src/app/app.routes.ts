import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

/* Configurazione delle rotte dell'applicazione. */
export const routes: Routes = [

  /* Carica le rotte relative alla funzionalità di login. */
  {
    path: 'auth/login',
    loadChildren: () => import('./features/auth/login/login.routes').then(m => m.loginRoutes)
  },
  {
  
    /* Carica le rotte dell'area medico. */
    path: 'medico',
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.medicoRoutes),
    // canActivate: [authGuard, roleGuard], // Proteggi l'intero blocco
    data: { expectedRole: 'medico' }     // Dichiara che tutto ciò che sta dentro 'medico' richiede questo ruolo
  },
  {
  
    /* Carica le rotte dell'area paziente e applica i guard. */
    path: 'paziente',
    loadChildren: () => import('./features/paziente/paziente.routes').then(m => m.pazienteRoutes),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'paziente' }
  },

  /* Reindirizza il percorso vuoto alla pagina di login. */
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  /* Gestisce percorsi non definiti. */
  { path: '**', redirectTo: 'auth/login' }
];