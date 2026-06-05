import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
    path: 'auth', 
    // Carica pigramente il componente di login (o un sotto-routing standalone)
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'medico', 
    // Carica pigramente le rotte figlie specifiche per il medico senza usare i file .module.ts
    loadChildren: () => import('./features/medico/medico.routes').then(m => m.medicoRoutes)
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
