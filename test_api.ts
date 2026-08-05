async function test() {
  const baseUrl = 'http://localhost:3000';
  let userToken = '';

  const userLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'userai', password: '123456' })
  });
  const userLoginData = await userLogin.json();
  userToken = userLoginData.token;

  console.log('--- Testing Check-in ---');
  const dailyCheckin = await fetch(`${baseUrl}/api/user/daily-checkin/claim`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  console.log('Checkin Claim Status:', dailyCheckin.status);
  console.log(await dailyCheckin.text());

  console.log('--- Testing Withdrawals ---');
  const withdraw = await fetch(`${baseUrl}/api/user/withdrawals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    body: JSON.stringify({ method: 'bKash', amount: '100', accountDetails: '01700000000' })
  });
  console.log('Withdraw Status:', withdraw.status);
  console.log(await withdraw.text());

  const getWithdrawals = await fetch(`${baseUrl}/api/user/withdrawals`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  console.log('Get Withdraw Status:', getWithdrawals.status);
  console.log(await getWithdrawals.text());

}
test().catch(console.error);
