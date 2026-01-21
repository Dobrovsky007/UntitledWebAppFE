import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, ClipboardModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetails implements OnInit, OnDestroy {
  event: any = null;
  participants: any[] = [];
  isLoading = true;
  error: string | null = null;
  isJoining = false;
  isLeaving = false;
  eventId: string | null = null;
  userEventIds: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private clipboard: Clipboard,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadUserEvents();
    // Use snapshot instead of subscribe to avoid history issues
    this.eventId = this.route.snapshot.paramMap.get('id');
    
    if (this.eventId) {
      this.loadEventDetails();
    } else {
      this.error = 'No event ID provided.';
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadUserEvents() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };
    
    this.http.get<any[]>(`${environment.apiUrl}/event/hosted/upcoming`, { headers }).subscribe({
      next: (events) => {
        events.forEach(event => this.userEventIds.add(event.id));
      },
      error: () => {}
    });
    
    this.http.get<any[]>(`${environment.apiUrl}/event/attended/upcoming`, { headers }).subscribe({
      next: (events) => {
        events.forEach(event => this.userEventIds.add(event.id));
      },
      error: () => {}
    });
  }

  isUserParticipant(): boolean {
    const currentUsername = localStorage.getItem('username');
    if (!currentUsername || !this.event) return false;
    
    // Check if user is the organizer
    if (this.event.organizer === currentUsername) return true;
    
    // Check if user is in participants list
    return this.participants.some(p => p.username === currentUsername);
  }

  loadEventDetails() {
    if (!this.eventId) return;

    this.http.get<any>(`${environment.apiUrl}/event/details/${this.eventId}`).subscribe({
      next: (data) => {
        this.event = data;
        this.participants = data.participants || [];
        
        // Debug logging
        console.log('=== EVENT DETAILS LOADED ===');
        console.log('Full event:', this.event);
        console.log('Organizer:', this.event.organizer);
        console.log('StatusOfEvent:', this.event.statusOfEvent);
        console.log('Rated:', this.event.rated);
        console.log('Current username:', localStorage.getItem('username'));
        console.log('Is Organizer?', this.isOrganizer());
        console.log('Can Rate?', this.canRateParticipants());
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading event details:', err);
        this.error = 'Failed to load event details.';
        this.isLoading = false;
      }
    });
  }
/**
   * Get Google Maps embed URL for the event location
   */
  getMapUrl(): SafeResourceUrl {
    if (!this.event || !this.event.latitude || !this.event.longitude) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    
    const lat = this.event.latitude;
    const lng = this.event.longitude;
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${lat},${lng}&zoom=15`;
    
    // Alternative: Use OpenStreetMap (no API key needed)
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(osmUrl);
  }

  
  joinEvent(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.eventId || this.isJoining) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      this.snackBar.open('Please log in to join events', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check if event is full
    if (this.event.occupied >= this.event.capacity) {
      this.snackBar.open('This event is full', 'Close', { duration: 3000 });
      return;
    }

    this.isJoining = true;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.http.post(
      `${environment.apiUrl}/user/event/join?eventId=${this.eventId}`,
      {},
      { headers, responseType: 'text' }
    ).subscribe({
      next: (response) => {
        this.snackBar.open('Successfully joined the event!', 'Close', { duration: 3000 });
        this.isJoining = false;
        // Navigate to explore events page
        setTimeout(() => {
          this.router.navigate(['/explore-events']);
        }, 1000);
      },
      error: (err) => {
        console.error('Error joining event:', err);
        if (err.status === 400) {
          this.snackBar.open('You have already joined this event', 'Close', { duration: 3000 });
        } else if (err.status === 401) {
          this.snackBar.open('Please log in to join events', 'Close', { duration: 3000 });
          this.router.navigate(['/auth/login']);
        } else {
          this.snackBar.open('Failed to join event. Please try again.', 'Close', { duration: 3000 });
        }
        this.isJoining = false;
      }
    });
  }

  /**
   * Share event by copying the link to clipboard
   */
  shareEvent(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.eventId) return;
    
    // Construct the event URL
    const eventUrl = `${window.location.origin}/event-details/${this.eventId}`;
    
    // Copy to clipboard
    const success = this.clipboard.copy(eventUrl);
    
    if (success) {
      // Show success notification
      this.snackBar.open('Event link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      // Navigate to explore events page
      setTimeout(() => {
        this.router.navigate(['/explore-events']);
      }, 1000);
    } else {
      // Show error notification
      this.snackBar.open('Failed to copy link. Please try again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  /**
   * Check if current user is the event organizer
   */
  isOrganizer(): boolean {
    if (!this.event || !this.event.organizer) return false;
    const currentUsername = localStorage.getItem('username');
    return currentUsername === this.event.organizer.username;
  }

  /**
   * Check if event can be rated (ended and not yet rated)
   */
  canRateParticipants(): boolean {
    if (!this.event) return false;
    // statusOfEvent === 2 means PAST
    return this.isOrganizer() && 
           this.event.statusOfEvent === 2 && 
           this.event.rated === false;
  }

  /**
   * Navigate to rate participants page
   */
  rateParticipants(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (this.eventId) {
      this.router.navigate(['/rate-participants', this.eventId]);
    }
  }

  /**
   * Leave the event
   */
  leaveEvent(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.eventId || this.isLeaving) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      this.snackBar.open('Please log in to leave events', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLeaving = true;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.http.delete(
      `${environment.apiUrl}/user/event/leave?eventId=${this.eventId}`,
      { headers, responseType: 'text' }
    ).subscribe({
      next: (response) => {
        this.snackBar.open('Successfully left the event!', 'Close', { duration: 3000 });
        this.isLeaving = false;
        
        // Navigate to explore events page
        setTimeout(() => {
          this.router.navigate(['/explore-events']);
        }, 1000);
      },
      error: (err) => {
        console.error('Error leaving event:', err);
        if (err.status === 401) {
          this.snackBar.open('Please log in to leave events', 'Close', { duration: 3000 });
          this.router.navigate(['/auth/login']);
        } else if (err.status === 500) {
          this.snackBar.open('You are not a participant of this event', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to leave event. Please try again.', 'Close', { duration: 3000 });
        }
        this.isLeaving = false;
      }
    });
  }
}
