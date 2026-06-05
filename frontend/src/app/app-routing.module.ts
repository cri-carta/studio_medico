import { Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'medico', 
    loadChildren: () => import('./features/medico/medico.module').then(m => m.MedicoModule),
    // Qui aggiungeremo la guard per controllare il ruolo 'medico'[cite: 1]
  },
  { 
    path: 'paziente', 
    loadChildren: () => import('./features/paziente/paziente.module').then(m => m.PazienteModule),
    // Qui aggiungeremo la guard per controllare il ruolo 'paziente'[cite: 1]
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];