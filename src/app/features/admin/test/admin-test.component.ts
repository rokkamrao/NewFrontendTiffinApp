import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-test',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="alert alert-success">
        <h2>✅ Admin Panel is Working!</h2>
        <p>If you can see this page, the admin routing is working correctly.</p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3>Admin Routes Test</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h5>Quick Navigation</h5>
              <div class="list-group">
                <a routerLink="/admin/dashboard" class="list-group-item list-group-item-action">
                  📊 Dashboard
                </a>
                <a routerLink="/admin/orders" class="list-group-item list-group-item-action">
                  📦 Orders
                </a>
                <a routerLink="/admin/menu" class="list-group-item list-group-item-action">
                  📋 Menu Management
                </a>
                <a routerLink="/admin/delivery/tracking" class="list-group-item list-group-item-action">
                  🚚 Delivery Tracking
                </a>
                <a routerLink="/admin/analytics" class="list-group-item list-group-item-action">
                  📈 Analytics
                </a>
              </div>
            </div>
            <div class="col-md-6">
              <h5>System Status</h5>
              <div class="card bg-light">
                <div class="card-body">
                  <p><strong>Angular Version:</strong> 20.3.6</p>
                  <p><strong>Current Time:</strong> {{ currentTime }}</p>
                  <p><strong>Admin Panel:</strong> <span class="badge bg-success">Active</span></p>
                  <p><strong>Routing:</strong> <span class="badge bg-success">Working</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
    .list-group-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class AdminTestComponent {
  currentTime = new Date().toLocaleString();

  constructor() {
    console.log('AdminTestComponent loaded successfully!');
  }
}