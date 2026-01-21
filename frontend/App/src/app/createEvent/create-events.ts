import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { NgZone } from '@angular/core';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatToolbarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
  ],
  templateUrl: './create-events.html',
  styleUrls: ['./create-events.scss'],
})
export class CreateEvents implements OnInit, AfterViewInit {
  eventForm!: FormGroup;
  map!: L.Map;
  marker!: L.Marker;

  sports: string[] = [
    'Soccer', 'Basketball', 'Futsal', 'Florball', 'Ice Hockey',
    'Volleyball', 'Tennis', 'Golf', 'Table Tennis', 'Badminton',
    'Running', 'Swimming', 'Handball', 'Chess', 'Cycling',
    'Frisbee', 'Hiking', 'Padel', 'Foot Volley', 'Bowling', 'Darts'
  ];

  // Time picker arrays
  hours: string[] = [];
  minutes: string[] = [];

  constructor(private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private snackBar: MatSnackBar, 
    private ngZone: NgZone) {
    
    // Initialize hours (00-23)
    for (let i = 0; i < 24; i++) {
      this.hours.push(i.toString().padStart(2, '0'));
    }
    
    // Initialize minutes (00, 05, 10, ..., 55)
    for (let i = 0; i < 60; i += 5) {
      this.minutes.push(i.toString().padStart(2, '0'));
    }
    
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      sport: [0, Validators.required],
      address: ['', Validators.required],
      skillLevel: [0, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startHour: ['', Validators.required],
      startMinute: ['', Validators.required],
      endHour: ['', Validators.required],
      endMinute: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      latitude: [null],
      longitude: [null],
  });
  }

  ngOnInit() {
    console.log('CreateEvents component initialized');
    console.log('Event form:', this.eventForm);
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    try {
      // Fix Leaflet marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Initialize map
      const mapElement = document.getElementById('map');
      console.log('Map element:', mapElement);
      
      if (mapElement) {
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
      } else {
        console.error('Map element not found');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  
  onSubmit() {
    console.log('onSubmit called');
    console.log('Form valid:', this.eventForm.valid);
    console.log('Form value:', this.eventForm.value);
    
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;

      // Convert date to YYYY-MM-DD string format
      const startDateStr = this.formatDate(formValue.startDate);
      const endDateStr = this.formatDate(formValue.endDate);

      // Combine hour and minute into time strings
      const startTime = `${formValue.startHour}:${formValue.startMinute}`;
      const endTime = `${formValue.endHour}:${formValue.endMinute}`;

      // Combine date + time into ISO timestamps (preserving local timezone)
      const startDateTime = this.toLocalISOString(startDateStr, startTime);
      const endDateTime = this.toLocalISOString(endDateStr, endTime);

      const payload = {
        title: formValue.title,
        sport: formValue.sport,
        address: formValue.address,
        skillLevel: formValue.skillLevel,
        startTime: startDateTime,
        endTime: endDateTime,
        capacity: formValue.capacity,
        latitude: formValue.latitude,
        longitude: formValue.longitude,
      };

      console.log('Sending payload:', payload);

      this.http.post(
        `${environment.apiUrl}/event/create`,
        payload,
        { 
          headers: { 'Content-Type': 'application/json' },
          observe: 'response',
          responseType: 'text'
        }
      ).subscribe({
        next: (response) => {
          console.log('Success response:', response);
          if (response.status >= 200 && response.status < 300) {
            this.showSuccess('Event created successfully!');
            setTimeout(() => {
              this.ngZone.run(() => {
                this.router.navigate(['/dashboard']);
              });
            }, 500);
          } else {
            this.showError('Unexpected response from server');
          }
        },
        error: (error) => {
          console.error('Error response:', error);
          const errorMessage = error.error?.message || error.error || 'Event creation failed';
          this.showError(errorMessage);
        }
      });
    } else {
      this.eventForm.markAllAsTouched();
      this.showError('Please fill out all required fields.');
      console.log('Form errors:', this.eventForm.errors);
    }
  }

  // Helper method to convert Date to YYYY-MM-DD string
  private formatDate(date: any): string {
    console.log('formatDate called with:', date);
    if (!date) return '';
    
    // If it's already a string, return it
    if (typeof date === 'string') return date;
    
    // If it's a Date object, convert to YYYY-MM-DD
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  }

  // Convert local date and time to ISO string without timezone conversion
  private toLocalISOString(dateStr: string, timeStr: string): string {
    console.log('toLocalISOString called with date:', dateStr, 'time:', timeStr);
    const date = new Date(`${dateStr}T${timeStr}`);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - tzOffset);
    const result = localDate.toISOString().slice(0, -1); // Remove 'Z' to indicate local time
    console.log('toLocalISOString result:', result);
    return result;
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
