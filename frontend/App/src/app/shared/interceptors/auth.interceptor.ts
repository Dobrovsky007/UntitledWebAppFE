import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Don't add token to auth endpoints
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = authService.getToken();
  
  if (token) {
    console.log('🔍 Adding Authorization header to:', req.url);
    console.log('🔍 Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('🔍 Token is valid JWT:', token.split('.').length === 3);
    
    // Decode and check token expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      console.log('🔍 Token payload:', {
        sub: payload.sub,
        iat: payload.iat,
        exp: payload.exp,
        isExpired: payload.exp ? payload.exp < now : 'No expiration'
      });
    } catch (e) {
      console.error('❌ Failed to decode token:', e);
    }
    
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    console.log('🔍 Request headers:', authReq.headers.keys());
    
    return next(authReq).pipe(
      catchError(error => {
        console.error('❌ HTTP Error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          headers: error.headers
        });
        
        if (error.status === 401) {
          console.log('❌ 401 Unauthorized - token might be expired or invalid');
          authService.logout();
        } else if (error.status === 500) {
          console.log('❌ 500 Server Error - Backend issue (likely JWT authentication)');
        } else if (error.status === 403) {
          console.log('❌ 403 Forbidden - Token valid but insufficient permissions');
        }
        return throwError(() => error);
      })
    );
  }

  console.log('⚠️ No token available for:', req.url);
  return next(req);
};