import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  getCurrentUserId(): number | undefined {
    // Get from localStorage, token, or current session
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : undefined;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}