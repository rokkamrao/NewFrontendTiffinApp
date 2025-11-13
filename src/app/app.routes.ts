import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

// 🎯 CENTRALIZED ROUTES WITH PROPER AUTH GUARDS
export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'home' },
	{ path: 'auth-redirect', loadComponent: () => import('./shared/components/auth-redirect.component').then(m=>m.AuthRedirectComponent) },
	{ path: 'landing', loadComponent: () => import('./features/landing/landing.component').then(m=>m.LandingComponent) },
	{ path: 'splash', loadComponent: () => import('./features/splash/splash.component').then(m=>m.SplashComponent) },
	{ path: 'onboarding', loadComponent: () => import('./features/onboarding/onboarding.component').then(m=>m.OnboardingComponent) },
	
	// 🔴 AUTH ROUTES - Protected with guestGuard (logged-in users redirected to account)
	{ 
		path: 'auth/signup', 
		canActivate: [guestGuard],
		loadComponent: () => import('./features/auth/signup.component').then(m=>m.SignupComponent) 
	},
	{ 
		path: 'auth/login', 
		canActivate: [guestGuard],
		loadComponent: () => import('./features/auth/login.component').then(m=>m.LoginComponent) 
	},
	{ 
		path: 'auth/forgot-password', 
		canActivate: [guestGuard],
		loadComponent: () => import('./features/auth/forgot-password.component').then(m=>m.ForgotPasswordComponent) 
	},
	{ 
		path: 'auth/verify-otp', 
		canActivate: [guestGuard],
		loadComponent: () => import('./features/auth/otp.component').then(m=>m.VerifyOtpComponent) 
	},
	{ path: 'auth/admin-login', loadComponent: () => import('./features/admin/admin-login.component').then(m=>m.AdminLoginComponent) },
	{ path: 'auth/delivery-login', loadComponent: () => import('./features/delivery/delivery-login.component').then(m=>m.DeliveryLoginComponent) },
	
	// Dashboard route - redirects to appropriate dashboard based on user role
	{
		path: 'dashboard',
		loadComponent: () => import('./shared/components/dashboard-redirect.component').then(m => m.DashboardRedirectComponent)
	},
	
	// 🌍 PUBLIC ROUTES (no auth required)
	{ path: 'home', loadComponent: () => import('./features/landing/landing.component').then(m=>m.LandingComponent) },
	{ path: 'menu', loadComponent: () => import('./features/menu/menu.component').then(m=>m.MenuComponent) },
	{ path: 'menu/:id', loadComponent: () => import('./features/menu/menu-detail.component').then(m=>m.MenuDetailComponent) },
	{ path: 'subscription', loadComponent: () => import('./features/subscription/subscription').then(m=>m.SubscriptionComponent) },
	{ path: 'support', loadComponent: () => import('./features/support/support.component').then(m=>m.SupportComponent) },
	
	// 🟢 PROTECTED ROUTES (require authentication)
	{ 
		path: 'user-dashboard',
		canActivate: [authGuard],
		loadComponent: () => import('./features/home/home.component').then(m=>m.HomeComponent) 
	},
	{ 
		path: 'recommendations', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/recommendations/ai-recommendations.component').then(m=>m.AiRecommendationsComponent) 
	},
	{ 
		path: 'cart', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/cart/cart.component').then(m=>m.CartComponent) 
	},
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
	{ 
		path: 'subscription/checkout', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/subscription/subscription-checkout.component').then(m=>m.SubscriptionCheckoutComponent) 
	},
	{ 
		path: 'subscription/payment', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/subscription/subscription-payment.component').then(m=>m.SubscriptionPaymentComponent) 
	},
	{ 
		path: 'subscription/success', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/subscription/subscription-success.component').then(m=>m.SubscriptionSuccessComponent) 
	},
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
	{ 
		path: 'profile', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/profile/profile').then(m=>m.Profile) 
	},
	{ 
		path: 'tracking/:id', 
		canActivate: [authGuard],
		loadComponent: () => import('./features/tracking/tracking.component').then(m=>m.TrackingComponent) 
	},

	// 🔧 ROLE-BASED PROTECTED ROUTES
	{ 
		path: 'admin', 
		canActivate: [(route, state) => roleGuard(['ADMIN'])(route, state)],
		loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
	},
	{
		path: 'delivery',
		canActivate: [(route, state) => roleGuard(['DELIVERY', 'DELIVERY_PARTNER'])(route, state)],
		loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES)
	},

	// Legacy routes for backward compatibility
	{ path: 'auth/otp', redirectTo: 'auth/verify-otp' },
];
