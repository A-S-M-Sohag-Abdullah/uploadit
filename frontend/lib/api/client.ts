const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get headers (no auth token needed - using httpOnly cookies)
export function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

// Base fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: sends httpOnly cookies with requests
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Don't redirect on /me endpoint (used for auth initialization)
      // Redirect to login on unauthorized for other endpoints
      if (typeof window !== 'undefined' && endpoint !== '/auth/me') {
        window.location.href = '/auth/login';
      }
    }

    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// GET request
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'GET' });
}

// POST request
export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT request
export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE request
export async function apiDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}

// POST multipart form data (for file uploads)
export async function apiPostFormData<T>(
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('POST', url);

    // Enable sending cookies with the request
    xhr.withCredentials = true;

    xhr.send(formData);
  });
}