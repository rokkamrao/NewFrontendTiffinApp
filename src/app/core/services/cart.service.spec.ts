import { CartService, CartItem } from './cart.service';
import { Dish } from '../models/dish.model';

class FakeLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

describe('CartService', () => {
  let service: CartService;
  let fakeStorage: FakeLocalStorage;
  const dishA: Dish = {
    id: 'dish-1',
    name: 'Paneer Tikka',
    price: 120,
    tags: [],
    type: 'veg'
  };
  const dishB: Dish = {
    id: 'dish-2',
    name: 'Chicken Curry',
    price: 180,
    tags: [],
    type: 'non-veg'
  };

  beforeEach(() => {
    fakeStorage = new FakeLocalStorage();
    // Override global localStorage for deterministic tests
    Object.defineProperty(window as any, 'localStorage', {
      value: fakeStorage,
      configurable: true,
      writable: true
    });
    service = new CartService();
  });

  it('should start with empty cart by default', () => {
    expect(service.getItems().length).toBe(0);
    expect(service.getTotal()).toBe(0);
  });

  it('should add items and persist to localStorage', () => {
    service.add({ dish: dishA, qty: 2 });
    expect(service.getItems().length).toBe(1);
    expect(service.getTotal()).toBe(240);
    // Verify persisted
    const raw = fakeStorage.getItem('tk_cart_v1');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed[0].dish.id).toBe('dish-1');
    expect(parsed[0].qty).toBe(2);
  });

  it('should increment qty when adding same dish again', () => {
    service.add({ dish: dishA, qty: 1 });
    service.add({ dish: dishA, qty: 3 });
    const item = service.getItems().find(i => i.dish.id === 'dish-1')!;
    expect(item.qty).toBe(4);
  });

  it('should update quantity and persist', () => {
    service.add({ dish: dishA, qty: 1 });
    service.updateQty('dish-1', 5);
    const item = service.getItems().find(i => i.dish.id === 'dish-1')!;
    expect(item.qty).toBe(5);
    const raw = fakeStorage.getItem('tk_cart_v1');
    const parsed = JSON.parse(raw!);
    expect(parsed[0].qty).toBe(5);
  });

  it('should remove an item and persist', () => {
    service.add({ dish: dishA, qty: 1 });
    service.add({ dish: dishB, qty: 2 });
    service.remove('dish-2');
    expect(service.getItems().map(i => i.dish.id)).toEqual(['dish-1']);
    const raw = fakeStorage.getItem('tk_cart_v1');
    const parsed = JSON.parse(raw!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].dish.id).toBe('dish-1');
  });

  it('should clear the cart and persist', () => {
    service.add({ dish: dishA, qty: 1 });
    service.add({ dish: dishB, qty: 2 });
    service.clear();
    expect(service.getItems().length).toBe(0);
    expect(service.getTotal()).toBe(0);
    const raw = fakeStorage.getItem('tk_cart_v1');
    const parsed = JSON.parse(raw!);
    expect(parsed.length).toBe(0);
  });

  it('should load existing cart from localStorage on init', () => {
    // Seed storage before constructing service
    const seed: CartItem[] = [
      { dish: dishA, qty: 2 },
      { dish: dishB, qty: 1 }
    ];
    fakeStorage.setItem('tk_cart_v1', JSON.stringify(seed));

    // Recreate service to trigger load()
    service = new CartService();
    expect(service.getItems().length).toBe(2);
    expect(service.getTotal()).toBe(2 * 120 + 1 * 180);
  });
});
