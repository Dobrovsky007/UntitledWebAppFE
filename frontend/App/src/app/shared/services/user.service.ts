import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/user`;
  private readonly eventApiUrl = `${environment.apiUrl}/event`;
  
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
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
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
   * Loads user's past events (both hosted and attended)
   */
  loadPastEvents(): Observable<Event[]> {
    const hosted$ = this.http.get<Event[]>(`${this.eventApiUrl}/hosted/past`).pipe(
      catchError(() => of([]))
    );
    const attended$ = this.http.get<Event[]>(`${this.eventApiUrl}/attended/past`).pipe(
      catchError(() => of([]))
    );
    
    return forkJoin({ hosted: hosted$, attended: attended$ }).pipe(
      map(({ hosted, attended }) => [...hosted, ...attended])
    );
  }

  /**
   * Loads user's upcoming events (both hosted and attended)
   */
  loadUpcomingEvents(): Observable<Event[]> {
    const hosted$ = this.http.get<Event[]>(`${this.eventApiUrl}/hosted/upcoming`).pipe(
      catchError(() => of([]))
    );
    const attended$ = this.http.get<Event[]>(`${this.eventApiUrl}/attended/upcoming`).pipe(
      catchError(() => of([]))
    );
    
    return forkJoin({ hosted: hosted$, attended: attended$ }).pipe(
      map(({ hosted, attended }) => [...hosted, ...attended])
    );
  }
}