import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-explore-events',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './explore-events.html',
  styleUrl: './explore-events.scss'
})
export class ExploreEvents implements OnInit {
  events: any[] = [];
  recommended: any[] = [];

  ngOnInit() {
    // Mock data for events
    this.events = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Soccer Match',
        description: 'Friendly soccer match in the park',
        date: new Date(),
        location: 'Central Park',
        participants: 8,
        maxParticipants: 10,
        sport: 'Soccer',
        image: 'assets/soccer.jpg',
        category: 'Soccer',
        attendees: 8
      },
      {
        id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        title: 'Basketball Game',
        description: 'Quick basketball game',
        date: new Date(),
        location: 'Basketball Court',
        participants: 4,
        maxParticipants: 6,
        sport: 'Basketball',
        image: 'assets/basketball.jpg',
        category: 'Basketball',
        attendees: 4
      }
    ];

    // Mock data for recommendations
    this.recommended = [
      {
        id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        title: 'Tennis Match',
        description: 'Singles tennis match',
        date: new Date(),
        location: 'Tennis Club',
        participants: 1,
        maxParticipants: 2,
        sport: 'Tennis',
        image: 'assets/tennis.jpg',
        category: 'Tennis',
        attendees: 1
      }
    ];
  }

  joinEvent(eventId: string) {
    // TODO: Implement join event logic
  }
}
