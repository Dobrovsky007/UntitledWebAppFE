import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/user';
  
  private userSubject = new BehaviorSubject({
    username: '',
    email: '',
    bio: '',
    avatar: 'assets/default-avatar.png',
    trustScore: 0,
    sports: [],
    events: []
  });

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentUser() {
    return this.userSubject.value;
  }

  // Load user data from backend
  loadUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // Set user data (called after login or when fetching profile)
  setUser(userData: any) {
    this.userSubject.next({
      username: userData.username || '',
      email: userData.email || '',
      bio: userData.bio || 'Tell us about yourself...',
      avatar: userData.avatar || 'assets/default-avatar.png',
      trustScore: userData.trustScore || 0,
      sports: userData.sports || [],
      events: userData.events || []
    });
  }

  updateAvatar(avatar: string) {
    const currentUser = this.userSubject.value;
    this.userSubject.next({
      ...currentUser,
      avatar: avatar
    });
  }

  updateUser(userData: any) {
    this.userSubject.next(userData);
  }
}