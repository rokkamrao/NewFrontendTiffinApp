import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Analytics & Reports</h2>
    <div class="card">Revenue, retention, best/worst items. Charts placeholder.</div>
  </div>
  `,
  styles: [`.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}`]
})
export class AdminAnalyticsComponent {}
