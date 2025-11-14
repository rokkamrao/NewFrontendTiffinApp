// Quick Fix Script for TiffinApp Authentication State Conflict
// Run this in browser console at http://localhost:4200

console.log('🔧 Fixing TiffinApp Authentication State Conflict...');

// Step 1: Clear all auth state completely
console.log('🧹 Step 1: Clearing all authentication state');
localStorage.removeItem('authToken');
localStorage.removeItem('userProfile');
localStorage.removeItem('tiffin_session');

// Step 2: Force logout through services
if (window.authService) {
    window.authService.logout();
    console.log('✅ AuthService logout called');
}

if (window.appComponent) {
    window.appComponent.isLoggedIn = false;
    window.appComponent.currentUser = null;
    console.log('✅ AppComponent state cleared');
}

// Step 3: Reload page to start fresh
console.log('🔄 Reloading page in 2 seconds...');
setTimeout(() => {
    console.log('🔄 Reloading now...');
    location.reload();
}, 2000);

console.log('✨ Auth state cleared! Page will reload automatically.');

// Make functions available for manual use
window.fixAuth = {
    clearState: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        if (window.authService) window.authService.logout();
        if (window.appComponent) {
            window.appComponent.isLoggedIn = false;
            window.appComponent.currentUser = null;
        }
        console.log('✅ Auth state cleared manually');
    },
    
    checkState: () => {
        console.log('🔍 Current Auth State:');
        console.log('- localStorage token:', !!localStorage.getItem('authToken'));
        console.log('- localStorage user:', !!localStorage.getItem('userProfile'));
        console.log('- AppComponent isLoggedIn:', window.appComponent?.isLoggedIn);
        console.log('- AuthService isLoggedIn:', window.authService?.isLoggedIn());
    },
    
    reload: () => location.reload()
};

console.log('Manual functions available: fixAuth.clearState(), fixAuth.checkState(), fixAuth.reload()');