import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;
  error: string | null = null;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder, 
    private auth: Auth,
    private router: Router
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
      const requestData = { username, email, password };
      
      this.auth.register(requestData).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.status === 400) {
            this.error = 'Registration failed. Please check your input or try a different username/email.';
          } else {
            this.error = err.error?.message || 'Registration failed';
          }
          this.loading = false;
        }
      });
    }
  }
}
