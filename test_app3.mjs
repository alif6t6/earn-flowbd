const baseUrl = 'http://localhost:3000';
async function runTests() {
  const req = async (path, opts={}) => {
    const res = await fetch(baseUrl + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {})
      },
      ...opts
    });
    try {
      return { status: res.status, data: await res.json() };
    } catch(e) {
      return { status: res.status, data: await res.text() };
    }
  };

  // Login User
  const uRes = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'userai', password: '123456' }) });
  const uTok = uRes.data.token;

  // Login Admin
  const aRes = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'alif6t6', password: '@Alif632868' }) });
  const aTok = aRes.data.token;

  // User: submit withdrawal
  console.log('Testing User Withdrawal...');
  const wReq = await req('/api/user/withdraw', {
    method: 'POST',
    token: uTok,
    body: JSON.stringify({ method: 'Bkash', amount: 50, senderNumber: '01811223344' })
  });
  console.log('User withdraw:', wReq.status, wReq.data);

  // User: submit premium request
  console.log('Testing Premium Request...');
  const pReq = await req('/api/user/premium/request', {
    method: 'POST',
    token: uTok,
    body: JSON.stringify({ method: 'Bkash', transactionId: 'TRX12345', senderNumber: '01811223344' })
  });
  console.log('User premium:', pReq.status, pReq.data);

  // Admin: get premium requests
  console.log('Admin: fetching premium requests...');
  const apReq = await req('/api/admin/premium-requests', { token: aTok });
  console.log('Admin premium requests:', apReq.status, Array.isArray(apReq.data) ? `Found ${apReq.data.length}` : apReq.data);

  // Admin: approve premium request
  if (Array.isArray(apReq.data) && apReq.data.length > 0) {
    const pId = apReq.data[0].id;
    console.log(`Admin: Approving premium request ${pId}...`);
    const apApp = await req(`/api/admin/premium-requests/${pId}/status`, {
      method: 'PATCH',
      token: aTok,
      body: JSON.stringify({ status: 'approved' })
    });
    console.log('Admin approve premium:', apApp.status, apApp.data);
  }

}
runTests().catch(console.error);
