import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode'; // <-- Importiamo la libreria appena installata

// Definiamo la struttura dei dati che ci aspettiamo dentro il JWT
interface CustomJwtPayload {
  id?: number;
  email?: string;
  role: string; // Questo è il campo fondamentale per le nostre Guardie
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Metodo che estrae dinamicamente il ruolo dal Token JWT
  userRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodifichiamo la stringa JWT per leggere l'oggetto JSON nel Payload
      const decoded = jwtDecode<CustomJwtPayload>(token);
      return decoded.role; // Restituisce 'medico' o 'paziente' preso dal token
    } catch (error) {
      console.error('Token non valido o corrotto:', error);
      this.logout(); // Se il token è corrotto, puliamo tutto
      return null;
    }
  }

  // Al login salviamo ESCLUSIVAMENTE il token JWT
  login(token: string): void {
    localStorage.setItem('token', token);
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}