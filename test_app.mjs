const baseUrl = 'http://localhost:3000';

async function fetchApi(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options
  });
  
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return { status: response.status, data };
  } catch(e) {
    return { status: response.status, data: text };
  }
}

async function runTests() {
  console.log('--- Testing Auth ---');
  
  // 1. Admin Login
  const adminRes = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'alif6t6', password: '@Alif632868' })
  });
  console.log('Admin Login:', adminRes.status, adminRes.data.token ? 'Success' : adminRes.data);
  const adminToken = adminRes.data.token;

  // 2. User Login
  const userRes = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'userai', password: '123456' })
  });
  console.log('User Login:', userRes.status, userRes.data.token ? 'Success' : userRes.data);
  const userToken = userRes.data.token;

  console.log('\n--- Testing Admin Endpoints ---');
  const adminStats = await fetchApi('/api/admin/stats', { token: adminToken });
  console.log('Admin Stats:', adminStats.status, adminStats.status === 200 ? 'Success' : adminStats.data);

  const adminUsers = await fetchApi('/api/admin/users', { token: adminToken });
  console.log('Admin Users:', adminUsers.status, adminUsers.status === 200 ? 'Success' : adminUsers.data);
  
  const adminTasks = await fetchApi('/api/admin/tasks', { token: adminToken });
  console.log('Admin Tasks:', adminTasks.status, adminTasks.status === 200 ? 'Success' : adminTasks.data);
  
  const adminWithdrawals = await fetchApi('/api/admin/withdrawals', { token: adminToken });
  console.log('Admin Withdrawals:', adminWithdrawals.status, adminWithdrawals.status === 200 ? 'Success' : adminWithdrawals.data);
  
  const adminVideos = await fetchApi('/api/admin/videos', { token: adminToken });
  console.log('Admin Videos:', adminVideos.status, adminVideos.status === 200 ? 'Success' : adminVideos.data);

  console.log('\n--- Testing User Endpoints ---');
  const userProfile = await fetchApi('/api/user/profile', { token: userToken });
  console.log('User Profile:', userProfile.status, userProfile.status === 200 ? 'Success' : userProfile.data);

  const userTasks = await fetchApi('/api/user/tasks', { token: userToken });
  console.log('User Tasks:', userTasks.status, userTasks.status === 200 ? 'Success' : userTasks.data);

  const userPayments = await fetchApi('/api/user/payments', { token: userToken });
  console.log('User Payments:', userPayments.status, userPayments.status === 200 ? 'Success' : userPayments.data);
  
  const userReferrals = await fetchApi('/api/user/referrals', { token: userToken });
  console.log('User Referrals:', userReferrals.status, userReferrals.status === 200 ? 'Success' : userReferrals.data);
}

runTests().catch(console.error);
