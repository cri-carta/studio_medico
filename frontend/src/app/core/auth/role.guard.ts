import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'];
  const userRole = authService.userRole();

  console.log(`[RoleGuard] Richiesto: ${expectedRole} | Utente: ${userRole}`);

  if (userRole === expectedRole) {
    return true; // Ruolo corretto, passa pure!
  }

  // Se il ruolo non coincide, blocca la navigazione e rimanda al login
  console.warn(`[RoleGuard] Accesso negato per il ruolo: ${userRole}`);
  return router.parseUrl('/auth/login');
};