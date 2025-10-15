import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Event {
  id?: string;
  title: string;
  sport?: string;
  category?: string;
  date: string;
  location: string;
  participants?: number;
  maxParticipants?: number;
  players?: string;
  level?: string;
  image?: string;
  description?: string;
  status?: string;
  type?: 'hosted' | 'attended';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  selectedTab: 'upcoming' | 'past' | 'hosted' = 'upcoming';
  isLoading = false;

  events: {
    upcoming: Event[];
    past: Event[];
    hosted: Event[];
  } = {
    upcoming: [],
    past: [],
    hosted: []
  };

  private readonly apiUrl = 'http://localhost:8080/api/event';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  selectTab(tab: 'upcoming' | 'past' | 'hosted'): void {
    this.selectedTab = tab;
  }

  getCurrentEvents(): Event[] {
    return this.events[this.selectedTab];
  }

  loadEvents(): void {
    this.isLoading = true;

    // Create individual API calls with error handling
    const hostedUpcoming$ = this.http.get<Event[]>(`${this.apiUrl}/hosted/upcoming`)
      .pipe(catchError(error => {
        return of([]);
      }));
    
    const hostedPast$ = this.http.get<Event[]>(`${this.apiUrl}/hosted/past`)
      .pipe(catchError(error => {
        return of([]);
      }));
    
    const attendedUpcoming$ = this.http.get<Event[]>(`${this.apiUrl}/attended/upcoming`)
      .pipe(catchError(error => {
        return of([]);
      }));
    
    const attendedPast$ = this.http.get<Event[]>(`${this.apiUrl}/attended/past`)
      .pipe(catchError(error => {
        return of([]);
      }));

    forkJoin({
      hostedUpcoming: hostedUpcoming$,
      hostedPast: hostedPast$,
      attendedUpcoming: attendedUpcoming$,
      attendedPast: attendedPast$
    }).subscribe({
      next: (results) => {
        // Combine hosted and attended events
        this.events.upcoming = [
          ...results.hostedUpcoming.map(event => ({ ...event, type: 'hosted' as const })),
          ...results.attendedUpcoming.map(event => ({ ...event, type: 'attended' as const }))
        ];
        
        this.events.past = [
          ...results.hostedPast.map(event => ({ ...event, type: 'hosted' as const })),
          ...results.attendedPast.map(event => ({ ...event, type: 'attended' as const }))
        ];
        
        this.events.hosted = [
          ...results.hostedUpcoming,
          ...results.hostedPast
        ];
      },
      error: (error) => {
        // Keep empty arrays on error
        this.events = { upcoming: [], past: [], hosted: [] };
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  refreshEvents(): void {
    this.loadEvents();
  }

  // Helper method to format event data for display
  formatEventForDisplay(event: Event): Event {
    return {
      ...event,
      category: event.sport || event.category || 'Event',
      players: event.participants && event.maxParticipants 
        ? `${event.participants}/${event.maxParticipants} Players`
        : event.players || 'TBD',
      image: event.image || 'assets/events/default.jpg'
    };
  }
}
