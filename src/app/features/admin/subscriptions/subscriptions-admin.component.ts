import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Subscriptions</h2>
    <div class="card">Manage daily/weekly/monthly meal plans. Table placeholder.</div>
  </div>
  `,
  styles: [`.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}`]
})
export class AdminSubscriptionsComponent {}
