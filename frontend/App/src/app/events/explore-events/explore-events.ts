import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

interface Event {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
}

@Component({
  selector: 'app-explore-events',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule,MatFormFieldModule, 
    MatSelectModule, MatInputModule, MatCardModule, MatListModule],
    
  templateUrl: './explore-events.html',
  styleUrl: './explore-events.scss'
})
export class ExploreEvents {
  events: Event[] = [
    {
      id: 1,
      title: 'Sunday Morning Kick-off',
      category: 'Football',
      date: 'Sep 28, 7:00 AM',
      location: 'City Park',
      attendees: 12,
      image: 'assets/events/football.jpg'
    },
    {
      id: 2,
      title: 'Evening Pick-up Game',
      category: 'Basketball',
      date: 'Sep 29, 6:00 PM',
      location: 'Community Court',
      attendees: 8,
      image: 'assets/events/basketball.jpg'
    },
    {
      id: 3,
      title: 'Weekend Tennis Doubles',
      category: 'Tennis',
      date: 'Sep 30, 10:00 AM',
      location: 'Tennis Club',
      attendees: 6,
      image: 'assets/events/tennis.jpg'
    }
  ];

  recommended: Event[] = [
    {
      id: 4,
      title: 'Advanced Hoop Session',
      category: 'Basketball',
      date: 'Oct 1, 5:00 PM',
      location: 'Sports Hall',
      attendees: 14,
      image: 'assets/events/recommend-basketball.jpg'
    },
    {
      id: 5,
      title: 'Friday Evening Tennis',
      category: 'Tennis',
      date: 'Oct 2, 7:00 PM',
      location: 'Court 4',
      attendees: 4,
      image: 'assets/events/recommend-tennis.jpg'
    }
  ];
}
