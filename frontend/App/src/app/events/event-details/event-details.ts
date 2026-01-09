import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetails implements OnInit {
  event: any = null;
  participants: any[] = [];
  isLoading = true;
  error: string | null = null;
  isJoining = false;
  eventId: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      
      if (this.eventId) {
        this.loadEventDetails();
      } else {
        this.error = 'No event ID provided.';
        this.isLoading = false;
      }
    });
  }

  loadEventDetails() {
    if (!this.eventId) return;

    this.http.get<any>(`${environment.apiUrl}/event/details/${this.eventId}`).subscribe({
      next: (data) => {
        this.event = data;
        this.participants = data.participants || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading event details:', err);
        this.error = 'Failed to load event details.';
        this.isLoading = false;
      }
    });
  }

  joinEvent() {
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
        // Reload event details to update participant count
        this.loadEventDetails();
        this.isJoining = false;
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
}
