import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Orders</h2>
      <div class="flex gap-2">
        <input class="border rounded px-3 py-2" placeholder="Search orders" />
        <select class="border rounded px-3 py-2">
          <option>Status</option>
          <option>Pending</option>
          <option>Preparing</option>
          <option>Out for delivery</option>
          <option>Delivered</option>
        </select>
      </div>
    </div>
    <div class="card">
      <div class="text-sm text-slate-500">Orders table placeholder</div>
    </div>
  </div>
  `,
  styles: [`.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}`]
})
export class AdminOrdersComponent {}
