import { Component, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  submitting = false;
  errorMessage = '';
  returnUrl: string = '/home';
  pincodeMessage: { type: 'success'|'error'|null; text: string } = { type: null, text: '' };
  passwordVisible = false;
  confirmVisible = false;

  dietaryOptions = [
    { key: 'veg', label: 'Vegetarian', icon: '🌿' },
    { key: 'nonveg', label: 'Non-Vegetarian', icon: '🍗' },
    { key: 'vegan', label: 'Vegan', icon: '🥬' },
    { key: 'jain', label: 'Jain', icon: '🙏' },
    { key: 'glutenfree', label: 'Gluten-Free', icon: '🌾' },
  ];

  allergyOptions = ['Dairy','Nuts','Eggs','Soy','Shellfish','Fish'];

  // Validators as methods (available before form initialization)
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const v: string = (control.value as string) || '';
    const ok = /[A-Z]/.test(v) && /\d/.test(v) && /[^\w\s]/.test(v);
    return ok ? null : { weak: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value as string;
    const c = group.get('confirm')?.value as string;
    return p && c && p === c ? null : { mismatch: true };
  }

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    email: ['', [Validators.email]],
    dietary: this.fb.array<string>([], { validators: [Validators.required] }),
    allergies: this.fb.group({
      Dairy: [false], Nuts: [false], Eggs: [false], Soy: [false], Shellfish: [false], Fish: [false], Other: [false],
      otherText: ['']
    }),
    address: this.fb.group({
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      city: [{ value: '', disabled: true }],
      area: ['', Validators.required]
    }),
    password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator.bind(this)]],
    confirm: ['', [Validators.required]],
    referral: [''],
    terms: [false, Validators.requiredTrue],
    newsletter: [false]
  }, { validators: [this.passwordMatchValidator.bind(this)] });

  constructor() {
    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  ngOnInit(): void {
    console.log('[Signup] ngOnInit - Checking if user is already logged in');
    
    // Only perform authentication check in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      const isAuthenticated = this.authService.isLoggedIn();
      console.log('[Signup] Authentication status:', isAuthenticated);
      
      if (isAuthenticated) {
        console.log('[Signup] User already logged in, redirecting to:', this.returnUrl);
        // User is already logged in, redirect them away from signup page
        this.router.navigate([this.returnUrl]);
        return;
      }
      
      console.log('[Signup] User not authenticated, showing signup form');
    } else {
      console.log('[Signup] SSR detected, skipping auth check');
    }
  }

  get dietaryArray() { return this.form.get('dietary') as FormArray; }

  toggleDietary(key: string) {
    const idx = this.dietaryArray.value.indexOf(key);
    if (idx > -1) {
      this.dietaryArray.removeAt(idx);
    } else {
      this.dietaryArray.push(this.fb.control(key));
    }
  }

  isDietarySelected(key: string) {
    return this.dietaryArray.value.includes(key);
  }

  onPincodeInput() {
    const pincode = this.form.get('address.pincode')!.value as string;
    this.pincodeMessage = { type: null, text: '' };
    if (/^\d{6}$/.test(pincode)) {
      // Mock serviceability: 500xxx serviceable as Hyderabad
      if (pincode.startsWith('500')) {
        this.form.get('address.city')!.setValue('Hyderabad');
        this.form.get('address.area')!.setValue('');
        (this.form.get('address.city')!).enable({ emitEvent: false });
        this.pincodeMessage = { type: 'success', text: '✓ Great! We deliver to your area' };
      } else {
        this.form.get('address.city')!.setValue('');
        (this.form.get('address.city')!).disable({ emitEvent: false });
        this.pincodeMessage = { type: 'error', text: "Sorry, we don't deliver here yet. Notify Me" };
      }
    } else {
      this.form.get('address.city')!.setValue('');
      (this.form.get('address.city')!).disable({ emitEvent: false });
    }
  }

  getAreas(): string[] {
    const pin = this.form.get('address.pincode')!.value as string;
    if (pin?.startsWith('500')) {
      return ['Banjara Hills','Hitech City','Gachibowli','Madhapur','Kondapur'];
    }
    return [];
  }

  strengthLevel(): 'weak'|'medium'|'strong'|null {
    const v = this.form.get('password')!.value as string;
    if (!v) return null;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^\w\s]/.test(v)) score++;
    if (score <= 2) return 'weak';
    if (score === 3) return 'medium';
    return 'strong';
  }

  async submit() {
    console.log('[SignupComponent] submit() - Form submission started');
    
    if (this.form.invalid) {
      console.warn('[SignupComponent] Form is invalid:', this.form.errors);
      this.form.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    this.errorMessage = '';
    const formValue = this.form.getRawValue();
    console.log('[SignupComponent] Form values:', { ...formValue, password: '***', confirm: '***' });
    
    // Prepare allergies array from checkboxes
    const allergiesGroup = formValue.allergies as any;
    const selectedAllergies: string[] = [];
    Object.keys(allergiesGroup).forEach(key => {
      if (key !== 'otherText' && allergiesGroup[key] === true) {
        selectedAllergies.push(key);
      }
    });
    if (allergiesGroup.Other && allergiesGroup.otherText) {
      selectedAllergies.push(allergiesGroup.otherText);
    }
    console.log('[SignupComponent] Selected allergies:', selectedAllergies);

    // Prepare registration request
    const registerRequest = {
      phone: formValue.phone as string,
      password: formValue.password as string,
      name: formValue.fullName as string,
      email: formValue.email as string,
      dietary: formValue.dietary as string[],
      allergies: selectedAllergies,
      address: {
        pincode: formValue.address?.pincode,
        city: formValue.address?.city,
        area: formValue.address?.area
      }
    };
    console.log('[SignupComponent] Registration request:', { ...registerRequest, password: '***' });

    // Call backend register API
    console.log('[SignupComponent] Calling authService.register()...');
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('[SignupComponent] Registration response:', response);
        this.submitting = false;
        if (response.success) {
          // Registration successful, navigate to return URL or home
          console.log('[SignupComponent] ✓ Registration successful, navigating to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        } else {
          // Show error message
          console.error('[SignupComponent] ✗ Registration failed:', response.message);
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error) => {
        this.submitting = false;
        console.error('[SignupComponent] ✗ Registration error:', error);
        
        // Handle different types of errors
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 409) {
          this.errorMessage = 'This phone number is already registered. Please login instead.';
          console.warn('[SignupComponent] Duplicate phone number detected');
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid registration data. Please check your inputs.';
        } else if (error.status === 404) {
          this.errorMessage = 'Registration service not found. Please contact support.';
        } else if (error.status === 500) {
          this.errorMessage = error.error?.message || 'Server error occurred. Please try again later or contact support.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Registration failed (Error ${error.status}). Please try again or contact support.`;
        }
        console.error('[SignupComponent] Error message displayed:', this.errorMessage);
      }
    });
  }
}
