import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../auth';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  error: string | null = null;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder, 
    private auth: Auth,
    private router: Router,
    private userService: UserService // Add UserService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { username, password } = this.loginForm.value;
      
      this.auth.login(username, password).subscribe({
        next: (res) => {
          console.log('Login response:', res);
          this.loading = false;
          
          if (res.token) {
            localStorage.setItem('authToken', res.token);
            console.log('Token stored:', res.token.substring(0, 20) + '...');
            
            // Skip userService.loadUserProfile() and go directly to profile
            this.router.navigate(['/app/profile']);
          } else {
            console.error('No token in response:', res);
            this.error = 'No authentication token received';
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          this.error = err.error?.message || 'Login failed';
          this.loading = false;
        }
      });
    }
  }
}
