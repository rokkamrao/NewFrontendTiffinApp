import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { UserProfile } from '../../models';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
    isLoggedIn = false;
    currentUser: UserProfile | null = null;
    logoUrl = '';
    hideNavbar = false;

    private authSubscription?: Subscription;
    private imageUpdateSubscription?: Subscription;
    private routerSubscription?: Subscription;
    private platformId = inject(PLATFORM_ID);

    constructor(
        public router: Router,
        private authService: AuthService,
        public imageService: ImageService
    ) {
        this.logoUrl = this.imageService.getLogo();

        // Hide navbar on specific routes
        this.routerSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.hideNavbar = ['/splash', '/onboarding', '/landing'].includes(event.urlAfterRedirects);
            }
        });
    }

    ngOnInit() {
        // Subscribe to auth state
        this.authSubscription = this.authService.user$.subscribe((user) => {
            this.currentUser = user;
            this.isLoggedIn = !!user;
        });

        // Subscribe to logo updates
        this.imageUpdateSubscription = this.imageService.onImageUpdate$.subscribe(() => {
            this.logoUrl = this.imageService.getLogo();
            this.reloadLogo();
        });
    }

    ngOnDestroy() {
        this.authSubscription?.unsubscribe();
        this.imageUpdateSubscription?.unsubscribe();
        this.routerSubscription?.unsubscribe();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/home']);
    }

    goToLogin(event?: Event) {
        if (event) event.preventDefault();
        this.router.navigate(['/auth/login']);
    }

    goToAuth(event?: Event) {
        if (event) event.preventDefault();
        this.router.navigate(['/auth/signup']);
    }

    goToAccount(event?: Event) {
        if (event) event.preventDefault();
        if (this.isLoggedIn) {
            this.router.navigate(['/account']);
        } else {
            this.router.navigate(['/auth/login']);
        }
    }

    goToOrders(event?: Event) {
        if (event) event.preventDefault();
        if (this.isLoggedIn) {
            this.router.navigate(['/orders']);
        } else {
            this.router.navigate(['/auth/login']);
        }
    }

    goToHome(event?: Event) {
        if (event) event.preventDefault();
        this.router.navigate(['/home']);
    }

    getUserDisplayName(): string {
        if (!this.currentUser) return 'User';
        return this.currentUser.name || this.currentUser.phone || 'User';
    }

    onLogoLoad(event: Event) {
        const imgElement = event.target as HTMLImageElement;
        const defaultLogo = document.getElementById('default-logo');
        if (imgElement && defaultLogo) {
            imgElement.style.display = 'block';
            defaultLogo.style.display = 'none';
        }
    }

    onLogoError(event: Event) {
        const imgElement = event.target as HTMLImageElement;
        const defaultLogo = document.getElementById('default-logo');
        if (imgElement && defaultLogo) {
            imgElement.style.display = 'none';
            defaultLogo.style.display = 'flex';
        }
    }

    reloadLogo() {
        const customLogo = document.getElementById('custom-logo') as HTMLImageElement;
        const defaultLogo = document.getElementById('default-logo');

        if (customLogo) {
            customLogo.style.display = 'none';
            if (defaultLogo) defaultLogo.style.display = 'flex';

            const newUrl = this.imageService.getLogo();
            customLogo.src = newUrl.includes('data:') ? newUrl : `${newUrl}?t=${Date.now()}`;
        }
    }
}
