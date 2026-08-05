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
  const userRes = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'userai', password: '123456' })
  });
  const userToken = userRes.data.token;

  const tasks = await fetchApi('/api/tasks', { token: userToken });
  console.log('Tasks:', tasks.status, tasks.status === 200 ? 'Success' : tasks.data);

  const videos = await fetchApi('/api/videos', { token: userToken });
  console.log('Videos:', videos.status, videos.status === 200 ? 'Success' : videos.data);
  
  const ads = await fetchApi('/api/ads', { token: userToken });
  console.log('Ads:', ads.status, ads.status === 200 ? 'Success' : ads.data);
}

runTests().catch(console.error);
