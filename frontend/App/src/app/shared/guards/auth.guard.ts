import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // If user is authenticated and accessing root, redirect to dashboard
    if (state.url === '/') {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};