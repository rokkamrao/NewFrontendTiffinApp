import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DecimalPipe],
  templateUrl: './floating-cart.component.html'
})
export class FloatingCartComponent implements OnInit {
  total = 0;
  itemsCount = 0;

  constructor(private cart: CartService) {}

  ngOnInit(){
    this.cart.items$.subscribe(items => {
      this.itemsCount = items.reduce((s,i)=>s+i.qty,0);
      this.total = items.reduce((s,i)=>s + i.dish.price * i.qty, 0);
    });
  }
}
