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
          data.forEach((n, i) => {
            console.log(`[${i}] ID: ${n.id}, Title: ${n.title}, Read: ${n.isRead}`);
          });
        } else {
          this.notifications = [];
          this.error = 'No notifications available';
        }
        this.loading = false;
      });
  }

  markAsRead(notification: Notification): void {
    if (!notification.id) return;
    
    this.http
      .put<any>(`${environment.apiUrl}/notifications/read/${notification.id}`, {})
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
    
    if (notification.id) {
      // Navigate to event details if event_id exists, otherwise just navigate to events
      this.router.navigate(['/events']);
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