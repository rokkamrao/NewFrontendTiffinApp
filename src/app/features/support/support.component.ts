import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage { id: string; text: string; sender: 'user' | 'agent'; createdAt: string; }

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html'
})
export class SupportComponent{
  messages: ChatMessage[] = [
    { id: 'm1', text: 'Hi! How can we help you today?', sender: 'agent', createdAt: new Date().toISOString() }
  ];
  draft = '';
  send(ev: Event){
    ev.preventDefault();
    const text = this.draft.trim(); if(!text) return;
    this.messages.push({ id: 'u'+Date.now(), text, sender: 'user', createdAt: new Date().toISOString() });
    this.draft = '';
    // mock agent response
    setTimeout(()=>{
      this.messages.push({ id: 'a'+Date.now(), text: 'Thanks! We\'ll get back to you shortly.', sender: 'agent', createdAt: new Date().toISOString() });
    }, 800);
  }
}
