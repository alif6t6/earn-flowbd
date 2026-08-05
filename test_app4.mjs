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

  const uRes = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'userai', password: '123456' }) });
  const uTok = uRes.data.token;

  const aRes = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'alif6t6', password: '@Alif632868' }) });
  const aTok = aRes.data.token;

  // Add balance to userai so they can withdraw
  await req(`/api/admin/users/${uRes.data.id}/balance`, {
    method: 'POST', token: aTok, body: JSON.stringify({ action: 'add', amount: 100 })
  });

  const wReq = await req('/api/user/withdrawals', {
    method: 'POST', token: uTok,
    body: JSON.stringify({ method: 'Bkash', amount: 50, accountNumber: '01811223344' })
  });
  console.log('User withdraw:', wReq.status, wReq.data);

  const pReq = await req('/api/user/premium-request', {
    method: 'POST', token: uTok,
    body: JSON.stringify({ method: 'Bkash', transactionId: 'TRX12345', senderNumber: '01811223344', amount: 300, screenshotUrl: '' })
  });
  console.log('User premium:', pReq.status, pReq.data);

  const apReq = await req('/api/admin/premium-requests', { token: aTok });
  if (Array.isArray(apReq.data) && apReq.data.length > 0) {
    const pId = apReq.data[0].id;
    const apApp = await req(`/api/admin/premium-requests/${pId}/status`, {
      method: 'PATCH', token: aTok,
      body: JSON.stringify({ status: 'approved' })
    });
    console.log('Admin approve premium:', apApp.status, apApp.data);
  }

  const awReq = await req('/api/admin/withdrawals', { token: aTok });
  if (Array.isArray(awReq.data) && awReq.data.length > 0) {
    const wId = awReq.data[0].id;
    const awApp = await req(`/api/admin/withdrawals/${wId}/status`, {
      method: 'PATCH', token: aTok,
      body: JSON.stringify({ status: 'approved' })
    });
    console.log('Admin approve withdraw:', awApp.status, awApp.data);
  }
}
runTests().catch(console.error);
