import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthService, UserProfile } from '../../core/services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './account.component.html'
})
export class AccountComponent{
  user: UserProfile | null = null;
  private platformId = inject(PLATFORM_ID);
  private fallbackPhone: string | null = null;
  private fb = inject(FormBuilder);
  
  editMode = false;
  
  dietaryOptions = [
    { key: 'veg', label: 'Vegetarian', icon: '🌿' },
    { key: 'nonveg', label: 'Non-Vegetarian', icon: '🍗' },
    { key: 'vegan', label: 'Vegan', icon: '🥬' },
    { key: 'jain', label: 'Jain', icon: '🙏' },
    { key: 'glutenfree', label: 'Gluten-Free', icon: '🌾' },
  ];
  
  allergyOptions = ['Dairy','Nuts','Eggs','Soy','Shellfish','Fish'];
  
  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    dietary: this.fb.array<string>([]),
    allergies: this.fb.group({
      Dairy: [false], 
      Nuts: [false], 
      Eggs: [false], 
      Soy: [false], 
      Shellfish: [false], 
      Fish: [false]
    })
  });
  
  constructor(private auth: AuthService, private router: Router){ 
    // Check if user is authenticated using proper authentication check
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('authToken');
      const user = this.auth.getUser();
      
      // If no token and no user, redirect to login
      if (!authToken && !user) {
        console.log('[Account] No authentication found, redirecting to login');
        this.router.navigate(['/auth/login']);
        return;
      }
      
      // Store fallback phone for display purposes
      this.fallbackPhone = user?.phone || localStorage.getItem('userPhone');
    }

    this.user = this.auth.getUser();
    console.log('[Account] User loaded:', this.user);
    this.populateForm();
  }
  
  get dietaryArray() { 
    return this.profileForm.get('dietary') as FormArray; 
  }
  
  populateForm() {
    if (!this.user) return;
    
    this.profileForm.patchValue({
      fullName: this.user.fullName || this.user.name || '',
      email: this.user.email || ''
    });
    
    // Populate dietary preferences
    if (this.user.dietary) {
      const dietaryList = Array.isArray(this.user.dietary) ? this.user.dietary : [this.user.dietary];
      dietaryList.forEach(d => {
        if (!this.dietaryArray.value.includes(d)) {
          this.dietaryArray.push(this.fb.control(d));
        }
      });
    }
    
    // Populate allergies
    if (this.user.allergies) {
      const allergiesGroup = this.profileForm.get('allergies');
      if (typeof this.user.allergies === 'object') {
        Object.keys(this.user.allergies).forEach(key => {
          if (this.allergyOptions.includes(key) && this.user?.allergies[key]) {
            allergiesGroup?.get(key)?.setValue(true);
          }
        });
      }
    }
  }
  
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Cancel: repopulate form with current user data
      this.populateForm();
    }
  }
  
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
  
  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.profileForm.getRawValue();
    
    // Prepare allergies
    const allergiesGroup = formValue.allergies as any;
    const selectedAllergies: { [key: string]: boolean } = {};
    this.allergyOptions.forEach(key => {
      if (allergiesGroup[key] === true) {
        selectedAllergies[key] = true;
      }
    });
    
    const updatedProfile: Partial<UserProfile> = {
      fullName: formValue.fullName as string,
      email: formValue.email as string,
      dietary: formValue.dietary as string[],
      allergies: selectedAllergies
    };
    
    this.auth.updateUser(updatedProfile).subscribe(() => {
      this.user = this.auth.getUser();
      this.editMode = false;
      console.log('[Account] Profile updated:', this.user);
    });
  }
  
  getUserName(): string {
    if (this.user && (this.user.fullName || this.user.name)) {
      return this.user.fullName || (this.user.name as string);
    }
    // Fallback to phone if available
    if (isPlatformBrowser(this.platformId)) {
      const phone = this.fallbackPhone || localStorage.getItem('userPhone') || '';
      if (phone && phone.length === 10) {
        return `+91 ${phone.substring(0,2)}XXXXXX${phone.substring(8)}`;
      }
    }
    return 'Account';
  }

  getDietaryPreference(): string {
    if (!this.user?.dietary) return 'Not set';
    if (Array.isArray(this.user.dietary)) {
      return this.user.dietary.length > 0 ? this.user.dietary.join(', ') : 'Not set';
    }
    return this.user.dietary || 'Not set';
  }
  
  logout(){ 
    this.auth.logout(); 
    this.user = null;
    if (isPlatformBrowser(this.platformId)) {
      // Remove authentication-related items
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userPhone');
    }
    this.router.navigate(['/auth/login']);
  }
}
