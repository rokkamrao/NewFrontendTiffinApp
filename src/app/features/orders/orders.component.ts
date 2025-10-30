import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent{
  orders$: Observable<Order[]>;
  constructor(private os: OrderService){
    this.orders$ = this.os.list();
  }
}
