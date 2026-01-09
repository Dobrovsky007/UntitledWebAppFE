import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class NotificationsComponent {
  notifications: Notification[] = [];

  constructor() {
    // TODO: Replace with actual notification service
    // For now, using empty array - will be populated from backend
  }
}

interface Notification {
  type: 'alert' | 'info';
  title: string;
  message?: string;
  time: Date;
}

const routes: Routes = [
  { path: '', component: NotificationsComponent }
];

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatListModule,
    MatIconModule,
    HttpClientModule
  ]
})
export class NotificationsModule {}