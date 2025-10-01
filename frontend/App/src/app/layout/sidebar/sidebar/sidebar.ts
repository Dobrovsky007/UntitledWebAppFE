import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  navItems = [
    { path: '/explore-events', label: 'Explore Events', icon: 'explore' },
    { path: '/my-events', label: 'My Events', icon: 'event' },
    { path: '/create-event', label: 'Create Event', icon: 'add_circle' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications' },
    { path: '/profile', label: 'User Profile', icon: 'person' }
  ];
}
