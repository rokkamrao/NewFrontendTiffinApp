import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
// Routes configuration
export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'home' },
	{ path: 'splash', loadComponent: () => import('./features/splash/splash.component').then(m=>m.SplashComponent) },
	{ path: 'onboarding', loadComponent: () => import('./features/onboarding/onboarding.component').then(m=>m.OnboardingComponent) },
	{ path: 'auth/signup', loadComponent: () => import('./features/auth/signup.component').then(m=>m.SignupComponent) },
	{ path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(m=>m.LoginComponent) },
	{ path: 'auth/forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m=>m.ForgotPasswordComponent) },
	{ path: 'auth/verify-otp', loadComponent: () => import('./features/auth/otp.component').then(m=>m.VerifyOtpComponent) },
	{ path: 'auth/admin-login', loadComponent: () => import('./features/admin/admin-login.component').then(m=>m.AdminLoginComponent) },
	{ path: 'auth/delivery-login', loadComponent: () => import('./features/delivery/delivery-login.component').then(m=>m.DeliveryLoginComponent) },
	
	// Dashboard route - redirects to appropriate dashboard based on user role
	{
		path: 'dashboard',
		loadComponent: () => import('./shared/components/dashboard-redirect.component').then(m => m.DashboardRedirectComponent)
	},
	
	{ path: 'home', loadComponent: () => import('./features/home/home.component').then(m=>m.HomeComponent) },
	{ path: 'menu', loadComponent: () => import('./features/menu/menu.component').then(m=>m.MenuComponent) },
	{ path: 'menu/:id', loadComponent: () => import('./features/menu/menu-detail.component').then(m=>m.MenuDetailComponent) },
	{ 
		path: 'recommendations', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/recommendations/ai-recommendations.component').then(m=>m.AiRecommendationsComponent) 
	},
	{ path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m=>m.CartComponent) },
	{ 
		path: 'checkout', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/checkout/checkout.component').then(m=>m.CheckoutComponent) 
	},
	{ 
		path: 'checkout/payment', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/checkout/payment.component').then(m=>m.PaymentComponent) 
	},
	{ 
		path: 'checkout/payment-success', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/checkout/payment-success.component').then(m=>m.PaymentSuccessComponent) 
	},
	{ path: 'subscription', loadComponent: () => import('./features/subscription/subscription.component').then(m=>m.SubscriptionComponent) },
	{ 
		path: 'orders', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/orders/orders.component').then(m=>m.OrdersComponent) 
	},
	{ 
		path: 'orders/success/:id', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/orders/order-success.component').then(m=>m.OrderSuccessComponent) 
	},
	{ 
		path: 'scheduled-orders', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/scheduled-orders/scheduled-orders.component').then(m=>m.ScheduledOrdersComponent) 
	},
	{ 
		path: 'account', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/account/account.component').then(m=>m.AccountComponent) 
	},
	{ path: 'auth/otp', loadComponent: () => import('./features/auth/otp.component').then(m=>m.VerifyOtpComponent) },
	{ 
		path: 'tracking/:id', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/tracking/tracking.component').then(m=>m.TrackingComponent) 
	},
	// { 
	// 	path: 'notifications', 
	// 	canActivate: [authGuard],
	// 	loadComponent: () => import('./features/notifications/notifications.component').then(m=>m.NotificationsComponent) 
	// },
	{ path: 'support', loadComponent: () => import('./features/support/support.component').then(m=>m.SupportComponent) },

	// Admin routes - Protected with role guard
	{ 
		path: 'admin', 
		canActivate: [(route, state) => roleGuard(['ADMIN'])(route, state)],
		loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
	},

	// Delivery Partner App - Protected with role guard
	{
		path: 'delivery',
		canActivate: [(route, state) => roleGuard(['DELIVERY', 'DELIVERY_PARTNER'])(route, state)],
		loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES)
	},
];
