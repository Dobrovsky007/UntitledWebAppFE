import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding auth header for login/register requests
  if (req.url.includes('/api/auth/')) {
    console.log('Skipping auth header for auth endpoint:', req.url);
    return next(req);
  }

  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  // If token exists, add it to the request headers
  if (token) {
    // Check if token already has "Bearer " prefix
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const authReq = req.clone({
      headers: req.headers.set('Authorization', authToken)
    });
    
    console.log('Adding Authorization header to:', req.url);
    console.log('Token:', authToken.substring(0, 30) + '...');
    
    return next(authReq);
  }
  
  console.log('No token found for request:', req.url);
  return next(req);
};