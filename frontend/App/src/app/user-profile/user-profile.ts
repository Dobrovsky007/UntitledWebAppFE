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
import { UserService, User } from '../shared/services/user.service';
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
    
    // Subscribe to user service updates in case user data changes elsewhere
    this.userSubscription.add(
      this.userService.user$.subscribe((user: User) => {
        if (user.username) {
          console.log('🔄 User data updated from service:', user);
          this.user = user;
        }
      })
    );
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  loadUserProfile() {
    this.isLoading = true;
    console.log('🔄 Starting to load user profile from /api/user/profile...');
    
    this.userService.loadUserProfile().subscribe({
      next: (userData: any) => {
        console.log('✅ User profile loaded from /api/user/profile:', userData);
        console.log('📊 Sports data received:', userData.sports);
        
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
        
        console.log('🎯 Processed user data:', this.user);
        console.log('🏃‍♂️ Processed sports:', this.user.sports);
      },
      error: (error) => {
        console.error('❌ Error loading profile from /api/user/profile:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          errorBody: error.error
        });
        
        // Show specific error message based on status
        if (error.status === 500) {
          this.showError('Backend server error. Please check if the /api/user/profile endpoint is working correctly.');
          console.error('💡 Backend troubleshooting suggestions:');
          console.error('   1. Check backend server logs for JWT authentication errors');
          console.error('   2. Verify /api/user/profile endpoint exists and is accessible');
          console.error('   3. Ensure JWT filter is properly configured for this endpoint');
          console.error('   4. Check database connection and user data retrieval');
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
    console.log('🔧 Testing backend connection with JWT authentication...');
    
    // Use the user service to make an authenticated request
    this.userService.loadUserProfile().subscribe({
      next: (response: any) => {
        console.log('✅ Backend test with JWT - Success!', response);
        console.log('✅ Backend test - User data received:', response);
        console.log('✅ Backend test - Sports data:', response.sports);
        this.showSuccess('Backend connection test with JWT successful - check console for details');
      },
      error: (error: any) => {
        console.error('❌ Backend test with JWT - Error:', error);
        console.error('❌ Backend test - Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          errorBody: error.error,
          headers: error.headers
        });
        
        // Try to get more specific error information
        if (error.error) {
          console.error('❌ Backend test - Server response body:', error.error);
          
          // If it's a string response, it might contain useful error info
          if (typeof error.error === 'string') {
            console.error('❌ Backend test - Server error message:', error.error);
          }
          
          // If it's an object, log its properties
          if (typeof error.error === 'object') {
            console.error('❌ Backend test - Error object keys:', Object.keys(error.error));
            console.error('❌ Backend test - Error object values:', error.error);
          }
        }
        
        this.showError(`Backend test with JWT failed: ${error.status} ${error.statusText}`);
      }
    });
  }

  /**
   * Check current authentication status and JWT token validity
   */
  checkAuthStatus(): void {
    console.log('🔐 Checking authentication status...');
    
    // Check if user is logged in
    const isLoggedIn = this.authService.isAuthenticated();
    console.log('🔐 Is authenticated:', isLoggedIn);
    
    // Check token
    const token = this.authService.getToken();
    console.log('🔐 Token exists:', !!token);
    
    if (token) {
      console.log('🔐 Token (first 50 chars):', token.substring(0, 50) + '...');
      
      // Try to decode token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔐 Token payload:', payload);
        console.log('🔐 Token subject (user):', payload.sub);
        console.log('🔐 Token issued at:', new Date(payload.iat * 1000));
        console.log('🔐 Token expires at:', new Date(payload.exp * 1000));
        console.log('🔐 Token is expired:', Date.now() > payload.exp * 1000);
        
        // Check current username from AuthService
        const currentUsername = this.authService.getCurrentUsername();
        console.log('🔐 Current username from AuthService:', currentUsername);
        
        this.showSuccess('Authentication check completed - see console for details');
      } catch (error) {
        console.error('🔐 Error decoding token:', error);
        this.showError('Token decode error - invalid JWT format');
      }
    } else {
      console.log('🔐 No token found');
      this.showError('No authentication token found');
    }
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
