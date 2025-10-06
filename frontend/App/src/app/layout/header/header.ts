import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider'; // Add this import
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
    MatDividerModule, // Add this to imports array
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  searchQuery = '';
  showSearch = false;
  userAvatar = 'assets/default-avatar.png';
  userName = '';
  private userSubscription: Subscription = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.userAvatar = user.avatar;
      this.userName = user.username;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    // Optionally focus the input when shown
    setTimeout(() => {
      const el = document.getElementById('search-input');
      if (el) (el as HTMLInputElement).focus();
    }, 0);
  }
}
