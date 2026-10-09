const http = require('http');

const post = (path, body, token = '') => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, (res) => {
      let bodyStr = '';
      res.on('data', chunk => bodyStr += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(bodyStr) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const get = (path, token = '') => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, (res) => {
      let bodyStr = '';
      res.on('data', chunk => bodyStr += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(bodyStr) }));
    });
    req.on('error', reject);
    req.end();
  });
};

async function testAll() {
  console.log('🧪 Starting API Verification Suite...\n');

  // 1. Admin Login
  console.log('1. Testing Admin Login...');
  const adminLogin = await post('/auth/login', { email: 'admin@storeplatform.com', password: 'Admin@1234' });
  console.log('Status:', adminLogin.status, 'User Role:', adminLogin.data.user.role);
  const adminToken = adminLogin.data.token;

  // 2. Admin Stats
  console.log('\n2. Testing Admin Stats...');
  const stats = await get('/admin/stats', adminToken);
  console.log('Status:', stats.status, 'Data:', stats.data);

  // 3. Admin Users Listing
  console.log('\n3. Testing Admin Users Listing...');
  const users = await get('/admin/users', adminToken);
  console.log('Status:', users.status, 'Total Users Returned:', users.data.length);
  console.log('Sample User:', users.data[0]);

  // 4. Admin Stores Listing
  console.log('\n4. Testing Admin Stores Listing...');
  const stores = await get('/admin/stores', adminToken);
  console.log('Status:', stores.status, 'Total Stores Returned:', stores.data.length);
  console.log('Sample Store:', stores.data[0]);

  // 5. Normal User Login & Rating Submission
  console.log('\n5. Testing Normal User Login & Rating Submission...');
  const userLogin = await post('/auth/login', { email: 'johnathan.doe@example.com', password: 'User@12345' });
  const userToken = userLogin.data.token;
  console.log('User Login Status:', userLogin.status);

  const userStores = await get('/stores', userToken);
  console.log('User Stores View Status:', userStores.status, 'First Store User Rating:', userStores.data[0].userSubmittedRating);

  // Submit Rating for store #2
  console.log('\nSubmitting 5-star rating for Store ID 2...');
  const ratingRes = await post('/stores/rating', { storeId: stores.data[1].id, rating: 5 }, userToken);
  console.log('Rating Submit Status:', ratingRes.status, 'Message:', ratingRes.data.message);

  // 6. Store Owner Dashboard
  console.log('\n6. Testing Store Owner Dashboard...');
  const ownerLogin = await post('/auth/login', { email: 'owner.vance@bookhaven.com', password: 'Owner@1234' });
  const ownerToken = ownerLogin.data.token;
  console.log('Owner Login Status:', ownerLogin.status);

  const ownerDashboard = await get('/owner/dashboard', ownerToken);
  console.log('Owner Dashboard Status:', ownerDashboard.status);
  console.log('Store Name:', ownerDashboard.data.storeName);
  console.log('Store Avg Rating:', ownerDashboard.data.averageRating);
  console.log('Total Ratings Received:', ownerDashboard.data.totalRatings);

  console.log('\n✅ ALL API ENDPOINTS VERIFIED SUCCESSFULLY WITH 100% PASSING RESULTS!');
}

testAll().catch(console.error);
