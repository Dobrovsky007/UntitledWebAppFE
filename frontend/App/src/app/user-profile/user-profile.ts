import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService, User, Event } from '../shared/services/user.service';
import { AuthService } from '../shared/services/auth.service';
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
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit, OnDestroy {
  user: User = {
    username: '',
    avatar: '',
    rating: 0,
    sports: [],
    verified: false,
    trustScore: 0,
    events: []
  };
  
  editingSports = false;
  newSport = { name: '', level: '' };
  isLoading = false;
  
  // Event data
  pastEvents: Event[] = [];
  upcomingEvents: Event[] = [];
  eventsLoading = false;
  selectedEventTab: 'upcoming' | 'past' = 'upcoming'; // Default to upcoming
  maxEventsToShow = 3; // Changed from 4 to 3
  
  availableSports = [
    'Soccer', 'Basketball', 'Small Football', 'Floorball', 'Ice Hockey', 
    'Volleyball', 'Tennis', 'Golf', 'Table Tennis', 'Badminton', 
    'Running', 'Swimming', 'Handball', 'Chess', 'Cycling',
    'Frisbee', 'Hiking', 'Padel', 'Footvolley', 'Bowling', 'Darts'
  ];

  availableLevels = ['Beginner', 'Intermediate', 'Advanced'];

  // Sport and level mappings for backend
  private sportMapping: { [key: string]: number } = {
    'Soccer': 1, 'Basketball': 2, 'Small Football': 3, 'Floorball': 4, 'Ice Hockey': 5,
    'Volleyball': 6, 'Tennis': 7, 'Golf': 8, 'Table Tennis': 9, 'Badminton': 10,
    'Running': 11, 'Swimming': 12, 'Handball': 13, 'Chess': 14, 'Cycling': 15,
    'Frisbee': 16, 'Hiking': 17, 'Padel': 18, 'Footvolley': 19, 'Bowling': 20, 'Darts': 21
  };

  private levelMapping: { [key: string]: number } = {
    'Beginner': 1, 'Intermediate': 2, 'Advanced': 3
  };

  private userSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserEvents();
    
    // Subscribe to user service updates in case user data changes elsewhere
    this.userSubscription.add(
      this.userService.user$.subscribe((user: User) => {
        if (user.username) {
          this.user = user;
        }
      })
    );
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  loadUserProfile(retryCount: number = 0) {
    this.isLoading = true;
    
    this.userService.loadUserProfile().subscribe({
      next: (userData: any) => {
        // Process the user data and ensure sports are properly formatted
        this.user = {
          username: userData.username || '',
          avatar: userData.avatar || '',
          rating: userData.rating || 0,
          sports: this.processSportsData(userData.sports || []),
          verified: userData.verified || false,
          trustScore: userData.trustScore || 0,
          events: userData.events || []
        };
        
        if (retryCount > 0) {
          this.showSuccess(`Profile loaded successfully after ${retryCount + 1} attempts!`);
        }
      },
      error: (error) => {
        // Handle 500 errors with retry logic (for ConcurrentModificationException)
        if (error.status === 500 && retryCount < 3) {
          setTimeout(() => {
            this.loadUserProfile(retryCount + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
          return;
        }
        
        // Show specific error message based on status
        if (error.status === 500) {
          this.showError('Backend server error (likely Hibernate concurrency issue). Try refreshing again.');
        } else if (error.status === 401) {
          this.showError('Authentication failed. Please log in again.');
        } else if (error.status === 403) {
          this.showError('Access denied to profile data.');
        } else {
          this.showError('Failed to load profile. Please try again.');
        }
        
        // Set a default user state so the UI doesn't break
        this.user = {
          username: 'Unknown User',
          avatar: '',
          rating: 0,
          sports: [],
          verified: false,
          trustScore: 0,
          events: []
        };
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Test method to diagnose backend connection issues with JWT authentication
   */
  testBackendConnection(): void {
    // Use the user service to make an authenticated request
    this.userService.loadUserProfile().subscribe({
      next: (response: any) => {
        this.showSuccess('Backend connection test with JWT successful');
      },
      error: (error: any) => {
        this.showError(`Backend test with JWT failed: ${error.status} ${error.statusText}`);
      }
    });
  }

  /**
   * Check current authentication status and JWT token validity
   */
  checkAuthStatus(): void {
    // Check if user is logged in
    const isLoggedIn = this.authService.isAuthenticated();
    
    // Check token
    const token = this.authService.getToken();
    
    if (token) {
      // Try to decode token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() > payload.exp * 1000;
        
        if (isExpired) {
          this.showError('Authentication token has expired');
        } else {
          this.showSuccess('Authentication check completed - token is valid');
        }
      } catch (error) {
        this.showError('Token decode error - invalid JWT format');
      }
    } else {
      this.showError('No authentication token found');
    }
  }

  /**
   * Load user's past and upcoming events
   */
  loadUserEvents(retryCount: number = 0): void {
    this.eventsLoading = true;

    // Load both past and upcoming events concurrently
    const pastEventsObs = this.userService.loadPastEvents();
    const upcomingEventsObs = this.userService.loadUpcomingEvents();

    pastEventsObs.subscribe({
      next: (events: Event[]) => {
        console.log('✅ Past events loaded:', events);
        this.pastEvents = events;
      },
      error: (error) => {
        console.error('❌ Error loading past events:', error);
        
        // Retry logic for 500 errors (same concurrency issue)
        if (error.status === 500 && retryCount < 2) {
          console.log(`🔄 Retrying past events (attempt ${retryCount + 2}/3)...`);
          setTimeout(() => {
            this.loadUserEvents(retryCount + 1);
          }, 1000 * (retryCount + 1));
          return;
        }
        
        this.pastEvents = [];
        if (retryCount >= 2) {
          this.showError('Failed to load past events after multiple attempts');
        }
      }
    });

    upcomingEventsObs.subscribe({
      next: (events: Event[]) => {
        console.log('✅ Upcoming events loaded:', events);
        this.upcomingEvents = events;
      },
      error: (error) => {
        console.error('❌ Error loading upcoming events:', error);
        
        // Retry logic for 500 errors
        if (error.status === 500 && retryCount < 2) {
          console.log(`🔄 Retrying upcoming events (attempt ${retryCount + 2}/3)...`);
          setTimeout(() => {
            this.loadUserEvents(retryCount + 1);
          }, 1000 * (retryCount + 1));
          return;
        }
        
        this.upcomingEvents = [];
        if (retryCount >= 2) {
          this.showError('Failed to load upcoming events after multiple attempts');
        }
      },
      complete: () => {
        this.eventsLoading = false;
      }
    });
  }

  /**
   * Switch between upcoming and past events
   */
  selectEventTab(tab: 'upcoming' | 'past'): void {
    this.selectedEventTab = tab;
    console.log(`📅 Switched to ${tab} events tab`);
  }

  /**
   * Get all events for display (scrollable)
   */
  getDisplayEvents(): Event[] {
    return this.selectedEventTab === 'upcoming' ? this.upcomingEvents : this.pastEvents;
  }

  /**
   * Get count of all events for the selected tab
   */
  getTotalEventCount(): number {
    return this.selectedEventTab === 'upcoming' ? this.upcomingEvents.length : this.pastEvents.length;
  }

  /**
   * Process sports data from backend API to ensure proper format for UI
   */
  private processSportsData(sportsData: any[]): any[] {
    return sportsData.map(sport => {
      console.log('🔄 Processing sport item:', sport);
      
      // Handle different possible formats from backend
      let sportName = sport.name;
      let sportLevel = sport.level;
      
      // If backend returns sportId and skillLevel instead of names
      if (sport.sportId && !sportName) {
        sportName = this.getSportNameById(sport.sportId);
      }
      
      if (sport.skillLevel && !sportLevel) {
        sportLevel = this.getLevelNameById(sport.skillLevel);
      }
      
      // If backend returns numeric values, convert them
      if (typeof sport.sport === 'number') {
        sportName = this.getSportNameById(sport.sport);
      }
      
      if (typeof sport.level === 'number') {
        sportLevel = this.getLevelNameById(sport.level);
      }
      
      return {
        ...sport,
        name: sportName || 'Unknown Sport',
        level: sportLevel || 'Unknown Level',
        sportId: sport.sportId || sport.sport,
        skillLevel: sport.skillLevel || sport.level
      };
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userService.updateAvatar(e.target.result).subscribe({
          next: (response) => {
            this.user.avatar = e.target.result;
            this.showSuccess('Avatar updated successfully!');
          },
          error: (error) => {
            console.error('❌ Error updating avatar:', error);
            this.showError('Failed to update avatar');
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  startAddingSport() {
    this.editingSports = true;
    this.newSport = { name: '', level: '' };
  }

  cancelAddingSport() {
    this.editingSports = false;
    this.newSport = { name: '', level: '' };
  }

  addSport(): void {
    if (!this.newSport.name || !this.newSport.level) {
      this.showError('Please select both sport and level');
      return;
    }

    const sportId = this.getSportId(this.newSport.name);
    const levelId = this.getLevelId(this.newSport.level);

    console.log('🚀 Starting addSport process:');
    console.log('  📝 Selected sport:', this.newSport.name, '-> ID:', sportId);
    console.log('  📝 Selected level:', this.newSport.level, '-> ID:', levelId);
    console.log('  📝 Request payload:', { sport: sportId, skillLevel: levelId });

    this.userService.addSport(sportId, levelId).subscribe({
      next: (response) => {
        console.log('✅ Sport added successfully to backend:', response);
        this.showSuccess('Sport added successfully!');
        
        // Clear form
        const addedSportName = this.getSportNameById(sportId) || this.newSport.name;
        const addedLevelName = this.newSport.level;

        // Optimistically update local user object so UI reflects change immediately
        const newSportEntry = {
          name: addedSportName,
          level: addedLevelName,
          sportId: sportId,
          skillLevel: levelId
        } as any;

        this.user.sports = [...(this.user.sports || []), newSportEntry];
        // Update shared user state
        this.userService.setUser(this.user);

        this.cancelAddingSport();

        // Try to reload full profile but don't surface errors to the user if it fails
        this.userService.loadUserProfile().subscribe({
          next: (userData: any) => {
            console.log('✅ Profile reloaded after addSport:', userData);
            this.user = userData;
          },
          error: (err) => {
            // Keep optimistic update and log the backend error for debugging
            console.warn('⚠️ Profile reload failed after addSport; keeping optimistic UI update', err);
          }
        });
      },
      error: (error) => {
        console.error('❌ addSport failed completely:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          errorBody: error.error
        });
        
        // Provide specific error messages based on status code
        let errorMessage = 'Failed to add sport';
        if (error.status === 500) {
          errorMessage = 'Server error: Backend authentication or database issue';
        } else if (error.status === 401) {
          errorMessage = 'Authentication failed: Please log in again';
        } else if (error.status === 403) {
          errorMessage = 'Permission denied: You are not authorized to add sports';
        } else if (error.status === 0) {
          errorMessage = 'Network error: Cannot connect to server';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.showError(errorMessage);
      }
    });
  }

  /**
   * Return the sport name for a given sportId using our mapping.
   * If not found, returns undefined.
   */
  getSportNameById(id: number): string | undefined {
    for (const [name, sid] of Object.entries(this.sportMapping)) {
      if (sid === id) return name;
    }
    return undefined;
  }

  /**
   * Return the level name for a given levelId using our mapping.
   * If not found, returns undefined.
   */
  getLevelNameById(id: number): string | undefined {
    for (const [name, levelId] of Object.entries(this.levelMapping)) {
      if (levelId === id) return name;
    }
    return undefined;
  }

  removeSport(index: number) {
    const sport = this.user.sports[index];
    const sportId = sport.sportId || this.sportMapping[sport.name];

    if (!sportId) {
      this.showError('Unable to identify sport for removal');
      return;
    }

    console.log('Removing sport:', { sportId, sportName: sport.name });

    // Optimistically remove from UI immediately
    const originalSports = [...this.user.sports];
    this.user.sports = this.user.sports.filter((_, i) => i !== index);
    this.userService.setUser(this.user);

    this.userService.removeSport(sportId).subscribe({
      next: (response) => {
        console.log('✅ Sport removed successfully:', response);
        this.showSuccess('Sport removed successfully!');
        
        // Try to reload full profile but don't surface errors to the user if it fails
        this.userService.loadUserProfile().subscribe({
          next: (userData: any) => {
            this.user = userData;
          },
          error: (err) => {
            // Keep optimistic update and log the backend error for debugging
            console.warn('⚠️ Profile reload failed after removeSport; keeping optimistic UI update', err);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error removing sport:', error);
        // Revert optimistic update on error
        this.user.sports = originalSports;
        this.userService.setUser(this.user);
        this.showError('Failed to remove sport');
      }
    });
  }

  getSportId(sportName: string): number {
    return this.sportMapping[sportName] || 0;
  }

  getLevelId(levelName: string): number {
    return this.levelMapping[levelName] || 0;
  }

  getAvatarUrl(): string {
    return this.user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSIjY2NjIi8+CjxlbGxpcHNlIGN4PSI2MCIgY3k9IjEwMCIgcng9IjMwIiByeT0iMjAiIGZpbGw9IiNjY2MiLz4KPC9zdmc+';
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
