import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * RoleGuard verifica che l'utente autenticato possieda il ruolo richiesto per accedere a una rotta.
 * * @param route La rotta corrente, che deve contenere il parametro `expectedRole` nei propri `data`.
 * @returns {boolean | UrlTree} True se il ruolo coincide, altrimenti reindirizza alla pagina di login.
 * * @example
 * // Esempio di utilizzo nel file delle rotte:
 * {
 * path: 'admin',
 * component: AdminPanelComponent,
 * canActivate: [roleGuard],
 * data: { expectedRole: 'admin' }
 * }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'];
  const userRole = authService.userRole();

  console.log(`[RoleGuard] Richiesto: ${expectedRole} | Utente: ${userRole}`);

  if (userRole === expectedRole) {
    return true; // Ruolo corretto, autorizzato
  }

  // Blocca la navigazione se il ruolo non coincide
  console.warn(`[RoleGuard] Accesso negato per il ruolo: ${userRole}`);
  return router.parseUrl('/auth/login');
};