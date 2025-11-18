import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Auth {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    console.log('API URL:', `${this.apiUrl}/login`);
    // Remove responseType: 'text' to get JSON response
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    // Remove responseType: 'text' to get JSON response
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}
