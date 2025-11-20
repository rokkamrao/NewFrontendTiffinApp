// Railway Backend Discovery Script
// Run this in your browser console at your live frontend URL to find the backend

console.log('🔍 TiffinApp Railway Backend Discovery Starting...');

const possibleUrls = [
  'https://tiffin-api-production.railway.app',
  'https://tiffin-api.railway.app', 
  'https://newbackendtiffinapp-production.railway.app',
  'https://backend-production.railway.app',
  'https://tiffin-backend.railway.app',
  'https://tiffin-server.railway.app',
  'https://api-production.railway.app'
];

async function discoverRailwayBackend() {
  console.log('🧪 Testing Railway URLs...');
  
  for (const baseUrl of possibleUrls) {
    try {
      console.log(`⏳ Testing: ${baseUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ FOUND WORKING BACKEND: ${baseUrl}`);
        console.log(`📡 API URL: ${baseUrl}/api`);
        console.log(`🔗 Health Response: ${data}`);
        
        // Test a few more endpoints
        await testMoreEndpoints(baseUrl);
        
        return baseUrl;
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${baseUrl} (${error.message})`);
    }
  }
  
  console.log('🚫 No working Railway backend found');
  return null;
}

async function testMoreEndpoints(baseUrl) {
  const endpoints = ['/api/auth/health', '/api/dishes', '/api/admin/health'];
  
  console.log('🧪 Testing additional endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(3000)
      });
      
      console.log(`  ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`  ${endpoint}: Failed (${error.message})`);
    }
  }
}

// Run the discovery
discoverRailwayBackend().then(result => {
  if (result) {
    console.log('🎉 SUCCESS! Your backend URL is:', result + '/api');
    console.log('🔧 Use this URL in your environment.prod.ts file');
    console.log(`💾 Update command: 
    apiUrl: '${result}/api'`);
  } else {
    console.log('🔍 Backend not found. Check your Railway deployment:');
    console.log('1. Go to https://railway.app/dashboard');
    console.log('2. Find your tiffin-api project');
    console.log('3. Copy the generated domain');
  }
});

// Manual test function
window.testRailwayUrl = function(url) {
  console.log(`🧪 Manual test: ${url}`);
  
  fetch(`${url}/api/health`)
    .then(r => {
      console.log(`✅ ${url}: ${r.status} ${r.statusText}`);
      return r.text();
    })
    .then(data => console.log(`📄 Response: ${data}`))
    .catch(err => console.log(`❌ ${url}: ${err.message}`));
};

console.log('💡 Manual test available: testRailwayUrl("https://your-url.railway.app")');
console.log('⚡ Discovery will complete in a few seconds...');