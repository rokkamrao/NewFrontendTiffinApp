import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Menu & Meal Plan</h2>
    <div class="card">Add/edit dishes, ingredients, pricing. Scheduler placeholder.</div>
  </div>
  `,
  styles: [`.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}`]
})
export class AdminMenuComponent {}
