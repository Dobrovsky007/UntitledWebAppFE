import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatDividerModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  searchQuery = '';
  showSearch = false;
  userAvatar = 'assets/abstract-user-flat-4.svg';
  userName = '';
  private userSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes from UserService
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user && user.username) {
        this.userName = user.username;
        this.userAvatar = user.avatar || 'assets/abstract-user-flat-4.svg';
      } else {
        this.userName = 'User';
        this.userAvatar = 'assets/abstract-user-flat-4.svg';
      }
    });

    // Load user profile to populate the data
    this.userService.loadUserProfile().subscribe({
      error: (err) => {
        console.error('Failed to load user profile:', err);
        this.userName = 'User';
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    setTimeout(() => {
      const el = document.getElementById('search-input');
      if (el) (el as HTMLInputElement).focus();
    }, 0);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToExploreEvents() {
    this.router.navigate(['/explore-events']);
  }
}
