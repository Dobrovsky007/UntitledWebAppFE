import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { environment } from '../../../environments/environment';

interface FilterCriteria {
  sports?: number[];
  skillLevels?: number[];
  startTimeAfter?: string;
  endTimeBefore?: string;
  freeSlots?: number;
}

interface Event {
  id: string;
  title: string;
  sport: number;
  skillLevel: number;
  address: string;
  startTime: string;
  capacity: number;
  occupied?: number;
  image?: string;
  category?: string;
  freeSlots?: number;
}

@Component({
  selector: 'app-explore-events',
  imports: [
    CommonModule,
    FormsModule,
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ClipboardModule
  ],
  templateUrl: './explore-events.html',
  styleUrl: './explore-events.scss'
})
export class ExploreEvents implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = false;
  error: string | null = null;

  // Filter options
  filters: FilterCriteria = {};
  
  // Available options for dropdowns (same as user profile)
  sportOptions = [
    { value: 0, name: 'Soccer' },
    { value: 1, name: 'Basketball' },
    { value: 2, name: 'Small Football' },
    { value: 3, name: 'Floorball' },
    { value: 4, name: 'Ice Hockey' },
    { value: 5, name: 'Volleyball' },
    { value: 6, name: 'Tennis' },
    { value: 7, name: 'Golf' },
    { value: 8, name: 'Table Tennis' },
    { value: 9, name: 'Badminton' },
    { value: 10, name: 'Running' },
    { value: 11, name: 'Swimming' },
    { value: 12, name: 'Handball' },
    { value: 13, name: 'Chess' },
    { value: 14, name: 'Cycling' },
    { value: 15, name: 'Frisbee' },
    { value: 16, name: 'Hiking' },
    { value: 17, name: 'Padel' },
    { value: 18, name: 'Footvolley' },
    { value: 19, name: 'Bowling' },
    { value: 20, name: 'Darts' }
  ];

  skillLevelOptions = [
    { value: 0, name: 'Beginner' },
    { value: 1, name: 'Intermediate' },
    { value: 2, name: 'Advanced' }
  ];

  freeSlotsOptions = [
    { value: 1, name: '1+ spots' },
    { value: 2, name: '2+ spots' },
    { value: 3, name: '3+ spots' },
    { value: 5, name: '5+ spots' }
  ];

  // Form fields
  selectedSports: number[] = [];
  selectedSkillLevels: number[] = [];
  selectedFreeSlots: number | null = null;
  startDateAfter: Date | null = null;
  endDateBefore: Date | null = null;

  private readonly apiUrl = `${environment.apiUrl}/event`;

  constructor(
    private http: HttpClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAllEventsWithRecommendations();
  }

  /**
   * Load all events and sort by user preferences
   */
  loadAllEventsWithRecommendations() {
    this.isLoading = true;
    this.error = null;

    const token = localStorage.getItem('authToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('Loading all events with preference-based sorting...');

    // Load all events first
    this.http.get<Event[]>(`${this.apiUrl}/all`, { headers }).subscribe({
      next: (allEvents) => {
        console.log('✅ All events received:', allEvents.length);
        
        // Filter to only show future events
        const futureEvents = allEvents.filter(event => new Date(event.startTime) > new Date());
        console.log('Future events:', futureEvents.length);

        // Load user's preferred sports to sort events
        this.loadUserPreferencesAndSort(futureEvents, headers);
      },
      error: (err) => {
        console.error('❌ Error loading events:', err);
        if (err.status === 404) {
          this.error = 'No events found.';
        } else if (err.status === 401) {
          this.error = 'Authentication required. Please log in.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = 'Failed to load events. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  /**
   * Load user preferences and sort events accordingly
   */
  private loadUserPreferencesAndSort(events: Event[], headers: any) {
    // Get user profile to know their preferred sports
    this.http.get<any>(`${environment.apiUrl}/user/profile`, { headers }).subscribe({
      next: (profile) => {
        console.log('✅ User profile received');
        
        // Extract preferred sport IDs - try multiple possible field names
        const preferredSportIds = profile.sports?.map((s: any) => {
          return s.sportId || s.sport || s.id;
        }) || [];
        
        console.log('📊 Preferred sport IDs:', preferredSportIds);
        console.log('📊 Preferred sport names:', preferredSportIds.map((id: number) => this.getSportName(id)));

        // Sort events: preferred sports first, then others
        this.events = this.sortEventsByPreference(events, preferredSportIds);
        this.filteredEvents = [...this.events];
        this.enhanceEventData();
        this.isLoading = false;
        
        console.log('✅ Events sorted and displayed:', this.filteredEvents.length);
        console.log('🎯 First 5 events by sport:', this.filteredEvents.slice(0, 5).map(e => ({ 
          sport: this.getSportName(e.sport), 
          title: e.title,
          isPreferred: preferredSportIds.includes(e.sport) ? '⭐' : ''
        })));
      },
      error: (err) => {
        console.warn('⚠️ Could not load user preferences, showing events unsorted:', err);
        // If we can't load preferences, just show all events unsorted
        this.events = events;
        this.filteredEvents = [...this.events];
        this.enhanceEventData();
        this.isLoading = false;
      }
    });
  }

  /**
   * Sort events putting preferred sports first
   */
  private sortEventsByPreference(events: Event[], preferredSportIds: number[]): Event[] {
    return events.sort((a, b) => {
      const aIsPreferred = preferredSportIds.includes(a.sport);
      const bIsPreferred = preferredSportIds.includes(b.sport);
      
      // Preferred sports come first
      if (aIsPreferred && !bIsPreferred) return -1;
      if (!aIsPreferred && bIsPreferred) return 1;
      
      // If both are preferred or both are not, sort by date
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }

  /**
   * Load all events that are in the future, sorted by recommendations
   */
  loadAllEvents() {
    this.loadAllEventsWithRecommendations();
  }

  /**
   * Fallback method to load all events without recommendations
   */
  private loadAllEventsAsFallback(headers: any) {
    this.http.get<Event[]>(`${this.apiUrl}/all`, { headers }).subscribe({
      next: (events) => {
        console.log('Raw events from backend (fallback):', events);
        // Filter to only show future events
        this.events = events.filter(event => new Date(event.startTime) > new Date());
        this.filteredEvents = [...this.events];
        this.enhanceEventData();
        this.isLoading = false;
        console.log('Processed events:', this.filteredEvents);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        if (err.status === 404) {
          this.error = 'No events found.';
        } else if (err.status === 401) {
          this.error = 'Authentication required. Please log in.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = 'Failed to load events. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  /**
   * Apply filters using the backend filter API
   */
  applyFilters() {
    this.isLoading = true;
    this.error = null;

    // Get auth token for API calls
    const token = localStorage.getItem('authToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Build filter criteria
    const criteria: FilterCriteria = {};
    
    if (this.selectedSports.length > 0) {
      criteria.sports = this.selectedSports;
    }
    
    if (this.selectedSkillLevels.length > 0) {
      criteria.skillLevels = this.selectedSkillLevels;
    }
    
    if (this.startDateAfter) {
      // Format as ISO local datetime without milliseconds and timezone (e.g., 2026-01-13T23:00:00)
      criteria.startTimeAfter = this.startDateAfter.toISOString().slice(0, 19);
    }
    
    if (this.endDateBefore) {
      // Format as ISO local datetime without milliseconds and timezone (e.g., 2026-01-13T23:00:00)
      criteria.endTimeBefore = this.endDateBefore.toISOString().slice(0, 19);
    }
    
    if (this.selectedFreeSlots !== null) {
      criteria.freeSlots = this.selectedFreeSlots;
    }

    // If no filters applied, show all events
    if (Object.keys(criteria).length === 0) {
      this.loadAllEvents();
      return;
    }

    // Build HTTP params
    let params = new HttpParams();
    
    if (criteria.sports) {
      criteria.sports.forEach(sport => {
        params = params.append('sports', sport.toString());
      });
    }
    
    if (criteria.skillLevels) {
      criteria.skillLevels.forEach(level => {
        params = params.append('skillLevels', level.toString());
      });
    }
    
    if (criteria.startTimeAfter) {
      params = params.set('startTimeAfter', criteria.startTimeAfter);
    }
    
    if (criteria.endTimeBefore) {
      params = params.set('endTimeBefore', criteria.endTimeBefore);
    }
    
    if (criteria.freeSlots) {
      params = params.set('freeSlots', criteria.freeSlots.toString());
    }

    console.log('Applying filters with params:', params.toString());

    // Call the filter API
    this.http.get<Event[]>(`${this.apiUrl}/filter`, { params, headers }).subscribe({
      next: (events) => {
        console.log('Filtered events from backend:', events);
        // Still filter for future events in case backend doesn't
        this.filteredEvents = events.filter(event => new Date(event.startTime) > new Date());
        this.enhanceEventData();
        this.isLoading = false;
        console.log('Final filtered events:', this.filteredEvents);
      },
      error: (err) => {
        console.error('Error filtering events:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        console.error('Error message:', err.message);
        if (err.status === 500) {
          this.error = 'No events found matching your criteria.';
        } else if (err.status === 401) {
          this.error = 'Authentication required. Please log in.';
        } else if (err.status === 400) {
          this.error = 'Invalid filter parameters: ' + (typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
        } else {
          this.error = 'Failed to filter events. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  /**
   * Clear all filters and show all events
   */
  clearFilters() {
    this.selectedSports = [];
    this.selectedSkillLevels = [];
    this.selectedFreeSlots = null;
    this.startDateAfter = null;
    this.endDateBefore = null;
    this.loadAllEvents();
  }

  /**
   * Remove a sport filter
   */
  removeSportFilter(sportId: number) {
    this.selectedSports = this.selectedSports.filter(s => s !== sportId);
    this.applyFilters();
  }

  /**
   * Remove a skill level filter
   */
  removeSkillLevelFilter(levelId: number) {
    this.selectedSkillLevels = this.selectedSkillLevels.filter(l => l !== levelId);
    this.applyFilters();
  }

  /**
   * Enhance event data with additional fields for display
   */
  private enhanceEventData() {
    this.filteredEvents = this.filteredEvents.map(event => ({
      ...event,
      category: this.getSportName(event.sport),
      image: 'assets/logo.svg', // Placeholder image
      freeSlots: event.capacity - (event.occupied || 0)
    }));
  }

  /**
   * Get sport name from sport ID
   */
  getSportName(sportId: number): string {
    const sport = this.sportOptions.find(s => s.value === sportId);
    return sport?.name || 'Unknown Sport';
  }

  /**
   * Get skill level name from skill level ID
   */
  getSkillLevelName(skillLevelId: number): string {
    const level = this.skillLevelOptions.find(l => l.value === skillLevelId);
    return level?.name || 'Unknown Level';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Check if filters are active
   */
  hasActiveFilters(): boolean {
    return this.selectedSports.length > 0 ||
           this.selectedSkillLevels.length > 0 ||
           this.selectedFreeSlots !== null ||
           this.startDateAfter !== null ||
           this.endDateBefore !== null;
  }

  joinEvent(eventId: string) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.snackBar.open('Please log in to join events', 'Close', { duration: 3000 });
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.http.post(
      `${environment.apiUrl}/user/event/join?eventId=${eventId}`,
      {},
      { headers, responseType: 'text' }
    ).subscribe({
      next: (response) => {
        console.log('Successfully joined event:', response);
        this.snackBar.open('Successfully joined the event!', 'Close', { duration: 3000 });
        // Reload events to update the UI
        this.loadAllEventsWithRecommendations();
      },
      error: (err) => {
        console.error('Error joining event:', err);
        if (err.status === 400) {
          this.snackBar.open('You have already joined this event', 'Close', { duration: 3000 });
        } else if (err.status === 401) {
          this.snackBar.open('Authentication required. Please log in.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to join event. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }

  /**
   * Share event by copying the link to clipboard
   */
  shareEvent(eventId: string) {
    // Construct the event URL
    const eventUrl = `${window.location.origin}/event-details/${eventId}`;
    
    // Copy to clipboard
    const success = this.clipboard.copy(eventUrl);
    
    if (success) {
      // Show success notification
      this.snackBar.open('Event link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      });
    } else {
      // Show error notification
      this.snackBar.open('Failed to copy link. Please try again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
    }
  }
}
