import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor che aggiunge automaticamente il token JWT agli header di ogni richiesta HTTP.
 * * * Verifica se esiste un token nel `localStorage`.
 * * Se presente, clona la richiesta originale aggiungendo l'header `Authorization: Bearer <token>`.
 * * Se assente, inoltra la richiesta originale senza modifiche.
 * * @param req La richiesta HTTP in transito.
 * @param next Il gestore della catena di interceptor.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Cloniamo la richiesta e aggiungiamo l'header se il token esiste
  const authReq = token ? req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }) : req;

  return next(authReq);
};