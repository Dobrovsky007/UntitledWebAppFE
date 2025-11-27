import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetails implements OnInit {
  event: any = null;
  participants: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const eventId = params.get('id');
      console.log('Raw eventId from route:', eventId); // Debug log
      console.log('All route params:', params.keys.map(k => k + ': ' + params.get(k))); // Debug log
      
      if (eventId) {
        this.http.get<any>(`${environment.apiUrl}/event/details/${eventId}`).subscribe({
          next: (data) => {
            this.event = data;
            this.participants = data.participants || [];
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading event details:', err); // Debug log
            this.error = 'Failed to load event details.';
            this.isLoading = false;
          }
        });
      } else {
        console.error('No eventId found in route parameters'); // Debug log
        this.error = 'No event ID provided.';
        this.isLoading = false;
      }
    });
  }
}
