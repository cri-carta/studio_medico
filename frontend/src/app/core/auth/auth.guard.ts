// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se esiste un ruolo, l'utente è "autenticato"
  return authService.userRole() !== null ? true : router.createUrlTree(['/auth/login']);
};
