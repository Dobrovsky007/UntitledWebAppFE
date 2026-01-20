import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

interface Notification {
  id?: string;
  title?: string;
  messageOfNotification?: string;
  isRead?: boolean;
  createdAt?: string;
  typeOfNotification?: number;
  event?: {
    id?: string;
  };
  user?: any;
  [key: string]: any;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.http
      .get<Notification[]>(`${environment.apiUrl}/notifications/all`)
      .pipe(
        catchError((err) => {
          console.error('Failed to load notifications:', err);
          this.error = 'Failed to load notifications';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe((data) => {
        console.log('API Response:', data);
        console.log('Response type:', typeof data);
        
        if (data && Array.isArray(data)) {
          this.notifications = data;
          console.log(`Loaded ${data.length} notifications`);
          if (data.length === 0) {
            this.error = null; // No error, just no notifications
          }
          data.forEach((n, i) => {
            console.log(`[${i}] ID: ${n.id}, Title: ${n.title}, Read: ${n.isRead}`);
          });
        } else {
          this.notifications = [];
          this.error = null; // No error, backend is working
        }
        this.loading = false;
      });
  }

  markAsRead(notification: Notification): void {
    if (!notification.id) return;
    
    this.http
      .put(`${environment.apiUrl}/notifications/read/${notification.id}`, {}, { responseType: 'text' })
      .pipe(
        catchError((err) => {
          console.error('Failed to mark notification as read:', err);
          return of(null);
        })
      )
      .subscribe(() => {
        notification.isRead = true;
      });
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read when clicked
    this.markAsRead(notification);
    
    // Debug logging
    console.log('=== NOTIFICATION CLICKED ===');
    console.log('Full notification:', notification);
    console.log('Type:', notification.typeOfNotification);
    console.log('Event object:', notification.event);
    console.log('Event ID:', notification.event?.id);
    
    // Handle navigation based on notification type
    // Type 3 = RATE_PARTICIPANTS notification
    if (notification.typeOfNotification === 3 && notification.event?.id) {
      // Navigate to rate participants page
      console.log('✅ Navigating to RATE PARTICIPANTS page:', notification.event.id);
      this.router.navigate(['/rate-participants', notification.event.id]);
    } else if (notification.event?.id) {
      // Navigate to event details for other notification types
      console.log('✅ Navigating to EVENT DETAILS page:', notification.event.id);
      this.router.navigate(['/event-details', notification.event.id]);
    } else {
      // Fallback to dashboard
      console.log('❌ No event ID or type mismatch, navigating to DASHBOARD');
      this.router.navigate(['/dashboard']);
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }
}