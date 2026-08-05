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
    return handleClientApiFallback(targetUrl, options, token);
  }

  const text = await response.text();
  const trimmed = text.trim();
  const lowerTrimmed = trimmed.toLowerCase();

  // If static hosting (like Netlify or Vercel) returned index.html for unhandled /api route or 404/502
  if (
    lowerTrimmed.startsWith('<!doctype') ||
    lowerTrimmed.startsWith('<html') ||
    lowerTrimmed.startsWith('<') ||
    response.status === 404 ||
    response.status === 502
  ) {
    return handleClientApiFallback(targetUrl, options, token);
  }

  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // If JSON parsing fails (e.g. invalid json returned by server), attempt client fallback or wrap text
    try {
      return await handleClientApiFallback(targetUrl, options, token);
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




