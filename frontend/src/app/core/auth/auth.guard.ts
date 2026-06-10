// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * AuthGuard protegge le rotte private verificando l'autenticazione dell'utente.
 * * Se l'utente non possiede un ruolo (non è autenticato), viene reindirizzato
 * automaticamente alla pagina di login.
 * * @returns {boolean | UrlTree} Restituisce true se autorizzato,
 * altrimenti un UrlTree verso la rotta di login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se esiste un ruolo, l'utente è "autenticato"
  return authService.userRole() !== null ? true : router.createUrlTree(['/auth/login']);
};