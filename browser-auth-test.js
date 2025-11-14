// TiffinApp Authentication Test Script
// Copy and paste this entire script into your browser console at http://localhost:4200

console.log('🚀 TiffinApp Authentication Test Starting...');

// Test Configuration
const TEST_USER = {
  name: 'Test User',
  phone: '9876543210',
  email: 'test@example.com',
  id: 1,
  role: 'USER'
};

const TEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwiaWF0IjoxNjMzMDQ4MjAwLCJleHAiOjk5OTk5OTk5OTksInJvbGUiOiJVU0VSIn0.test_token_for_debugging';

// Step 1: Check Initial State
function checkInitialState() {
  console.log('📋 Step 1: Initial State Check');
  console.log('- AuthService available:', !!window.authService);
  console.log('- AppComponent available:', !!window.appComponent);
  
  if (window.authService) {
    console.log('- Service isLoggedIn():', window.authService.isLoggedIn());
    console.log('- Service getCurrentUser():', window.authService.getCurrentUser());
  }
  
  if (window.appComponent) {
    console.log('- App isLoggedIn:', window.appComponent.isLoggedIn);
    console.log('- App currentUser:', window.appComponent.currentUser);
  }
  
  // Check localStorage
  const token = localStorage.getItem('authToken');
  const userProfile = localStorage.getItem('userProfile');
  console.log('- localStorage token:', !!token);
  console.log('- localStorage user:', !!userProfile);
}

// Step 2: Simulate Login
function simulateLogin() {
  console.log('🔐 Step 2: Simulating Login');
  
  // Store test auth data in localStorage
  localStorage.setItem('authToken', TEST_TOKEN);
  localStorage.setItem('userProfile', JSON.stringify(TEST_USER));
  
  console.log('✅ Test auth data stored in localStorage');
  
  // Force AuthService to recognize the new data
  if (window.authService && window.authService.forceAuthStateFromStorage) {
    window.authService.forceAuthStateFromStorage();
    console.log('✅ AuthService state refreshed');
  }
  
  // Force AppComponent to recognize the new data
  if (window.appComponent && window.appComponent.debugForceAuthRefresh) {
    window.appComponent.debugForceAuthRefresh();
    console.log('✅ AppComponent state refreshed');
  }
}

// Step 3: Verify Auth State
function verifyAuthState() {
  console.log('🔍 Step 3: Verifying Auth State');
  
  // Wait a moment for state to update
  setTimeout(() => {
    if (window.authService) {
      console.log('- Service isLoggedIn():', window.authService.isLoggedIn());
      console.log('- Service getCurrentUser():', window.authService.getCurrentUser());
    }
    
    if (window.appComponent) {
      console.log('- App isLoggedIn:', window.appComponent.isLoggedIn);
      console.log('- App currentUser:', window.appComponent.currentUser);
    }
    
    // Check if UI elements are correct
    const loginBtn = document.querySelector('button[ng-reflect-router-link="/auth/login"]');
    const signupBtn = document.querySelector('button[ng-reflect-router-link="/auth/signup"]');
    const profileDropdown = document.querySelector('[data-bs-toggle="dropdown"]');
    
    console.log('🖼️ UI State Check:');
    console.log('- Login button visible:', !!loginBtn && loginBtn.offsetParent !== null);
    console.log('- Signup button visible:', !!signupBtn && signupBtn.offsetParent !== null);
    console.log('- Profile dropdown visible:', !!profileDropdown && profileDropdown.offsetParent !== null);
    
    // Final assessment
    const expectedLoggedIn = !!localStorage.getItem('authToken');
    const actualAppLoggedIn = window.appComponent?.isLoggedIn;
    const actualServiceLoggedIn = window.authService?.isLoggedIn();
    
    console.log('📊 Final Assessment:');
    console.log('- Expected logged in:', expectedLoggedIn);
    console.log('- App component logged in:', actualAppLoggedIn);
    console.log('- Auth service logged in:', actualServiceLoggedIn);
    console.log('- States match:', expectedLoggedIn === actualAppLoggedIn && expectedLoggedIn === actualServiceLoggedIn);
    
    if (expectedLoggedIn === actualAppLoggedIn && expectedLoggedIn === actualServiceLoggedIn) {
      console.log('✅ SUCCESS: Authentication state is working correctly!');
    } else {
      console.log('❌ ISSUE: Authentication state mismatch detected');
    }
    
  }, 1000);
}

// Step 4: Test Logout
function testLogout() {
  console.log('🚪 Step 4: Testing Logout');
  
  if (window.authService) {
    window.authService.logout();
    console.log('✅ Logout called');
    
    setTimeout(() => {
      console.log('- Service isLoggedIn():', window.authService.isLoggedIn());
      console.log('- App isLoggedIn:', window.appComponent?.isLoggedIn);
      console.log('- localStorage token:', !!localStorage.getItem('authToken'));
      console.log('- localStorage user:', !!localStorage.getItem('userProfile'));
      
      if (!window.authService.isLoggedIn() && !window.appComponent?.isLoggedIn && !localStorage.getItem('authToken')) {
        console.log('✅ SUCCESS: Logout working correctly!');
      } else {
        console.log('❌ ISSUE: Logout did not clear all auth state');
      }
    }, 500);
  }
}

// Main Test Function
function runFullTest() {
  console.log('🧪 Running Full Authentication Test Suite');
  
  // Step 1: Initial state
  checkInitialState();
  
  // Step 2: Simulate login
  setTimeout(() => simulateLogin(), 1000);
  
  // Step 3: Verify auth state
  setTimeout(() => verifyAuthState(), 2000);
  
  // Step 4: Test logout
  setTimeout(() => testLogout(), 4000);
  
  console.log('⏱️ Test will complete in ~5 seconds...');
}

// Quick Tests
window.testAuth = {
  full: runFullTest,
  initialState: checkInitialState,
  simulateLogin: simulateLogin,
  verify: verifyAuthState,
  logout: testLogout,
  debugAuth: () => window.authService?.debugAuthState(),
  forceRefresh: () => {
    window.authService?.forceAuthStateFromStorage();
    window.appComponent?.debugForceAuthRefresh();
  }
};

console.log('🎯 Test functions available:');
console.log('- testAuth.full() - Run complete test suite');
console.log('- testAuth.simulateLogin() - Add test auth data');
console.log('- testAuth.verify() - Check current state');
console.log('- testAuth.logout() - Test logout');
console.log('- testAuth.forceRefresh() - Force state refresh');
console.log('- testAuth.debugAuth() - Debug AuthService');

// Auto-run initial check
checkInitialState();

console.log('✨ To run the full test, type: testAuth.full()');