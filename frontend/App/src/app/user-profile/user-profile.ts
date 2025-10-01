import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  user = {
    name: 'Alex Smith',
    bio: 'Passionate about sports and connecting with local players. Always up for a friendly match or a new challenge!',
    trustScore: 87,
    avatar: '', // will store uploaded image
    sports: [
      { name: 'Volleyball', level: 'Intermediate' },
      { name: 'Basketball', level: 'Advanced' },
      { name: 'Soccer', level: 'Beginner' }
    ],
    events: [
      { title: 'Saturday Morning Hoops', sport: 'Basketball', date: '2024-07-20', location: 'City Park Courts', status: 'Completed', image: 'assets/basketball.jpg' },
      { title: 'Sunday Volleyball Scrimmage', sport: 'Volleyball', date: '2024-07-28', location: 'Green Valley Field', status: 'Upcoming', image: 'assets/volleyball.jpg' },
      { title: 'Casual Tennis Doubles', sport: 'Tennis', date: '2024-07-15', location: 'Community Tennis Club', status: 'Cancelled', image: 'assets/tennis.jpg' }
    ]
  };

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.user.avatar = reader.result as string;
      reader.readAsDataURL(file);
    }
  }
}
