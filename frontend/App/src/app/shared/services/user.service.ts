import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AddSportRequest {
  sport: number;
  skillLevel: number;
}

export interface RemoveSportRequest {
  sport: number;
}

export interface Event {
  id: string;
  title: string;
  sport: string;
  date: string;
  location: string;
  image?: string;
  status: string;
  description?: string;
  participants?: number;
  maxParticipants?: number;
}

export interface User {
  username: string;
  avatar: string;
  rating: number;
  sports: any[];
  verified: boolean;
  trustScore: number;
  events: Event[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/user';
  private readonly eventApiUrl = 'http://localhost:8080/api/event';
  
  private userSubject = new BehaviorSubject<User>({
    username: '',
    avatar: '',
    rating: 0,
    sports: [],
    verified: false,
    trustScore: 0,
    events: []
  });
  
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Sets the current user
   */
  setUser(user: User): void {
    this.userSubject.next(user);
  }

  /**
   * Gets the current user value
   */
  getCurrentUser(): User {
    return this.userSubject.value;
  }

  /**
   * Loads current user's profile
   */
  loadUserProfile(): Observable<User> {
    console.log('🌐 UserService: Making GET request to', `${this.apiUrl}/profile`);
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        console.log('🌐 UserService: Received response from backend:', user);
        this.setUser(user);
      })
    );
  }

  /**
   * Updates user avatar
   */
  updateAvatar(avatarData: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/avatar`, { avatar: avatarData });
  }

  /**
   * Adds a sport to user's profile
   */
  addSport(sportId: number, skillLevel: number): Observable<any> {
    const request: AddSportRequest = {
      sport: sportId,
      skillLevel: skillLevel
    };
    return this.http.post(`${this.apiUrl}/sport/add`, request);
  }

  /**
   * Removes a sport from user's profile
   */
  removeSport(sportId: number): Observable<any> {
    const request: RemoveSportRequest = {
      sport: sportId
    };
    return this.http.post(`${this.apiUrl}/sport/remove`, request);
  }

  /**
   * Joins an event
   */
  joinEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/event/${eventId}/join`, {});
  }

  /**
   * Loads user's past events
   */
  loadPastEvents(): Observable<Event[]> {
    console.log('🌐 UserService: Making GET request to', `${this.eventApiUrl}/my/past`);
    return this.http.get<Event[]>(`${this.eventApiUrl}/my/past`).pipe(
      tap(events => {
        console.log('🌐 UserService: Received past events from backend:', events);
      })
    );
  }

  /**
   * Loads user's upcoming events
   */
  loadUpcomingEvents(): Observable<Event[]> {
    console.log('🌐 UserService: Making GET request to', `${this.eventApiUrl}/my/upcoming`);
    return this.http.get<Event[]>(`${this.eventApiUrl}/my/upcoming`).pipe(
      tap(events => {
        console.log('🌐 UserService: Received upcoming events from backend:', events);
      })
    );
  }
}