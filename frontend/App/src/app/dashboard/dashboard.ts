import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface Event {
  id?: string;
  title: string;
  sport?: number;
  skillLevel?: number;
  address: string;
  startTime: string;
  capacity: number;
  occupied?: number;
  image?: string;
  category?: string;
  freeSlots?: number;
  date?: string;
  location?: string;
  participants?: number;
  maxParticipants?: number;
  players?: string;
  level?: string;
  description?: string;
  status?: string;
  statusOfEvent?: number;
  rated?: boolean;
  type?: 'hosted' | 'attended';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  selectedTab: 'upcoming' | 'past' | 'hosted' = 'upcoming';
  isLoading = false;

  sportOptions = [
    { value: 0, name: 'Soccer' },
    { value: 1, name: 'Basketball' },
    { value: 2, name: 'Small Football' },
    { value: 3, name: 'Floorball' },
    { value: 4, name: 'Ice Hockey' },
    { value: 5, name: 'Volleyball' },
    { value: 6, name: 'Tennis' },
    { value: 7, name: 'Golf' },
    { value: 8, name: 'Table Tennis' },
    { value: 9, name: 'Badminton' },
    { value: 10, name: 'Running' },
    { value: 11, name: 'Swimming' },
    { value: 12, name: 'Handball' },
    { value: 13, name: 'Chess' },
    { value: 14, name: 'Cycling' },
    { value: 15, name: 'Frisbee' },
    { value: 16, name: 'Hiking' },
    { value: 17, name: 'Padel' },
    { value: 18, name: 'Footvolley' },
    { value: 19, name: 'Bowling' },
    { value: 20, name: 'Darts' }
  ];

  skillLevelOptions = [
    { value: 0, name: 'Beginner' },
    { value: 1, name: 'Intermediate' },
    { value: 2, name: 'Advanced' },
    { value: 3, name: 'Professional' }
  ];

  statusOptions = [
    { value: 0, name: 'Upcoming' },
    { value: 1, name: 'Ongoing' },
    { value: 2, name: 'Past' },
    { value: 4, name: 'Canceled' }
  ];

  events: {
    upcoming: Event[];
    past: Event[];
    hosted: Event[];
  } = {
    upcoming: [],
    past: [],
    hosted: []
  };

  private readonly apiUrl = `${environment.apiUrl}/event`;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

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

    // Load both hosted and attended events
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
        // Calculate freeSlots and add sport name for all events
        const enhanceEvents = (events: Event[]) => events.map(event => ({
          ...event,
          freeSlots: event.capacity - (event.occupied || 0),
          category: this.getSportName(event.sport || 0)
        }));
        
        // Upcoming tab: Show both hosted and attended upcoming events
        this.events.upcoming = [
          ...enhanceEvents(results.hostedUpcoming).map(event => ({ ...event, type: 'hosted' as const })),
          ...enhanceEvents(results.attendedUpcoming).map(event => ({ ...event, type: 'attended' as const }))
        ];
        
        // Past tab: Show both hosted and attended past events
        this.events.past = [
          ...enhanceEvents(results.hostedPast).map(event => ({ ...event, type: 'hosted' as const })),
          ...enhanceEvents(results.attendedPast).map(event => ({ ...event, type: 'attended' as const }))
        ];
        
        // Hosted tab: All hosted events (upcoming + past)
        this.events.hosted = [
          ...enhanceEvents(results.hostedUpcoming),
          ...enhanceEvents(results.hostedPast)
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

  getSportName(sportId: number): string {
    const sport = this.sportOptions.find(s => s.value === sportId);
    return sport?.name || 'Unknown Sport';
  }

  getSkillLevelName(skillLevel: number): string {
    const option = this.skillLevelOptions.find(opt => opt.value === skillLevel);
    return option ? option.name : 'Unknown';
  }

  getStatusName(status: number | undefined): string {
    if (status === undefined) return 'Unknown';
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.name : 'Unknown';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  deleteEvent(eventId: string | undefined, eventTitle: string): void {
    if (!eventId) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: { eventTitle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(eventId);
      }
    });
  }

  private performDelete(eventId: string): void {
    console.log('Starting delete for event ID:', eventId);
    console.log('Full delete URL:', `${this.apiUrl}/delete/${eventId}`);
    
    this.http
      .delete(`${this.apiUrl}/delete/${eventId}`, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('Delete HTTP error:', error);
          if (error.status === 403) {
            this.snackBar.open('You are not the organizer of this event', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to delete event', 'Close', { duration: 3000 });
          }
          console.error('Delete error:', error);
          return of(null);
        })
      )
      .subscribe(result => {
        console.log('Delete response received:', result);
        console.log('Delete response status:', 'Success');
        
        if (result !== null) {
          this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
          
          // Remove the event from the local arrays immediately for instant UI update
          this.events.upcoming = this.events.upcoming.filter(e => e.id !== eventId);
          this.events.past = this.events.past.filter(e => e.id !== eventId);
          this.events.hosted = this.events.hosted.filter(e => e.id !== eventId);
          
          console.log('Event removed from local arrays. Events before reload:', this.events);
          
          // Then reload to ensure consistency with backend
          setTimeout(() => {
            console.log('Reloading events from backend...');
            this.loadEvents();
          }, 300);
        }
      });
  }

  // Helper method to format event data for display
  formatEventForDisplay(event: Event): Event {
    return {
      ...event,
      category: (event.sport?.toString() || event.category || 'Event'),
      players: event.participants && event.maxParticipants 
        ? `${event.participants}/${event.maxParticipants} Players`
        : event.players || 'TBD',
      image: event.image || 'assets/events/default.jpg'
    };
  }
}

// Confirmation Dialog Component
@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Delete Event?</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete "<strong>{{ data.eventTitle }}</strong>"?</p>
      <p style="color: #999; font-size: 0.9rem;">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        <mat-icon>delete</mat-icon>
        Delete Event
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatButtonModule, MatIconModule, MatDialogModule]
})
export class ConfirmDeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { eventTitle: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
