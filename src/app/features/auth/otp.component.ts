import { Component, OnInit, PLATFORM_ID, inject, OnDestroy, AfterViewInit, ViewChildren, ViewChild, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class VerifyOtpComponent implements OnInit, OnDestroy, AfterViewInit {
  phoneNumber: string = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  otpError: string = '';
  isLoading: boolean = false;
  resendTimer: number = 30;
  canResend: boolean = false;
  timerInterval: any;
  private platformId = inject(PLATFORM_ID);
  
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('otpMaster') otpMaster!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) {}

  ngOnInit() {
    // Get phone number from storage
    if (isPlatformBrowser(this.platformId)) {
      this.phoneNumber = localStorage.getItem('tempPhone') || '';
      if (!this.phoneNumber) {
        this.router.navigate(['/auth/login']);
        return;
      }
      // Start resend timer
      this.startResendTimer();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Focus first input on load
      setTimeout(() => this.otpMaster?.nativeElement?.focus(), 0);
    }
  }

  onOtpChange(index: number, rawValue: string) {
    // Accept only numeric, keep last digit typed
    const v = (rawValue ?? '').replace(/\D/g, '');
    const last = v ? v[v.length - 1] : '';
    this.otpDigits[index] = last;
    this.otpError = '';
    if (isPlatformBrowser(this.platformId)) {
      // Reflect sanitized value back to input
      const input = this.otpInputs?.get(index)?.nativeElement;
      if (input) input.value = last;
    }
    // Move focus forward if a digit is present
    if (last && index < 5) {
      setTimeout(() => this.otpInputs?.get(index + 1)?.nativeElement?.focus(), 0);
    }
    // Auto-verify when all boxes are filled
    if (this.otpDigits.every(d => d && d.length === 1)) {
      this.verifyOTP();
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startResendTimer() {
    this.resendTimer = 30;
    this.canResend = false;
    
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.canResend = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  onOtpInput(index: number, event: any) {
    const value = event.target.value;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      this.otpDigits[index] = '';
      return;
    }

    this.otpDigits[index] = value;
    this.otpError = '';

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-verify when all digits entered
    if (index === 5 && value) {
      this.verifyOTP();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    // Handle backspace
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      event.preventDefault();
      // Clear previous and focus it
      this.otpDigits[index - 1] = '';
      if (isPlatformBrowser(this.platformId)) {
        const prev = this.otpInputs?.get(index - 1)?.nativeElement;
        if (prev) { prev.value = ''; prev.focus(); }
      }
      return;
    }
    // Arrow navigation
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.otpInputs?.get(index - 1)?.nativeElement?.focus();
      return;
    }
    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.otpInputs?.get(index + 1)?.nativeElement?.focus();
      return;
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') ?? '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length) {
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = digits[i] ?? '';
      }
      if (isPlatformBrowser(this.platformId)) {
        // Reflect values to inputs and focus next empty or last
        this.otpInputs?.forEach((ref, i) => ref.nativeElement.value = this.otpDigits[i] ?? '');
        const nextEmpty = this.otpDigits.findIndex(d => !d);
        const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
        setTimeout(() => this.otpInputs?.get(focusIndex)?.nativeElement?.focus(), 0);
      }
      if (this.otpDigits.every(d => d && d.length === 1)) {
        this.verifyOTP();
      }
    }
  }

  // Master-input driven implementation
  focusMaster() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.otpMaster?.nativeElement?.focus();
  }

  onMasterInput(value: string) {
    const digits = (value ?? '').replace(/\D/g, '').slice(0, 6).split('');
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = digits[i] ?? '';
    }
    // Trigger auto verify when all six digits are present
    if (this.otpDigits.every(d => d && d.length === 1)) {
      this.verifyOTP();
    }
  }

  onMasterKeydown(event: KeyboardEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = this.otpMaster?.nativeElement;
    if (!input) return;
    if (event.key === 'Backspace') {
      const current = (input.value ?? '').replace(/\D/g, '');
      if (!current) {
        // Nothing to delete
        return;
      }
      // Remove last digit
      const next = current.slice(0, -1);
      input.value = next;
      this.onMasterInput(next);
      event.preventDefault();
    }
  }

  onContainerPaste(event: ClipboardEvent) {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    this.otpMaster.nativeElement.value = digits;
    this.onMasterInput(digits);
    setTimeout(() => this.otpMaster?.nativeElement?.focus(), 0);
  }

  async verifyOTP() {
    const otp = this.otpDigits.join('');
    
    if (otp.length !== 6) {
      this.otpError = 'Please enter complete OTP';
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      
      // For demo, accept any 6-digit OTP
      if (otp === '123456' || otp.length === 6) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userPhone', this.phoneNumber);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.removeItem('tempPhone');

          // If coming from Signup, finalize the profile now and go Home
          const pending = localStorage.getItem('pendingSignup');
          if (pending) {
            try {
              const data = JSON.parse(pending);
              const profile = {
                fullName: data.fullName,
                phone: data.phone,
                email: data.email ?? '',
                dietary: Array.isArray(data.dietary) ? data.dietary : [],
                allergies: data.allergies ?? {},
                address: data.address ?? {},
                referral: data.referral ?? '',
                createdAt: new Date().toISOString()
              };
              localStorage.setItem('userProfile', JSON.stringify(profile));
            } catch {}
            localStorage.removeItem('pendingSignup');
            this.router.navigate(['/dashboard']);
            return;
          }

          // For login-only flow, just go to Dashboard
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.otpError = 'Invalid OTP. Please try again.';
        this.otpDigits = ['', '', '', '', '', ''];
        const firstInput = document.getElementById('otp-0') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 1500);
  }

  resendOTP() {
    if (!this.canResend) return;

    // Simulate resend API call
    alert('OTP resent successfully!');
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpError = '';
    this.startResendTimer();
    
    const firstInput = document.getElementById('otp-0') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  editPhoneNumber() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tempPhone');
    }
    this.router.navigate(['/auth/login']);
  }

  getMaskedPhone(): string {
    if (!this.phoneNumber || this.phoneNumber.length !== 10) {
      return '';
    }
    return `+91 ${this.phoneNumber.substring(0, 2)}XXXXXX${this.phoneNumber.substring(8)}`;
  }
}
