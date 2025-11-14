// Test script for authentication and logo issues
// Run this in browser console (F12 > Console tab)

console.log('🔍 Testing Authentication & Logo Issues...');

// Test 1: Check current auth state
console.log('📋 Current Auth State:');
console.log('- Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
console.log('- User Profile:', localStorage.getItem('userProfile') ? 'Present' : 'Missing');

// Test 2: Check logo loading
console.log('🖼️ Logo Test:');
const logoImg = document.querySelector('#custom-logo');
if (logoImg) {
  console.log('- Logo element found:', logoImg.src);
  console.log('- Logo loaded:', logoImg.complete && logoImg.naturalWidth > 0);
} else {
  console.log('- Logo element not found');
}

// Test 3: Simulate logged-in user
console.log('🧪 Simulating logged-in user...');
localStorage.setItem('authToken', 'temp_token_2_1763034602942');
localStorage.setItem('userProfile', JSON.stringify({
  id: 2,
  name: 'Test User',
  phone: '9876543210',
  email: 'test@example.com'
}));

// Test 4: Force auth service refresh
if (window.authService) {
  console.log('♻️ Forcing auth service refresh...');
  window.authService.validateSession();
} else {
  console.log('⚠️ AuthService not available on window');
}

console.log('✅ Test completed! Refresh the page to see changes.');
console.log('🔧 To reset: localStorage.clear() and refresh');