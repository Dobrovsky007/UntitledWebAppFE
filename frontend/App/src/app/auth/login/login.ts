import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, LoginRequest } from '../../shared/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
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

      this.authService.login({ username, password }).pipe(
        finalize(() => { this.loading = false; }) // <- runs on complete OR error
      )
      .subscribe({
        next: (response) => {
          this.showSuccess('Login successful!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          let errorMessage = 'Login failed';
  
          // Handle different error scenarios with clear, user-friendly messages
          if (error.status === 0) {
            // Network error - server not responding
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 401 || error.status === 403) {
            // Authentication failed - invalid credentials
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.status >= 500) {
            // Server error (5xx)
            errorMessage = 'Server error. Please try again later.';
          } else if (error.status === 400) {
            // Bad request - could be validation error
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = 'Invalid login request. Please check your input.';
            }
          } else {
            // Try to extract message from error response
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (typeof error.error === 'string' && error.error.length > 0) {
              errorMessage = error.error;
            } else if (error.statusText && error.statusText !== 'Unknown Error') {
              errorMessage = error.statusText;
            }
          }
  
          this.error = errorMessage;
          this.showError(errorMessage);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
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
