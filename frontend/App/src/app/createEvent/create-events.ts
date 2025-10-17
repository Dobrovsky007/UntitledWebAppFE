import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-create-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSidenavModule,
  ],
  providers: [
    provideNativeDateAdapter() // 👈 THIS is critical for Angular 18+ / 20+
  ],
  templateUrl: './create-events.html',
  styleUrls: ['./create-events.scss'],
})
export class CreateEvents implements OnInit {
  eventForm!: FormGroup;

  sports: string[] = [
    'Soccer', 'Basketball', 'Futsal', 'Florball', 'Ice Hockey',
    'Volleyball', 'Tennis', 'Golf', 'Table Tennis', 'Badminton',
    'Running', 'Swimming', 'Handball', 'Chess', 'Cycling',
    'Frisbee', 'Hiking', 'Padel', 'Foot Volley', 'Bowling', 'Darts'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      sport: [0, Validators.required],
      address: ['', Validators.required],
      skillLevel: [0, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      latitude: [0],
      longitude: [0],
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      console.log('Event JSON:', JSON.stringify(this.eventForm.value, null, 2));
    } else {
      this.eventForm.markAllAsTouched();
    }
  }
}
