import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DietaryPreference {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css']
})
export class ProfileSetupComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;
  
  // Step 1: Basic Info
  name: string = '';
  email: string = '';
  nameError: string = '';
  emailError: string = '';
  
  // Step 2: Dietary Preferences
  dietaryPreferences: DietaryPreference[] = [
    { id: 'veg', name: 'Vegetarian', icon: '🥗', selected: false },
    { id: 'non-veg', name: 'Non-Vegetarian', icon: '🍗', selected: false },
    { id: 'vegan', name: 'Vegan', icon: '🌱', selected: false },
    { id: 'jain', name: 'Jain', icon: '🍛', selected: false },
    { id: 'gluten-free', name: 'Gluten-Free', icon: '🌾', selected: false },
    { id: 'keto', name: 'Keto', icon: '🥑', selected: false },
    { id: 'high-protein', name: 'High Protein', icon: '💪', selected: false },
    { id: 'low-carb', name: 'Low Carb', icon: '🥦', selected: false }
  ];
  
  // Step 3: Address
  addressLine1: string = '';
  addressLine2: string = '';
  city: string = '';
  pincode: string = '';
  addressType: 'home' | 'work' | 'other' = 'home';
  
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if user is logged in
    const phoneNumber = localStorage.getItem('userPhone');
    if (!phoneNumber) {
      this.router.navigate(['/auth/login']);
    }
  }

  validateStep1(): boolean {
    let isValid = true;

    if (!this.name.trim()) {
      this.nameError = 'Please enter your name';
      isValid = false;
    } else {
      this.nameError = '';
    }

    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    } else {
      this.emailError = '';
    }

    return isValid;
  }

  validateStep2(): boolean {
    return this.dietaryPreferences.some(pref => pref.selected);
  }

  validateStep3(): boolean {
    return !!(this.addressLine1.trim() && this.city.trim() && this.pincode.trim() && /^\d{6}$/.test(this.pincode));
  }

  togglePreference(preference: DietaryPreference) {
    preference.selected = !preference.selected;
  }

  nextStep() {
    if (this.currentStep === 1 && !this.validateStep1()) {
      return;
    }

    if (this.currentStep === 2 && !this.validateStep2()) {
      alert('Please select at least one dietary preference');
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  skip() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.completeSetup();
    }
  }

  async completeSetup() {
    if (!this.validateStep3()) {
      alert('Please fill in all required address fields');
      return;
    }

    this.isLoading = true;

    const userProfile = {
      name: this.name,
      email: this.email,
      phone: localStorage.getItem('userPhone'),
      dietaryPreferences: this.dietaryPreferences.filter(p => p.selected).map(p => p.id),
      addresses: [{
        line1: this.addressLine1,
        line2: this.addressLine2,
        city: this.city,
        pincode: this.pincode,
        type: this.addressType,
        isDefault: true
      }],
      createdAt: new Date().toISOString()
    };

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      localStorage.setItem('isLoggedIn', 'true');
      this.isLoading = false;
      this.router.navigate(['/home']);
    }, 1500);
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
