import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent{
  notifications: any[] = [
    { type: 'order', title: 'Order Confirmed', message: 'Your order #1234 has been confirmed', time: '2 mins ago', read: false },
    { type: 'delivery', title: 'Out for Delivery', message: 'Your meal is on the way!', time: '1 hour ago', read: false },
    { type: 'promo', title: 'Special Offer', message: 'Get 20% off on your next subscription', time: '3 hours ago', read: true },
    { type: 'reminder', title: 'Meal Reminder', message: 'Your lunch will be delivered at 12 PM', time: 'Yesterday', read: true }
  ];
  constructor(private ns: NotificationService){}
}
