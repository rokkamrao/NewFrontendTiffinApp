# Browser Authentication Debug Guide

## Problem Diagnosis

If the authentication state is not updating properly in the browser (showing Login/Signup buttons instead of user profile after login), follow these steps:

## Step 1: Open Browser Developer Tools

1. Open your browser to `http://localhost:4200`
2. Press `F12` or `Ctrl+Shift+I` to open Developer Tools
3. Go to the **Console** tab

## Step 2: Check Current Auth State

Run this command in the browser console:

```javascript
// Check if services are available
console.log('AuthService available:', !!window.authService);
console.log('AppComponent available:', !!window.appComponent);

// Debug current auth state
if (window.authService) {
    window.authService.debugAuthState();
} else {
    console.log('AuthService not available on window');
}
```

## Step 3: Check localStorage

```javascript
// Check stored authentication data
const token = localStorage.getItem('authToken');
const userProfile = localStorage.getItem('userProfile');

console.log('🔍 LocalStorage Check:');
console.log('- Has Token:', !!token);
console.log('- Has User Profile:', !!userProfile);
console.log('- Token Length:', token ? token.length : 0);

if (userProfile) {
    try {
        const user = JSON.parse(userProfile);
        console.log('- Stored User:', user);
    } catch (e) {
        console.log('- User Parse Error:', e);
    }
}
```

## Step 4: Check App Component State

```javascript
// Check current component state
if (window.appComponent) {
    console.log('🖼️ App Component State:');
    console.log('- isLoggedIn:', window.appComponent.isLoggedIn);
    console.log('- currentUser:', window.appComponent.currentUser);
    console.log('- User Name:', window.appComponent.currentUser?.name || 'none');
} else {
    console.log('AppComponent not available on window');
}
```

## Step 5: Force Auth State Refresh

If the state is incorrect, try forcing a refresh:

```javascript
// Force refresh authentication state
if (window.appComponent) {
    console.log('🔄 Forcing auth state refresh...');
    window.appComponent.debugForceAuthRefresh();
} else {
    console.log('❌ AppComponent not available');
}
```

## Step 6: Force AuthService State Update

```javascript
// Force AuthService to update from storage
if (window.authService) {
    console.log('🔄 Forcing AuthService state update...');
    window.authService.forceAuthStateFromStorage();
} else {
    console.log('❌ AuthService not available');
}
```

## Step 7: Verify Final State

After forcing refresh, check the final state:

```javascript
// Check final state after refresh
setTimeout(() => {
    console.log('🎯 Final State Check:');
    if (window.appComponent) {
        console.log('- App isLoggedIn:', window.appComponent.isLoggedIn);
        console.log('- App currentUser:', window.appComponent.currentUser?.name || 'none');
    }
    if (window.authService) {
        console.log('- Service isLoggedIn():', window.authService.isLoggedIn());
        console.log('- Service getCurrentUser():', window.authService.getCurrentUser()?.name || 'none');
    }
}, 1000);
```

## Complete Debug Script

Copy and paste this entire script into the browser console:

```javascript
console.log('🚀 Starting TiffinApp Authentication Debug');

// 1. Check service availability
console.log('📋 Service Availability:');
console.log('- AuthService:', !!window.authService);
console.log('- AppComponent:', !!window.appComponent);

// 2. Check localStorage
const token = localStorage.getItem('authToken');
const userProfile = localStorage.getItem('userProfile');
console.log('💾 LocalStorage:');
console.log('- Token:', !!token, token?.length || 0, 'chars');
console.log('- User Profile:', !!userProfile);

if (userProfile) {
    try {
        const user = JSON.parse(userProfile);
        console.log('- User Data:', user.name || user.phone, user.email);
    } catch (e) {
        console.log('- Parse Error:', e.message);
    }
}

// 3. Check current state
if (window.authService) {
    console.log('🔍 AuthService State:');
    console.log('- isLoggedIn():', window.authService.isLoggedIn());
    console.log('- getCurrentUser():', window.authService.getCurrentUser()?.name || 'none');
}

if (window.appComponent) {
    console.log('🖼️ AppComponent State:');
    console.log('- isLoggedIn:', window.appComponent.isLoggedIn);
    console.log('- currentUser:', window.appComponent.currentUser?.name || 'none');
}

// 4. Force refresh if needed
const shouldForceRefresh = token && userProfile && (!window.appComponent?.isLoggedIn || !window.authService?.isLoggedIn());

if (shouldForceRefresh) {
    console.log('🔄 Auth state mismatch detected, forcing refresh...');
    
    if (window.authService?.forceAuthStateFromStorage) {
        window.authService.forceAuthStateFromStorage();
    }
    
    if (window.appComponent?.debugForceAuthRefresh) {
        window.appComponent.debugForceAuthRefresh();
    }
    
    // Check result after refresh
    setTimeout(() => {
        console.log('✅ Post-Refresh State:');
        console.log('- App isLoggedIn:', window.appComponent?.isLoggedIn);
        console.log('- Service isLoggedIn:', window.authService?.isLoggedIn());
        console.log('- User:', window.appComponent?.currentUser?.name || 'none');
    }, 500);
} else {
    console.log('✅ Auth state appears consistent');
}

console.log('🏁 Debug script completed');
```

## Expected Behavior

After running the debug script:
1. If you have valid auth data in localStorage, both `isLoggedIn` should be `true`
2. The UI should show the user profile dropdown instead of Login/Signup buttons
3. The user's name should be displayed in the header

## If Issues Persist

1. **Clear auth data and re-login:**
```javascript
localStorage.removeItem('authToken');
localStorage.removeItem('userProfile');
location.reload();
```

2. **Check network tab** for failed API requests
3. **Check backend server** is running on http://localhost:8081
4. **Review console logs** for authentication errors

## Manual UI Force Update

If all else fails, manually trigger UI update:

```javascript
// Force UI update
if (window.appComponent && localStorage.getItem('authToken')) {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
        const user = JSON.parse(userProfile);
        window.appComponent.isLoggedIn = true;
        window.appComponent.currentUser = user;
        console.log('Manual UI state updated');
    }
}
```