import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dish } from '../models/dish.model';

export interface CartItem {
  dish: Dish;
  qty: number;
  addons?: any[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private STORAGE_KEY = 'tk_cart_v1';
  private _items = new BehaviorSubject<CartItem[]>([]);
  items$ = this._items.asObservable();

  add(item: CartItem){
    const items = this._items.value.slice();
    const idx = items.findIndex(i => i.dish.id === item.dish.id);
    if (idx >= 0) items[idx].qty += item.qty;
    else items.push(item);
    this._items.next(items);
    this.save();
  }

  updateQty(dishId: string, qty: number){
    const items = this._items.value.map(i => i.dish.id === dishId ? { ...i, qty } : i);
    this._items.next(items);
    this.save();
  }

  remove(dishId: string){
    const items = this._items.value.filter(i => i.dish.id !== dishId);
    this._items.next(items);
    this.save();
  }

  clear(){
    this._items.next([]);
    this.save();
  }

  getTotal(){
    return this._items.value.reduce((s, i) => s + i.dish.price * i.qty, 0);
  }

  getItems(): CartItem[] {
    return this._items.value;
  }

  private save(){
    try { if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items.value)); }
    catch(e){ console.warn('Failed to persist cart', e); }
  }

  private load(){
    try{
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined'){
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if(raw) this._items.next(JSON.parse(raw));
      }
    }catch(e){ console.warn('Failed to load cart', e); }
  }

  constructor(){ this.load(); }
}
