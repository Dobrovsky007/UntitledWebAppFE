import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  navItems = [
    { path: '/explore-events', label: 'Explore Events', icon: 'fa-solid fa-compass' },
    { path: '/my-events', label: 'My Events', icon: 'fa-solid fa-calendar-days' },
    { path: '/create-event', label: 'Create Event', icon: 'fa-solid fa-plus-circle' },
    { path: '/notifications', label: 'Notifications', icon: 'fa-solid fa-bell' },
    { path: '/profile', label: 'User Profile', icon: 'fa-solid fa-user' }
  ];
}
