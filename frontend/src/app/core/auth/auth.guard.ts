// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se esiste un ruolo, l'utente è "autenticato"
  return authService.userRole() !== null ? true : router.createUrlTree(['/login']);
};

// role.guard.ts
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const expectedRole = route.data['expectedRole']; // es: 'medico'

  return authService.userRole() === expectedRole;
};