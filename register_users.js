async function run() {
  const register = async (username, password, phone) => {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, phoneNumber: phone })
    });
    return res.json();
  };

  console.log('userai:', await register('userai', '123456', '01700000000'));
  console.log('alif6t6:', await register('alif6t6', 'Alif632868', '01800000000'));
}
run();
