import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RatingService, Participant } from '../shared/services/rating.service';
import { environment } from '../../environments/environment';

interface Event {
  id: string;
  title: string;
  sport?: string;
  endTime?: string;
  statusOfEvent?: number;
  rated?: boolean;
}

@Component({
  selector: 'app-rate-participants',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './rate-participants.html',
  styleUrls: ['./rate-participants.scss']
})
export class RateParticipantsComponent implements OnInit {
  eventId: string = '';
  event: Event | null = null;
  participants: Participant[] = [];
  ratings: { [username: string]: number } = {};
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;

  // Star rating system
  stars = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private ratingService: RatingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.eventId) {
      this.showError('Invalid event ID');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadEventAndParticipants();
  }

  loadEventAndParticipants(): void {
    this.isLoading = true;
    this.error = null;

    // Load event details first
    this.http.get<Event>(`${environment.apiUrl}/event/${this.eventId}`)
      .subscribe({
        next: (event) => {
          this.event = event;

          // Check if event can be rated
          if (event.statusOfEvent !== 2) {
            this.showError('This event has not ended yet');
            this.router.navigate(['/dashboard']);
            return;
          }

          if (event.rated) {
            this.showError('Participants have already been rated for this event');
            this.router.navigate(['/dashboard']);
            return;
          }

          // Load participants
          this.loadParticipants();
        },
        error: (err) => {
          console.error('Failed to load event:', err);
          this.showError('Failed to load event details');
          this.isLoading = false;
        }
      });
  }

  loadParticipants(): void {
    this.ratingService.getEventParticipants(this.eventId).subscribe({
      next: (participants) => {
        this.participants = participants;
        
        // Initialize ratings to 0 (no rating)
        participants.forEach(p => {
          this.ratings[p.username] = 0;
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load participants:', err);
        this.showError('Failed to load participants');
        this.isLoading = false;
      }
    });
  }

  setRating(username: string, rating: number): void {
    this.ratings[username] = rating;
  }

  isStarFilled(username: string, starValue: number): boolean {
    return this.ratings[username] >= starValue;
  }

  getRatingLabel(rating: number): string {
    const labels: { [key: number]: string } = {
      1: 'Unacceptable - No show or terrible behavior',
      2: 'Poor - Major issues with attendance or behavior',
      3: 'Average - Some behavioral concerns',
      4: 'Good - Reliable participant with minor issues',
      5: 'Excellent - Perfect participant, fair play'
    };
    return labels[rating] || '';
  }

  allParticipantsRated(): boolean {
    return this.participants.every(p => this.ratings[p.username] > 0);
  }

  getRatedCount(): number {
    return this.participants.filter(p => this.ratings[p.username] > 0).length;
  }

  submitRatings(): void {
    // Validate all participants are rated
    if (!this.allParticipantsRated()) {
      this.showError('Please rate all participants before submitting');
      return;
    }

    // Confirm submission
    if (!confirm(`Are you sure you want to submit ratings for ${this.participants.length} participants? This action cannot be undone.`)) {
      return;
    }

    this.isSubmitting = true;

    // Submit ratings to backend
    this.ratingService.submitEventRatings(this.eventId, this.ratings).subscribe({
      next: () => {
        this.showSuccess('Ratings submitted successfully!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('Failed to submit ratings:', err);
        const errorMessage = err.error || 'Failed to submit ratings. Please try again.';
        this.showError(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All ratings will be lost.')) {
      this.router.navigate(['/dashboard']);
    }
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}
