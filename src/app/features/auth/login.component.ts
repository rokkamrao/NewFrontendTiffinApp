import { Component, PLATFORM_ID, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

interface OtpStepState {
  step: 'phone' | 'otp';
  phone: string;
  otp: string;
  isLoading: boolean;
  errorMessage: string;
  otpSent: boolean;
  resendCooldown: number;
  canResend: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  state: OtpStepState = {
    step: 'phone',
    phone: '',
    otp: '',
    isLoading: false,
    errorMessage: '',
    otpSent: false,
    resendCooldown: 0,
    canResend: false
  };

  returnUrl: string = '/home'; // Public for template access
  private platformId = inject(PLATFORM_ID);
  private resendTimer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    console.log('[Login] Constructor - Return URL from query params:', this.route.snapshot.queryParams['returnUrl']);
    console.log('[Login] Constructor - Final return URL:', this.returnUrl);
    console.log('[Login] Constructor - Full query params:', this.route.snapshot.queryParams);
  }

  ngOnDestroy() {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  validatePhone(): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!this.state.phone) {
      this.state.errorMessage = 'Please enter your phone number';
      return false;
    }
    
    if (!phoneRegex.test(this.state.phone)) {
      this.state.errorMessage = 'Please enter a valid 10-digit phone number starting with 6-9';
      return false;
    }
    
    this.state.errorMessage = '';
    return true;
  }

  validateOtp(): boolean {
    if (!this.state.otp) {
      this.state.errorMessage = 'Please enter the OTP';
      return false;
    }

    if (this.state.otp.length !== 6) {
      this.state.errorMessage = 'OTP must be 6 digits';
      return false;
    }

    if (!/^\d{6}$/.test(this.state.otp)) {
      this.state.errorMessage = 'OTP must contain only numbers';
      return false;
    }
    
    this.state.errorMessage = '';
    return true;
  }

  async sendOtp() {
    if (!this.validatePhone()) {
      return;
    }

    this.state.isLoading = true;
    this.state.errorMessage = '';

    console.log('[Login] Attempting to send OTP to phone:', this.state.phone);
    console.log('[Login] Current return URL:', this.returnUrl);

    this.authService.sendOtp({ phone: this.state.phone }).subscribe({
      next: (response) => {
        this.state.isLoading = false;
        console.log('[Login] Send OTP response received:', response);
        if (response.success) {
          this.state.step = 'otp';
          this.state.otpSent = true;
          this.startResendCooldown();
          console.log('[Login] OTP sent successfully, moved to OTP step');
        } else {
          console.error('[Login] Send OTP failed:', response.message);
          this.state.errorMessage = response.message || 'Failed to send OTP. Please try again.';
        }
      },
      error: (error) => {
        this.state.isLoading = false;
        console.error('[Login] Send OTP error:', error);
        console.error('[Login] Error details - Status:', error.status, 'Message:', error.message);
        console.error('[Login] Error body:', error.error);
        
        if (error.status === 0) {
          this.state.errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8080.';
        } else if (error.status === 429) {
          this.state.errorMessage = 'Too many requests. Please wait before trying again.';
        } else if (error.status === 500) {
          this.state.errorMessage = error.error?.message || 'Server error occurred. Please try again later.';
        } else if (error.error?.message) {
          this.state.errorMessage = error.error.message;
        } else {
          this.state.errorMessage = `Failed to send OTP (Error ${error.status}). Please try again.`;
        }
      }
    });
  }

  async verifyOtp() {
    if (!this.validateOtp()) {
      return;
    }

    this.state.isLoading = true;
    this.state.errorMessage = '';

    console.log('[Login] Attempting to verify OTP:', this.state.otp, 'for phone:', this.state.phone);
    console.log('[Login] Current return URL:', this.returnUrl);

    this.authService.verifyOtp({ phone: this.state.phone, otp: this.state.otp }).subscribe({
      next: (response) => {
        this.state.isLoading = false;
        console.log('[Login] Verify OTP response received:', response);
        if (response.success) {
          console.log('[Login] OTP verified successfully, redirecting to:', this.returnUrl);
          
          // Handle new user flow if needed
          if (response.isNewUser) {
            console.log('[Login] New user detected, might need profile setup');
          }
          
          // Navigate to return URL
          console.log('[Login] Navigating to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        } else {
          console.error('[Login] Verify OTP failed:', response.message);
          this.state.errorMessage = response.message || 'Invalid OTP. Please try again.';
        }
      },
      error: (error) => {
        this.state.isLoading = false;
        console.error('[Login] Verify OTP error:', error);
        console.error('[Login] Error details - Status:', error.status, 'Message:', error.message);
        console.error('[Login] Error body:', error.error);
        
        if (error.status === 0) {
          this.state.errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8080.';
        } else if (error.status === 401) {
          this.state.errorMessage = 'Invalid or expired OTP. Please try again.';
        } else if (error.status === 429) {
          this.state.errorMessage = 'Too many attempts. Please wait before trying again.';
        } else if (error.status === 500) {
          this.state.errorMessage = error.error?.message || 'Server error occurred. Please try again later.';
        } else if (error.error?.message) {
          this.state.errorMessage = error.error.message;
        } else {
          this.state.errorMessage = `OTP verification failed (Error ${error.status}). Please try again.`;
        }
      }
    });
  }

  async resendOtp() {
    if (!this.state.canResend) {
      return;
    }

    this.state.isLoading = true;
    this.state.errorMessage = '';

    this.authService.sendOtp({ phone: this.state.phone }).subscribe({
      next: (response) => {
        this.state.isLoading = false;
        if (response.success) {
          this.state.otp = ''; // Clear previous OTP
          this.startResendCooldown();
          console.log('[Login] OTP resent successfully');
        } else {
          this.state.errorMessage = response.message || 'Failed to resend OTP. Please try again.';
        }
      },
      error: (error) => {
        this.state.isLoading = false;
        console.error('[Login] Resend OTP error:', error);
        this.state.errorMessage = error.error?.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }

  startResendCooldown() {
    this.state.resendCooldown = 30; // 30 seconds cooldown
    this.state.canResend = false;
    
    this.resendTimer = setInterval(() => {
      this.state.resendCooldown--;
      if (this.state.resendCooldown <= 0) {
        this.state.canResend = true;
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  async loginWithGoogle() {
    try {
      // This would integrate with Google Sign-In SDK
      const credential = await this.authService.signInWithGoogle();
      
      if (credential) {
        this.state.isLoading = true;
        this.state.errorMessage = '';

        this.authService.googleSignIn({ token: credential }).subscribe({
          next: (response) => {
            this.state.isLoading = false;
            if (response.success) {
              console.log('[Login] Google Sign-In successful, redirecting to:', this.returnUrl);
              
              // Handle new user flow if needed
              if (response.isNewUser) {
                console.log('[Login] New Google user detected');
              }
              
              this.router.navigate([this.returnUrl]);
            } else {
              this.state.errorMessage = response.message || 'Google Sign-In failed. Please try again.';
            }
          },
          error: (error) => {
            this.state.isLoading = false;
            console.error('[Login] Google Sign-In error:', error);
            this.state.errorMessage = error.error?.message || 'Google Sign-In failed. Please try again.';
          }
        });
      }
    } catch (error) {
      console.error('[Login] Google Sign-In SDK error:', error);
      this.state.errorMessage = 'Google Sign-In is not available. Please use phone login.';
    }
  }

  onInputChange() {
    // Clear error when user types
    if (this.state.errorMessage) {
      this.state.errorMessage = '';
    }
  }

  editPhoneNumber() {
    this.state.step = 'phone';
    this.state.otp = '';
    this.state.otpSent = false;
    this.state.errorMessage = '';
    this.state.canResend = false;
    this.state.resendCooldown = 0;
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  navigateToSignup() {
    // Pass return URL to signup page if exists
    if (this.returnUrl !== '/home') {
      this.router.navigate(['/auth/signup'], {
        queryParams: { returnUrl: this.returnUrl }
      });
    } else {
      this.router.navigate(['/auth/signup']);
    }
  }

  navigateToAdminLogin() {
    this.router.navigate(['/auth/admin-login']);
  }

  navigateToDeliveryLogin() {
    this.router.navigate(['/auth/delivery-login']);
  }
}
