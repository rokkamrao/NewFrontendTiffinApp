import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-menu-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-detail.component.html'
})
export class MenuDetailComponent{
  dish: any;
  quantity = 1;
  constructor(route: ActivatedRoute, ms: MenuService, private cart: CartService){
    const id = route.snapshot.paramMap.get('id') || '';
    ms.get(id).subscribe(d=> this.dish = d);
  }
  increaseQty(){ this.quantity++; }
  decreaseQty(){ if(this.quantity > 1) this.quantity--; }
  add(){ this.cart.add({ dish: this.dish, qty: this.quantity }); }
}
