import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
    <div class="w-full max-w-md bg-white rounded-xl shadow p-6">
      <h2 class="text-xl font-semibold">Welcome — set up your profile</h2>
      <p class="text-sm text-gray-500 mt-1">A few details to personalize your meals</p>

      <div class="mt-4">
        <label class="block text-xs text-gray-600">Full name</label>
        <input [(ngModel)]="model.name" class="w-full px-4 py-3 border rounded-lg mt-1" placeholder="Your name" />
      </div>

      <div class="mt-4">
        <label class="block text-xs text-gray-600">Dietary preference</label>
        <select [(ngModel)]="model.dietary" class="w-full px-4 py-3 border rounded-lg mt-1">
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
          <option value="Vegan">Vegan</option>
          <option value="Jain">Jain</option>
        </select>
      </div>

      <div class="mt-6">
        <button (click)="save()" class="w-full py-3 rounded-lg bg-[var(--color-healthy-green)] text-white font-medium">Save & Continue</button>
      </div>
    </div>
  </div>
  `
})
export class ProfileSetupComponent{
  model: Partial<UserProfile> = {};
  constructor(private auth: AuthService, private router: Router){
    const u = this.auth.getUser(); if(u) this.model = { name: u.name, dietary: u.dietary };
  }

  save(){
    this.auth.updateUser({ name: this.model.name, dietary: this.model.dietary });
    this.router.navigate(['/dashboard']);
  }
}
