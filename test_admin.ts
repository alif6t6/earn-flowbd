async function test() {
  const baseUrl = 'http://localhost:3000';
  const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alif6t6', password: '@Alif632868' })
  });
  const { token } = await adminLogin.json();

  const endpoints = [
    '/api/admin/stats',
    '/api/admin/tasks',
    '/api/admin/videos',
    '/api/admin/ads',
    '/api/admin/referrals',
    '/api/admin/withdrawals',
    '/api/admin/promo-codes',
    '/api/admin/campaign',
    '/api/admin/users',
    '/api/admin/premium-plans',
    '/api/admin/premium-requests',
    '/api/admin/settings'
  ];

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`${ep}: ${res.status}`);
    if (res.status !== 200) {
       console.log(await res.text());
    }
  }
}
test().catch(console.error);
