import { handleClientApiFallback } from './clientApiFallback';

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

  let response: Response | null = null;
  let networkFailed = false;

  try {
    response = await fetch(targetUrl, { ...options, headers });
  } catch (err: any) {
    networkFailed = true;
  }

  // If network failed completely or response is missing, check fallback
  if (networkFailed || !response) {
    try {
      return await handleClientApiFallback(targetUrl, options, token);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }

  const contentType = response.headers.get('content-type') || '';
  
  let data: any = null;

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text();
    const trimmed = text.trim();
    
    // If static hosting (like Netlify) returned index.html for the /api route or 404 HTML
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<') || response.status === 404) {
      try {
        return await handleClientApiFallback(targetUrl, options, token);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }

    try {
      data = JSON.parse(text);
    } catch {
      data = { text };
    }
  }

  if (!response.ok) {
    // If backend 404 or 500 on static host
    if (response.status === 404 || response.status === 502) {
      try {
        return await handleClientApiFallback(targetUrl, options, token);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }

    const errorMsg = (data && typeof data === 'object' && data.error) 
      ? data.error 
      : `HTTP ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
};



