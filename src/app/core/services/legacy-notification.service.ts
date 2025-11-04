import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface LegacyNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO
  read?: boolean;
}

const STORAGE_KEY = 'tk_notifications_v1';

@Injectable({ providedIn: 'root' })
export class LegacyNotificationService {
  private _items = new BehaviorSubject<LegacyNotification[]>([]);
  items$ = this._items.asObservable();

  constructor(){ this.load(); }

  list(): Observable<LegacyNotification[]> { return this.items$; }

  add(title: string, message: string){
    const arr = this._items.value.slice();
    arr.unshift({ id: 'n' + Date.now(), title, message, createdAt: new Date().toISOString(), read: false });
    this._items.next(arr); this.save();
  }

  markRead(id: string){ this._items.next(this._items.value.map(n => n.id===id ? { ...n, read: true } : n)); this.save(); }

  clearAll(){ this._items.next([]); this.save(); }

  private save(){ try{ if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items.value)); }catch(e){} }
  private load(){ try{ if (typeof window !== 'undefined' && typeof localStorage !== 'undefined'){ const r = localStorage.getItem(STORAGE_KEY); if(r) this._items.next(JSON.parse(r)); } }catch(e){} }
}
