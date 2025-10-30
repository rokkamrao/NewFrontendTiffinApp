import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dish-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <button class="btn btn-link text-decoration-none p-0 mb-3" (click)="goBack()">
        <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
      </button>
      <h2 class="fw-bold">Dish Management</h2>
      <p class="text-muted">Coming soon...</p>
    </div>
  `
})
export class DishManagementComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/admin']);
  }
}
