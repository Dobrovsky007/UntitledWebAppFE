import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


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
import { NgZone } from '@angular/core';


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
  map!: L.Map;
  marker!: L.Marker;

  sports: string[] = [
    'Soccer', 'Basketball', 'Futsal', 'Florball', 'Ice Hockey',
    'Volleyball', 'Tennis', 'Golf', 'Table Tennis', 'Badminton',
    'Running', 'Swimming', 'Handball', 'Chess', 'Cycling',
    'Frisbee', 'Hiking', 'Padel', 'Foot Volley', 'Bowling', 'Darts'
  ];

  constructor(private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private snackBar: MatSnackBar, 
    private ngZone: NgZone) {
    
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      sport: [0, Validators.required],
      address: ['', Validators.required],
      skillLevel: [0, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      latitude: [null],
      longitude: [null],
      
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // Initialize map
    this.map = L.map('map').setView([48.7164, 21.2611], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Listen for click events
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // If marker exists, update its position
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        // Otherwise create a new marker
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }

      // Update form fields
      this.eventForm.patchValue({
        latitude: lat,
        longitude: lng
      });
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.http.post(
        'http://localhost:8080/api/event/create',
        this.eventForm.value,
        { headers: { 'Content-Type': 'application/json' } }
      ).subscribe({
        next: () => {
          this.showSuccess('Event created successfully!');
          this.ngZone.run(() => {
            console.log('Navigating to /dashboard');
            this.router.navigate(['/dashboard']).then(success => {
              console.log('Navigation success:', success);
        });
      });
        },
        error: (error) => {
          const errorMessage = error.error?.message || error.error || 'Event creation failed';
          this.showError(errorMessage);
        }
      });
    } else {
      this.eventForm.markAllAsTouched();
      this.showError('Please fill out all required fields.');
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
