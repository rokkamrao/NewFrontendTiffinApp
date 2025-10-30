import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subscription.component.html'
})
export class SubscriptionComponent{
  plans = [] as any[];
  activeSubscription: any = null;
  constructor(private ss: SubscriptionService){ 
    ss.getPlans().subscribe(p=> this.plans = p); 
    // Mock active subscription for demo
    this.activeSubscription = { planName: 'Premium Plan', status: 'Active', nextDelivery: 'Tomorrow 8 AM', renewalDate: 'Jan 31, 2025' };
  }
  subscribeToPlan(plan: any){ this.ss.subscribe(plan.id).subscribe(()=>{}); }
}
