import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-delivery',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Delivery Management</h2>
    <div class="card">Zone & route planning, live driver tracking. Map/table placeholder.</div>
  </div>
  `,
  styles: [`.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}`]
})
export class AdminDeliveryComponent {}
