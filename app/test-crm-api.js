// Test script for CRM API endpoints
// Run with: node test-crm-api.js

const BASE_URL = 'https://mycarwash-tan.vercel.app';
const API_KEY = 'ekhaya-car-wash-secret-key-2024';

// Test helper function
async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📡 URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success:`, JSON.stringify(data, null, 2));
      return data;
    } else {
      const error = await response.text();
      console.log(`❌ Error:`, error);
      return null;
    }
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting CRM API Tests');
  console.log('=' .repeat(50));
  
  // Test 1: Dashboard Statistics
  await testEndpoint(
    'Dashboard Statistics',
    `${BASE_URL}/api/crm/dashboard/stats`
  );
  
  // Test 2: Search all bookings (pagination test)
  await testEndpoint(
    'Search All Bookings (First Page)',
    `${BASE_URL}/api/crm/bookings/search?limit=5`
  );
  
  // Test 3: Search by status
  await testEndpoint(
    'Search Confirmed Bookings',
    `${BASE_URL}/api/crm/bookings/search?status=CONFIRMED&limit=3`
  );
  
  // Test 4: Search by booking date (today)
  const today = new Date().toISOString().split('T')[0];
  await testEndpoint(
    'Search Today\'s Bookings',
    `${BASE_URL}/api/crm/bookings/search?bookingDate=${today}`
  );
  
  // Test 5: Test invalid API key
  console.log(`\n🧪 Testing: Invalid API Key`);
  try {
    const response = await fetch(`${BASE_URL}/api/crm/dashboard/stats`, {
      headers: {
        'X-API-Key': 'invalid-key',
        'Content-Type': 'application/json'
      }
    });
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      console.log(`✅ Security working: Unauthorized access blocked`);
    } else {
      console.log(`❌ Security issue: Should have returned 401`);
    }
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 CRM API Tests Completed');
  console.log('\n📋 Next Steps:');
  console.log('1. If you see bookings, try searching by specific reference numbers');
  console.log('2. Test customer name searches');
  console.log('3. Test license plate searches');
  console.log('4. Try the booking details endpoint with a specific ID');
}

// Run the tests
runTests();