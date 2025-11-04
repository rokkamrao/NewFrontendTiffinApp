import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service for managing scheduled orders with calendar integration
 * Provides methods for creating, updating, and managing recurring orders
 */
@Injectable({
  providedIn: 'root'
})
export class ScheduledOrderService {
  private readonly baseUrl = `${environment.apiUrl}/scheduled-orders`;
  
  // State management for scheduled orders
  private scheduledOrdersSubject = new BehaviorSubject<ScheduledOrder[]>([]);
  public scheduledOrders$ = this.scheduledOrdersSubject.asObservable();
  
  private calendarEventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  public calendarEvents$ = this.calendarEventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Create a new scheduled order
   */
  createScheduledOrder(request: CreateScheduledOrderRequest): Observable<ApiResponse<ScheduledOrder>> {
    return this.http.post<ApiResponse<ScheduledOrder>>(this.baseUrl, request);
  }

  /**
   * Update an existing scheduled order
   */
  updateScheduledOrder(id: number, request: UpdateScheduledOrderRequest): Observable<ApiResponse<ScheduledOrder>> {
    return this.http.put<ApiResponse<ScheduledOrder>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Get scheduled order by ID
   */
  getScheduledOrder(id: number): Observable<ApiResponse<ScheduledOrder>> {
    return this.http.get<ApiResponse<ScheduledOrder>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get paginated list of scheduled orders
   */
  getScheduledOrders(params: {
    page?: number;
    size?: number;
    status?: ScheduledOrderStatus;
  } = {}): Observable<ApiResponse<PagedResponse<ScheduledOrder>>> {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<ApiResponse<PagedResponse<ScheduledOrder>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * Get calendar view of scheduled orders
   */
  getCalendarView(params: {
    startDate: string;
    endDate: string;
    viewType?: CalendarViewType;
    includeCompletedOrders?: boolean;
    includeExecutionHistory?: boolean;
  }): Observable<ApiResponse<CalendarViewResponse>> {
    let httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);

    if (params.viewType) {
      httpParams = httpParams.set('viewType', params.viewType);
    }
    if (params.includeCompletedOrders !== undefined) {
      httpParams = httpParams.set('includeCompletedOrders', params.includeCompletedOrders.toString());
    }
    if (params.includeExecutionHistory !== undefined) {
      httpParams = httpParams.set('includeExecutionHistory', params.includeExecutionHistory.toString());
    }

    return this.http.get<ApiResponse<CalendarViewResponse>>(`${this.baseUrl}/calendar`, { params: httpParams });
  }

  /**
   * Pause a scheduled order
   */
  pauseScheduledOrder(id: number, reason?: string): Observable<ApiResponse<ScheduledOrder>> {
    const body = reason ? { reason } : {};
    return this.http.post<ApiResponse<ScheduledOrder>>(`${this.baseUrl}/${id}/pause`, body);
  }

  /**
   * Resume a paused scheduled order
   */
  resumeScheduledOrder(id: number): Observable<ApiResponse<ScheduledOrder>> {
    return this.http.post<ApiResponse<ScheduledOrder>>(`${this.baseUrl}/${id}/resume`, {});
  }

  /**
   * Cancel a scheduled order
   */
  cancelScheduledOrder(id: number, reason?: string): Observable<ApiResponse<ScheduledOrder>> {
    const body = reason ? { reason } : {};
    return this.http.post<ApiResponse<ScheduledOrder>>(`${this.baseUrl}/${id}/cancel`, body);
  }

  /**
   * Get quick actions for scheduled orders
   */
  getQuickActions(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/quick-actions`);
  }

  /**
   * Generate recurring dates based on pattern
   */
  generateRecurringDates(
    startDate: Date,
    pattern: RecurrencePattern,
    customInterval?: number,
    selectedDays?: DayOfWeek[],
    maxOccurrences: number = 10
  ): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < maxOccurrences; i++) {
      dates.push(new Date(currentDate));
      
      switch (pattern) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'WEEKLY':
          if (selectedDays && selectedDays.length > 0) {
            currentDate = this.getNextDateForDays(currentDate, selectedDays);
          } else {
            currentDate.setDate(currentDate.getDate() + 7);
          }
          break;
        case 'BIWEEKLY':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'CUSTOM':
          if (customInterval) {
            currentDate.setDate(currentDate.getDate() + customInterval);
          }
          break;
        default:
          return dates; // ONCE - only one occurrence
      }
    }
    
    return dates;
  }

  /**
   * Get next date that matches selected days of week
   */
  private getNextDateForDays(currentDate: Date, selectedDays: DayOfWeek[]): Date {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayNumbers = selectedDays.map(day => this.dayOfWeekToNumber(day));
    
    while (!dayNumbers.includes(nextDate.getDay())) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }

  /**
   * Convert DayOfWeek enum to JavaScript day number
   */
  private dayOfWeekToNumber(day: DayOfWeek): number {
    const mapping: Record<DayOfWeek, number> = {
      'SUNDAY': 0,
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6
    };
    return mapping[day];
  }

  /**
   * Format recurrence description for display
   */
  formatRecurrenceDescription(order: ScheduledOrder): string {
    switch (order.recurrencePattern) {
      case 'ONCE':
        return 'One-time order';
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return `Weekly${order.selectedDaysOfWeek ? ` on ${this.formatDaysOfWeek(order.selectedDaysOfWeek)}` : ''}`;
      case 'BIWEEKLY':
        return `Every 2 weeks${order.selectedDaysOfWeek ? ` on ${this.formatDaysOfWeek(order.selectedDaysOfWeek)}` : ''}`;
      case 'MONTHLY':
        return 'Monthly';
      case 'CUSTOM':
        return order.customIntervalDays ? `Every ${order.customIntervalDays} days` : 'Custom';
      default:
        return 'Unknown pattern';
    }
  }

  /**
   * Format days of week for display
   */
  private formatDaysOfWeek(days: DayOfWeek[]): string {
    if (!days || days.length === 0) {
      return 'all days';
    }
    
    const dayNames = days.map(day => day.substring(0, 3));
    return dayNames.join(', ');
  }

  /**
   * Check if order needs attention
   */
  needsAttention(order: ScheduledOrder): boolean {
    return order.status === 'PAUSED' || 
           order.status === 'FAILED' ||
           (order.failedExecutions > 0 && order.failedExecutions >= order.successfulExecutions);
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: ScheduledOrderStatus): string {
    const colors: Record<ScheduledOrderStatus, string> = {
      'ACTIVE': 'green',
      'PAUSED': 'yellow',
      'COMPLETED': 'blue',
      'CANCELLED': 'red',
      'FAILED': 'red',
      'EXPIRED': 'gray'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(order: ScheduledOrder): number | null {
    if (!order.maxExecutions || order.maxExecutions === 0) {
      return null; // Unlimited executions
    }
    return (order.executionCount / order.maxExecutions) * 100;
  }

  /**
   * Check if order is approaching completion
   */
  isApproachingCompletion(order: ScheduledOrder): boolean {
    if (!order.maxExecutions) {
      return false;
    }
    return order.remainingExecutions !== null && order.remainingExecutions !== undefined && order.remainingExecutions <= 3;
  }

  /**
   * Update local state with new scheduled orders
   */
  updateScheduledOrders(orders: ScheduledOrder[]): void {
    this.scheduledOrdersSubject.next(orders);
  }

  /**
   * Update local state with calendar events
   */
  updateCalendarEvents(events: CalendarEvent[]): void {
    this.calendarEventsSubject.next(events);
  }

  /**
   * Get current scheduled orders state
   */
  getCurrentScheduledOrders(): ScheduledOrder[] {
    return this.scheduledOrdersSubject.value;
  }

  /**
   * Get current calendar events state
   */
  getCurrentCalendarEvents(): CalendarEvent[] {
    return this.calendarEventsSubject.value;
  }
}

// Type definitions
export interface ScheduledOrder {
  id: number;
  name: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  status: ScheduledOrderStatus;
  startDate: string;
  endDate?: string;
  preferredDeliveryTime: string;
  customIntervalDays?: number;
  selectedDaysOfWeek?: DayOfWeek[];
  orderTemplate: string;
  estimatedAmount: number;
  deliveryInstructions?: string;
  executionCount: number;
  maxExecutions?: number;
  remainingExecutions?: number;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  aiOptimizationEnabled: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number;
  preferredPaymentMethod?: string;
  membershipBenefitsApplied: boolean;
  createdAt: string;
  updatedAt: string;
  pausedAt?: string;
  pauseReason?: string;
  successfulExecutions: number;
  failedExecutions: number;
  totalSpent?: number;
  averageOrderAmount?: number;
}

export interface CreateScheduledOrderRequest {
  name: string;
  description?: string;
  recurrencePattern: RecurrencePattern;
  startDate: string;
  endDate?: string;
  preferredDeliveryTime: string;
  customIntervalDays?: number;
  selectedDaysOfWeek?: DayOfWeek[];
  orderTemplate: string;
  estimatedAmount: number;
  deliveryInstructions?: string;
  maxExecutions?: number;
  aiOptimizationEnabled?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  preferredPaymentMethod?: string;
  membershipBenefitsApplied?: boolean;
}

export interface UpdateScheduledOrderRequest {
  name?: string;
  description?: string;
  recurrencePattern?: RecurrencePattern;
  endDate?: string;
  preferredDeliveryTime?: string;
  customIntervalDays?: number;
  selectedDaysOfWeek?: DayOfWeek[];
  orderTemplate?: string;
  estimatedAmount?: number;
  deliveryInstructions?: string;
  maxExecutions?: number;
  aiOptimizationEnabled?: boolean;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  preferredPaymentMethod?: string;
  membershipBenefitsApplied?: boolean;
}

export interface CalendarViewResponse {
  startDate: string;
  endDate: string;
  viewType: CalendarViewType;
  events: CalendarEvent[];
  statistics: CalendarStatistics;
}

export interface CalendarEvent {
  scheduledOrderId: number;
  orderName: string;
  eventDateTime: string;
  eventType: string;
  status: string;
  description: string;
  canModify: boolean;
  needsAttention: boolean;
}

export interface CalendarStatistics {
  totalScheduledOrders: number;
  activeOrders: number;
  pausedOrders: number;
  completedExecutions: number;
  failedExecutions: number;
  upcomingExecutions: number;
}

export type RecurrencePattern = 'ONCE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';
export type ScheduledOrderStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'EXPIRED';
export type CalendarViewType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}