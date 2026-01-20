import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss'
})
export class MobileMenu {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  navItems = [
    { path: '/explore-events', label: 'Explore Events', icon: 'fa-solid fa-compass' },
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
    { path: '/create-events', label: 'Create Event', icon: 'fa-solid fa-plus-circle' },
    { path: '/notifications', label: 'Notifications', icon: 'fa-solid fa-bell' },
    { path: '/profile', label: 'User Profile', icon: 'fa-solid fa-user' }
  ];

  onNavClick() {
    this.closeMenu.emit();
  }
}
