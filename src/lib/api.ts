export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const targetUrl = url.startsWith('/') ? url : `/${url}`;

  let response: Response;
  try {
    response = await fetch(targetUrl, { ...options, headers });
  } catch (err: any) {
    // Retry once if network fetch fails (e.g. server restart / brief disconnect)
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      response = await fetch(targetUrl, { ...options, headers });
    } catch {
      throw new Error('Network error or server unavailable. Please check your internet connection.');
    }
  }

  const contentType = response.headers.get('content-type') || '';
  
  let data: any = null;

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<')) {
      throw new Error(`Endpoint ${targetUrl} returned HTML instead of JSON (${response.status})`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      data = { text };
    }
  }

  if (!response.ok) {
    const errorMsg = (data && typeof data === 'object' && data.error) 
      ? data.error 
      : `HTTP ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
};


