import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit, OnDestroy {
  user: any = {};
  editingBio = false;
  editingSports = false;
  tempBio = '';
  newSport = { name: '', level: '' };
  
  availableSports = [
    'Football', 'Basketball', 'Tennis', 'Volleyball', 'Baseball', 
    'Soccer', 'Swimming', 'Running', 'Cycling', 'Boxing', 
    'Martial Arts', 'Golf', 'Hockey', 'Cricket', 'Badminton',
    'Table Tennis', 'Skiing', 'Snowboarding', 'Rock Climbing', 'Yoga'
  ];

  private userSubscription: Subscription = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userService.updateAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Bio editing methods
  startEditingBio() {
    this.editingBio = true;
    this.tempBio = this.user.bio || '';
  }

  cancelEditingBio() {
    this.editingBio = false;
    this.tempBio = '';
  }

  saveBio() {
    if (this.tempBio.trim().length <= 200) {
      const updatedUser = { ...this.user, bio: this.tempBio.trim() };
      this.userService.updateUser(updatedUser);
      this.editingBio = false;
      this.tempBio = '';
    }
  }

  // Sports editing methods
  startAddingSport() {
    this.editingSports = true;
    this.newSport = { name: '', level: '' };
  }

  cancelAddingSport() {
    this.editingSports = false;
    this.newSport = { name: '', level: '' };
  }

  addSport() {
    if (this.newSport.name && this.newSport.level) {
      // Check if sport already exists
      const existingSport = this.user.sports.find((sport: any) => sport.name === this.newSport.name);
      
      if (existingSport) {
        // Update existing sport level
        existingSport.level = this.newSport.level;
      } else {
        // Add new sport
        this.user.sports.push({ ...this.newSport });
      }
      
      this.userService.updateUser(this.user);
      this.editingSports = false;
      this.newSport = { name: '', level: '' };
    }
  }

  removeSport(index: number) {
    this.user.sports.splice(index, 1);
    this.userService.updateUser(this.user);
  }
}
