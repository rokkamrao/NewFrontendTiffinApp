import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dish } from '../../core/models/dish.model';
import { CartService, CartItem } from '../../core/services/cart.service';
import { MenuService } from '../../core/services/menu.service';
import { ImageService } from '../../core/services/image.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit {
  dishes: Dish[] = [];
  filteredDishList: Dish[] = [];
  quantities: { [id:string]: number } = {};
  searchTerm: string = '';
  selectedDiet: 'all' | 'veg' | 'non-veg' = 'all';
  selectedPriceRange: string = 'any';
  selectedTags: string[] = [];

  constructor(
    private cart: CartService, 
    private menu: MenuService,
    public imageService: ImageService
  ) {}

  ngOnInit(){
    this.menu.list().subscribe(dishes => {
      this.dishes = dishes;
      this.filteredDishList = dishes;
      // Initialize quantities from cart
      this.cart.getItems().forEach((item: CartItem) => {
        this.quantities[item.dish.id] = item.qty;
      });
    });
  }

  getDishImage(dish: Dish): string {
    // If dish has imageUrl from backend, use it
    if (dish.imageUrl) {
      return dish.imageUrl;
    }
    
    // Otherwise, try to get from uploaded images or use default
    const dishId = dish.name.toLowerCase().replace(/\s+/g, '-');
    return this.imageService.getDishImage(dishId);
  }

  addToCart(dish: Dish){
    this.quantities[dish.id] = (this.quantities[dish.id] || 0) + 1;
    this.cart.add({ dish, qty:1 });
  }

  decreaseQty(dish: Dish){
    if(!(this.quantities[dish.id] > 0)) return;
    this.quantities[dish.id]--;
    if(this.quantities[dish.id] === 0) this.cart.remove(dish.id);
    else this.cart.updateQty(dish.id, this.quantities[dish.id]);
  }

  getTotalItems(): number {
    return Object.values(this.quantities).reduce((sum, qty) => sum + qty, 0);
  }

  getTotalAmount(): number {
    return Object.entries(this.quantities).reduce((sum, [dishId, qty]) => {
      const dish = this.dishes.find(d => d.id === dishId);
      return sum + (dish ? dish.price * qty : 0);
    }, 0);
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredDishList = this.dishes.filter(d => {
      if (this.selectedDiet !== 'all' && d.type !== this.selectedDiet) return false;
      if (term && !(d.name.toLowerCase().includes(term) || (d.description||'').toLowerCase().includes(term))) return false;
      if (this.selectedTags.length && !this.selectedTags.every(t => d.tags.map(x=>x.toLowerCase()).includes(t.toLowerCase()))) return false;
      if (this.selectedPriceRange !== 'any'){
        const price = d.price;
        if (this.selectedPriceRange === 'under100' && !(price < 100)) return false;
        if (this.selectedPriceRange === '100to150' && !(price >= 100 && price <= 150)) return false;
        if (this.selectedPriceRange === '150plus' && !(price > 150)) return false;
      }
      return true;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDiet = 'all';
    this.selectedPriceRange = 'any';
    this.selectedTags = [];
    this.applyFilters();
  }
}
