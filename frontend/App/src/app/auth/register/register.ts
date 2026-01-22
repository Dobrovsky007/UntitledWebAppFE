import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, RegisterRequest } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;
  hidePassword = true;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;

      const { username, email, password } = this.registerForm.value;

      this.authService.register({ username, email, password }).subscribe({
        next: (response) => {
          this.loading = false;
          this.showSuccess('Registration successful! Please check your email to verify your account before logging in.');
          // Show additional information about email verification
          setTimeout(() => {
            this.snackBar.open(
              '📧 Verification email sent! Check your inbox and spam folder.',
              'Got it',
              {
                duration: 8000,
                panelClass: ['info-snackbar']
              }
            );
          }, 3500);
          
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 8000);
        },
        error: (error) => {
          this.loading = false;
          // Better error handling for registration
          let errorMessage = 'Registration failed';
          
          // Handle HTTP parsing errors specifically
          if (error.name === 'HttpErrorResponse' && error.message.includes('parsing')) {
            errorMessage = 'Server returned invalid response. Please try again.';
          }
          else if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
          } else if (error.status === 409) {
            errorMessage = 'Username or email already exists';
          } else if (error.status === 400) {
            errorMessage = 'Invalid registration data';
          } else if (error.status === 0) {
            errorMessage = 'Cannot connect to server. Please check your connection.';
          }
          
          this.error = errorMessage;
          this.showError(errorMessage);
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    // Prevent showing raw JSON error objects
    let displayMessage = message;
    
    // Check if message looks like JSON or contains technical details
    if (message.includes('{') || message.includes('timestamp') || message.includes('path')) {
      displayMessage = 'Registration failed. Please check all fields and try again.';
    }
    
    this.snackBar.open(displayMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
