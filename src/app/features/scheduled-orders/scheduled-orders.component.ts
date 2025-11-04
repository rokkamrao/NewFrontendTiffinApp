import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ScheduledOrderService, ScheduledOrder, CreateScheduledOrderRequest, 
         RecurrencePattern, DayOfWeek, ScheduledOrderStatus } from '../../core/services/scheduled-order.service';

/**
 * Component for managing scheduled orders with calendar integration
 * Provides comprehensive scheduling interface with recurring patterns
 */
@Component({
  selector: 'app-scheduled-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TitleCasePipe, DecimalPipe],
  templateUrl: './scheduled-orders.component.html',
  styleUrls: ['./scheduled-orders.component.css']
})
export class ScheduledOrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Make Math available in template
  Math = Math;
  
  // State management
  scheduledOrders: ScheduledOrder[] = [];
  filteredOrders: ScheduledOrder[] = [];
  loading = false;
  error: string | null = null;
  
  // Modal states
  showCreateModal = false;
  showCalendarModal = false;
  showEditModal = false;
  selectedOrder: ScheduledOrder | null = null;
  
  // Form management
  createForm: FormGroup;
  filterForm: FormGroup;
  
  // Configuration
  recurrencePatterns: RecurrencePattern[] = ['ONCE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'];
  daysOfWeek: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  statusOptions: ScheduledOrderStatus[] = ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED', 'EXPIRED'];
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private scheduledOrderService: ScheduledOrderService,
    private formBuilder: FormBuilder
  ) {
    this.createForm = this.initializeCreateForm();
    this.filterForm = this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadScheduledOrders();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize create form with validation
   */
  private initializeCreateForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(500)]],
      recurrencePattern: ['WEEKLY', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      preferredDeliveryTime: ['12:00', Validators.required],
      customIntervalDays: [''],
      selectedDaysOfWeek: [[]],
      orderTemplate: ['', [Validators.required, Validators.maxLength(1000)]],
      estimatedAmount: ['', [Validators.required, Validators.min(0.01)]],
      deliveryInstructions: ['', [Validators.maxLength(500)]],
      maxExecutions: [''],
      aiOptimizationEnabled: [true],
      reminderEnabled: [true],
      reminderMinutesBefore: [60, [Validators.min(5), Validators.max(1440)]],
      preferredPaymentMethod: [''],
      membershipBenefitsApplied: [false]
    });
  }

  /**
   * Initialize filter form
   */
  private initializeFilterForm(): FormGroup {
    return this.formBuilder.group({
      status: [''],
      searchTerm: ['']
    });
  }

  /**
   * Setup reactive subscriptions
   */
  private setupSubscriptions(): void {
    // Listen to scheduled orders updates
    this.scheduledOrderService.scheduledOrders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.scheduledOrders = orders;
        this.applyFilters();
      });

    // Listen to filter changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });

    // Listen to recurrence pattern changes to show/hide relevant fields
    this.createForm.get('recurrencePattern')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(pattern => {
        this.updateFormValidation(pattern);
      });
  }

  /**
   * Load scheduled orders from API
   */
  loadScheduledOrders(): void {
    this.loading = true;
    this.error = null;

    const params = {
      page: this.currentPage,
      size: this.pageSize,
      status: this.filterForm.get('status')?.value || undefined
    };

    this.scheduledOrderService.getScheduledOrders(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.scheduledOrders = response.data.content;
            this.totalElements = response.data.totalElements;
            this.totalPages = response.data.totalPages;
            this.scheduledOrderService.updateScheduledOrders(this.scheduledOrders);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load scheduled orders';
          this.loading = false;
          console.error('Error loading scheduled orders:', error);
        }
      });
  }

  /**
   * Apply filters to scheduled orders
   */
  private applyFilters(): void {
    let filtered = [...this.scheduledOrders];
    
    const filters = this.filterForm.value;
    
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.name.toLowerCase().includes(searchTerm) ||
        (order.description && order.description.toLowerCase().includes(searchTerm))
      );
    }
    
    this.filteredOrders = filtered;
  }

  /**
   * Update form validation based on recurrence pattern
   */
  private updateFormValidation(pattern: RecurrencePattern): void {
    const customIntervalControl = this.createForm.get('customIntervalDays');
    const selectedDaysControl = this.createForm.get('selectedDaysOfWeek');
    
    // Reset validators
    customIntervalControl?.clearValidators();
    selectedDaysControl?.clearValidators();
    
    // Add validators based on pattern
    if (pattern === 'CUSTOM') {
      customIntervalControl?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
    }
    
    if (pattern === 'WEEKLY' || pattern === 'BIWEEKLY') {
      selectedDaysControl?.setValidators([Validators.required]);
    }
    
    customIntervalControl?.updateValueAndValidity();
    selectedDaysControl?.updateValueAndValidity();
  }

  /**
   * Open create modal
   */
  openCreateModal(): void {
    this.createForm.reset();
    this.createForm.patchValue({
      recurrencePattern: 'WEEKLY',
      aiOptimizationEnabled: true,
      reminderEnabled: true,
      reminderMinutesBefore: 60,
      membershipBenefitsApplied: false
    });
    this.showCreateModal = true;
  }

  /**
   * Close create modal
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset();
  }

  /**
   * Create new scheduled order
   */
  createScheduledOrder(): void {
    if (this.createForm.invalid) {
      this.markFormGroupTouched(this.createForm);
      return;
    }

    this.loading = true;
    const formValue = this.createForm.value;
    
    const request: CreateScheduledOrderRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
      recurrencePattern: formValue.recurrencePattern,
      startDate: formValue.startDate,
      endDate: formValue.endDate || undefined,
      preferredDeliveryTime: formValue.preferredDeliveryTime,
      customIntervalDays: formValue.customIntervalDays || undefined,
      selectedDaysOfWeek: formValue.selectedDaysOfWeek?.length > 0 ? formValue.selectedDaysOfWeek : undefined,
      orderTemplate: formValue.orderTemplate,
      estimatedAmount: formValue.estimatedAmount,
      deliveryInstructions: formValue.deliveryInstructions || undefined,
      maxExecutions: formValue.maxExecutions || undefined,
      aiOptimizationEnabled: formValue.aiOptimizationEnabled,
      reminderEnabled: formValue.reminderEnabled,
      reminderMinutesBefore: formValue.reminderMinutesBefore || undefined,
      preferredPaymentMethod: formValue.preferredPaymentMethod || undefined,
      membershipBenefitsApplied: formValue.membershipBenefitsApplied
    };

    this.scheduledOrderService.createScheduledOrder(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.closeCreateModal();
            this.loadScheduledOrders();
            // Show success message
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to create scheduled order';
          this.loading = false;
          console.error('Error creating scheduled order:', error);
        }
      });
  }

  /**
   * Open edit modal for scheduled order
   */
  editScheduledOrder(order: ScheduledOrder): void {
    this.selectedOrder = order;
    this.showEditModal = true;
    // Populate edit form with order data
  }

  /**
   * Pause scheduled order
   */
  pauseOrder(order: ScheduledOrder, reason?: string): void {
    this.scheduledOrderService.pauseScheduledOrder(order.id, reason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadScheduledOrders();
          }
        },
        error: (error) => {
          console.error('Error pausing order:', error);
        }
      });
  }

  /**
   * Resume scheduled order
   */
  resumeOrder(order: ScheduledOrder): void {
    this.scheduledOrderService.resumeScheduledOrder(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadScheduledOrders();
          }
        },
        error: (error) => {
          console.error('Error resuming order:', error);
        }
      });
  }

  /**
   * Cancel scheduled order
   */
  cancelOrder(order: ScheduledOrder, reason?: string): void {
    if (confirm('Are you sure you want to cancel this scheduled order?')) {
      this.scheduledOrderService.cancelScheduledOrder(order.id, reason)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadScheduledOrders();
            }
          },
          error: (error) => {
            console.error('Error cancelling order:', error);
          }
        });
    }
  }

  /**
   * Open calendar modal
   */
  openCalendarModal(): void {
    this.showCalendarModal = true;
  }

  /**
   * Close calendar modal
   */
  closeCalendarModal(): void {
    this.showCalendarModal = false;
  }

  /**
   * Get status color class
   */
  getStatusColorClass(status: ScheduledOrderStatus): string {
    const colorMap: Record<ScheduledOrderStatus, string> = {
      'ACTIVE': 'text-green-600 bg-green-100',
      'PAUSED': 'text-yellow-600 bg-yellow-100',
      'COMPLETED': 'text-blue-600 bg-blue-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'FAILED': 'text-red-600 bg-red-100',
      'EXPIRED': 'text-gray-600 bg-gray-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Get recurrence description
   */
  getRecurrenceDescription(order: ScheduledOrder): string {
    return this.scheduledOrderService.formatRecurrenceDescription(order);
  }

  /**
   * Check if order needs attention
   */
  needsAttention(order: ScheduledOrder): boolean {
    return this.scheduledOrderService.needsAttention(order);
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(order: ScheduledOrder): number | null {
    return this.scheduledOrderService.getProgressPercentage(order);
  }

  /**
   * Check if order is approaching completion
   */
  isApproachingCompletion(order: ScheduledOrder): boolean {
    return this.scheduledOrderService.isApproachingCompletion(order);
  }

  /**
   * Handle pagination
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadScheduledOrders();
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadScheduledOrders();
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string | null {
    const field = this.createForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      const errors = field.errors;
      if (errors?.['required']) {
        return `${fieldName} is required`;
      }
      if (errors?.['maxlength']) {
        return `${fieldName} is too long`;
      }
      if (errors?.['min']) {
        return `${fieldName} value is too small`;
      }
      if (errors?.['max']) {
        return `${fieldName} value is too large`;
      }
    }
    return null;
  }

  /**
   * Toggle day of week selection
   */
  toggleDayOfWeek(day: DayOfWeek): void {
    const selectedDays = this.createForm.get('selectedDaysOfWeek')?.value || [];
    const index = selectedDays.indexOf(day);
    
    if (index > -1) {
      selectedDays.splice(index, 1);
    } else {
      selectedDays.push(day);
    }
    
    this.createForm.get('selectedDaysOfWeek')?.setValue([...selectedDays]);
  }

  /**
   * Check if day of week is selected
   */
  isDaySelected(day: DayOfWeek): boolean {
    const selectedDays = this.createForm.get('selectedDaysOfWeek')?.value || [];
    return selectedDays.includes(day);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Format time for display
   */
  formatTime(timeString: string): string {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}