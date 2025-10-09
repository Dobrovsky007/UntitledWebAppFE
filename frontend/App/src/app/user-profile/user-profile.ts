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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
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
  user: any = {
    username: '',
    avatar: '',
    trustScore: 0,
    sports: [],
    events: []
  };
  editingSports = false;
  newSport = { name: '', level: '' };
  
  availableSports = [
    'Soccer', 'Basketball', 'Small Football', 'Floorball', 'Ice Hockey', 
    'Volleyball', 'Tennis', 'Golf', 'Table Tennis', 'Badminton', 
    'Running', 'Swimming', 'Handball', 'Chess', 'Cycling',
    'Frisbee', 'Hiking', 'Padel', 'Footvolley', 'Bowling', 'Darts'
  ];

  // Sport and level mappings for backend
  private sportMapping: { [key: string]: number } = {
    'Soccer': 1,
    'Basketball': 2,
    'Small Football': 3,
    'Floorball': 4,
    'Ice Hockey': 5,
    'Volleyball': 6,
    'Tennis': 7,
    'Golf': 8,
    'Table Tennis': 9,
    'Badminton': 10,
    'Running': 11,
    'Swimming': 12,
    'Handball': 13,
    'Chess': 14,
    'Cycling': 15,
    'Frisbee': 16,
    'Hiking': 17,
    'Padel': 18,
    'Footvolley': 19,
    'Bowling': 20,
    'Darts': 21
  };

  private levelMapping: { [key: string]: number } = {
    'Beginner': 1,
    'Advanced': 2,
    'Intermediate': 3
  };

  private apiUrl = 'http://localhost:8080';
  private userSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private userService: UserService,
    private http: HttpClient
  ) {
    // Debug: Log when component is created
    console.log('🔍 UserProfile component created');
    console.log('🔍 Current route:', this.router.url);
    console.log('🔍 Token in localStorage:', localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING');
  }

  ngOnInit() {
    console.log('🔍 UserProfile ngOnInit() called');
    
    // Initialize user with default values to prevent template errors
    this.user = {
      username: 'Loading...',
      avatar: '',
      trustScore: 0,
      sports: [],
      events: []
    };

    // Subscribe to user service first
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.user = { ...this.user, ...user };
      }
    });
    
    // Load profile - let loadUserProfile handle authentication
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    console.log(`🔍 Token check: ${token ? 'EXISTS' : 'MISSING'}`);
    return !!(token && token.trim() !== '');
  }

  // Get JWT token from localStorage - try multiple possible keys
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('No authentication token found');
    }
    
    console.log('✅ Using authToken from localStorage');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Load user profile from backend
  private loadUserProfile() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('No authentication token found.');
      this.setFallbackUser();
      return;
    }

    console.log('Found token, loading profile...');
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    this.userService.loadUserProfile().subscribe({
      next: (userData) => {
        console.log('✅ User profile loaded successfully:', userData);
        this.userService.setUser(userData);
        this.user = userData;
      },
      error: (error) => {
        console.error('❌ Error loading user profile:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error object:', error);
        
        console.warn('Profile loading failed, using fallback data');
        this.setFallbackUser();
      }
    });
  }

  private setFallbackUser() {
    const fallbackUser = {
      username: 'User',
      email: '',
      bio: 'Tell us about yourself...',
      avatar: 'https://via.placeholder.com/150/cccccc/666666?text=User',
      trustScore: 0,
      sports: [],
      events: []
    };
    
    this.userService.setUser(fallbackUser);
    this.user = fallbackUser;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const avatarData = {
            avatar: e.target.result
          };
          
          this.http.put(`${this.apiUrl}/api/user/avatar`, avatarData, {
            headers: this.getAuthHeaders()
          }).subscribe({
            next: (response: any) => {
              this.user.avatar = e.target.result;
              this.userService.updateAvatar(e.target.result);
            },
            error: (error) => {
              console.error('Error updating avatar:', error);
              if (error.status === 401) {
                this.clearTokensAndRedirect();
              }
            }
          });
        } catch (error) {
          console.error('Error uploading avatar:', error);
          this.clearTokensAndRedirect();
        }
      };
      reader.readAsDataURL(file);
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
      const sportData = {
        sportId: this.sportMapping[this.newSport.name],
        levelId: this.levelMapping[this.newSport.level],
        sportName: this.newSport.name,
        levelName: this.newSport.level
      };

      console.log('Sending sport data:', sportData);

      try {
        this.http.post(`${this.apiUrl}/api/user/sport/add`, sportData, {
          headers: this.getAuthHeaders()
        }).subscribe({
          next: (response: any) => {
            console.log('Sport added successfully:', response);
            
            const existingSportIndex = this.user.sports.findIndex((sport: any) => sport.name === this.newSport.name);
            
            if (existingSportIndex !== -1) {
              this.user.sports[existingSportIndex].level = this.newSport.level;
              this.user.sports[existingSportIndex].levelId = sportData.levelId;
            } else {
              this.user.sports.push({ 
                name: this.newSport.name, 
                level: this.newSport.level,
                sportId: sportData.sportId,
                levelId: sportData.levelId
              });
            }
            
            this.userService.updateUser(this.user);
            this.editingSports = false;
            this.newSport = { name: '', level: '' };
          },
          error: (error) => {
            console.error('Error adding sport:', error);
            if (error.status === 401) {
              this.clearTokensAndRedirect();
            }
          }
        });
      } catch (error) {
        console.error('Error creating auth headers for add sport:', error);
        this.clearTokensAndRedirect();
      }
    }
  }

  removeSport(index: number) {
    const sport = this.user.sports[index];
    const sportId = sport.sportId || this.sportMapping[sport.name];

    try {
      this.http.post(`${this.apiUrl}/api/user/sport/remove`, { sportId }, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (response: any) => {
          console.log('Sport removed successfully:', response);
          this.user.sports.splice(index, 1);
          this.userService.updateUser(this.user);
        },
        error: (error) => {
          console.error('Error removing sport:', error);
          if (error.status === 401) {
            this.clearTokensAndRedirect();
          }
        }
      });
    } catch (error) {
      console.error('Error creating auth headers for remove sport:', error);
      this.clearTokensAndRedirect();
    }
  }

  // Clear all possible token keys and redirect to login
  private clearTokensAndRedirect() {
    // TEMPORARILY DISABLED FOR DEBUGGING
    console.log('clearTokensAndRedirect() called - but disabled for debugging');
    console.log('Would have cleared tokens and redirected to login');
    return; // Exit early to prevent logout
    
    // Original code (commented out)
    /*
    const possibleTokenKeys = ['authToken', 'auth_token', 'token', 'access_token', 'jwt_token', 'jwt'];
    possibleTokenKeys.forEach(key => localStorage.removeItem(key));
    console.log('Cleared all tokens and redirecting to login...');
    if (!this.router.url.includes('/login') && !this.router.url.includes('/register')) {
      this.router.navigate(['/login']);
    }
    */
  }

  // Helper methods
  getSportId(sportName: string): number {
    return this.sportMapping[sportName] || 0;
  }

  getLevelId(levelName: string): number {
    return this.levelMapping[levelName] || 0;
  }

  // Get default avatar if user avatar is not available
  getAvatarUrl(): string {
    return this.user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjIwIiBmaWxsPSIjY2NjIi8+CjxlbGxpcHNlIGN4PSI2MCIgY3k9IjEwMCIgcng9IjMwIiByeT0iMjAiIGZpbGw9IiNjY2MiLz4KPC9zdmc+';
  }
}
