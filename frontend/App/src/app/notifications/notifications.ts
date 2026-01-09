import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

interface NotificationItem {
  title: string;
  message?: string;
  time: string | Date;
  type?: 'alert' | 'info';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.http
      .get<NotificationItem[]>(`${environment.apiUrl}/notifications`)
      .pipe(catchError(() => of(this.mockNotifications())))
      .subscribe((data) => {
        this.notifications = data && data.length ? data : this.mockNotifications();
      });
  }

  private mockNotifications(): NotificationItem[] {
    return [
      {
        title: 'Welcome to Eventify!',
        message: 'You will see your real notifications here once they start coming in.',
        time: new Date(),
        type: 'info'
      }
    ];
  }
}

const routes: Routes = [
  { path: '', component: NotificationsComponent }
];