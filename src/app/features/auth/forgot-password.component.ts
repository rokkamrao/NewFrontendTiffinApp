import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <!-- Logo -->
        <div class="logo">
          <span class="logo-icon">🍱</span>
        </div>

        <!-- Title -->
        <h1 class="title">Reset Password</h1>
        <p class="subtitle">Enter your phone number to reset your password</p>

        <!-- Success Message -->
        <div class="success-message" *ngIf="successMessage">
          <span class="icon">✓</span>
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div class="error-message" *ngIf="errorMessage">
          <span class="icon">✗</span>
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!otpSent">
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              placeholder="Enter your 10-digit phone number"
              maxlength="10"
            />
            <div class="error" *ngIf="form.get('phone')?.touched && form.get('phone')?.invalid">
              <span *ngIf="form.get('phone')?.errors?.['required']">Phone number is required</span>
              <span *ngIf="form.get('phone')?.errors?.['pattern']">Please enter a valid 10-digit phone number</span>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="submitting || form.invalid">
            <span *ngIf="!submitting">Send OTP</span>
            <span *ngIf="submitting">Sending...</span>
          </button>

          <div class="back-to-login">
            <a routerLink="/auth/login">← Back to Login</a>
          </div>
        </form>

        <!-- OTP & New Password Form -->
        <form [formGroup]="resetForm" (ngSubmit)="resetPassword()" *ngIf="otpSent">
          <div class="form-group">
            <label for="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              formControlName="otp"
              placeholder="Enter 6-digit OTP"
              maxlength="6"
            />
            <div class="error" *ngIf="resetForm.get('otp')?.touched && resetForm.get('otp')?.invalid">
              <span *ngIf="resetForm.get('otp')?.errors?.['required']">OTP is required</span>
              <span *ngIf="resetForm.get('otp')?.errors?.['pattern']">OTP must be 6 digits</span>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <div class="password-input">
              <input
                [type]="passwordVisible ? 'text' : 'password'"
                id="newPassword"
                formControlName="newPassword"
                placeholder="Enter new password"
              />
              <button type="button" class="toggle-password" (click)="passwordVisible = !passwordVisible">
                {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="error" *ngIf="resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.invalid">
              <span *ngIf="resetForm.get('newPassword')?.errors?.['required']">Password is required</span>
              <span *ngIf="resetForm.get('newPassword')?.errors?.['minlength']">Password must be at least 8 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="password-input">
              <input
                [type]="confirmVisible ? 'text' : 'password'"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Confirm new password"
              />
              <button type="button" class="toggle-password" (click)="confirmVisible = !confirmVisible">
                {{ confirmVisible ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="error" *ngIf="resetForm.get('confirmPassword')?.touched && resetForm.get('confirmPassword')?.invalid">
              <span *ngIf="resetForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
            </div>
            <div class="error" *ngIf="resetForm.errors?.['mismatch'] && resetForm.get('confirmPassword')?.touched">
              Passwords do not match
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="submitting || resetForm.invalid">
            <span *ngIf="!submitting">Reset Password</span>
            <span *ngIf="submitting">Resetting...</span>
          </button>

          <div class="back-to-login">
            <a (click)="startOver()">← Start Over</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      padding: 20px;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 100%;
      animation: slideUp 0.3s ease-out;
    }

    @media (min-width: 576px) {
      .card {
        max-width: 450px;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon {
      font-size: 32px;
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
      color: #1e1e1e;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 32px;
      font-size: 14px;
    }

    .success-message {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .success-message .icon {
      font-weight: bold;
      font-size: 18px;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .error-message .icon {
      font-weight: bold;
      font-size: 18px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
    }

    input::placeholder {
      color: #999;
    }

    .password-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input input {
      padding-right: 50px;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      padding: 4px 8px;
      color: #666;
    }

    .toggle-password:hover {
      color: #333;
    }

    .error {
      color: #c62828;
      font-size: 13px;
      margin-top: 6px;
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .back-to-login {
      text-align: center;
      margin-top: 20px;
    }

    .back-to-login a {
      color: #FF9800;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }

    .back-to-login a:hover {
      color: #F57C00;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .card {
        padding: 30px 20px;
      }

      .title {
        font-size: 24px;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  submitting = false;
  errorMessage = '';
  successMessage = '';
  otpSent = false;
  passwordVisible = false;
  confirmVisible = false;
  phoneNumber = '';

  form = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  });

  resetForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(group: any) {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.phoneNumber = this.form.value.phone!;

    // Call backend API to send OTP
    this.authService.sendPasswordResetOtp(this.phoneNumber).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.otpSent = true;
          this.successMessage = 'OTP sent successfully! Please check your phone.';
        } else {
          this.errorMessage = response.message || 'Failed to send OTP. Please try again.';
        }
      },
      error: (error) => {
        this.submitting = false;
        if (error.status === 404) {
          this.errorMessage = 'Phone number not registered. Please sign up first.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to send OTP. Please try again.';
        }
      }
    });
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      phone: this.phoneNumber,
      otp: this.resetForm.value.otp!,
      newPassword: this.resetForm.value.newPassword!
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.successMessage = 'Password reset successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to reset password. Please try again.';
        }
      },
      error: (error) => {
        this.submitting = false;
        if (error.status === 400) {
          this.errorMessage = 'Invalid or expired OTP. Please try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        }
      }
    });
  }

  startOver() {
    this.otpSent = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm.reset();
  }
}
