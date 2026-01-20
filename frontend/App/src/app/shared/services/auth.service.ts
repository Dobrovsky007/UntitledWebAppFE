import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'authToken';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Registers a new user
   */
  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request, {
      responseType: 'text' as 'json' // Handle plain text responses
    });
  }

  /**
   * Authenticates user and stores JWT token
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          // Store username for later use
          localStorage.setItem('username', request.username);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  /**
   * Logs out user and clears token
   */
  logout(): void {
    this.clearToken();
    localStorage.removeItem('username');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Gets the stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Sets the JWT token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Clears the JWT token from localStorage
   */
  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Checks if user has a token (doesn't validate it)
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Checks if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Gets the current username from token (basic decode)
   */
  getCurrentUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Basic JWT decode (just for username, not for validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (error) {
      return null;
    }
  }
}