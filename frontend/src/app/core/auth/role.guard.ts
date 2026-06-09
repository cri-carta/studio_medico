import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service'; 

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'];
  
  // 1. Usiamo la proprietà suggerita da TS (senza parentesi tonde!)
  const userRole = authService.userRole; 

  // 2. Se non hai 'isAuthenticated', controlliamo solo se il ruolo esiste ed è quello giusto
  if (userRole && userRole === expectedRole) {
    return true; 
  }

  // Altrimenti, via dalle palle!
  router.navigate(['/auth']);
  return false;
};