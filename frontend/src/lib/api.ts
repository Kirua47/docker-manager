export const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized (expired token)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Return a never-resolving promise to block downstream execution and prevent crash overlays during redirect
    return new Promise(() => {}) as unknown as Promise<Response>;
  }

  return response;
}

export const containerService = {
  list: async () => {
    const res = await apiFetch('/containers/');
    if (!res.ok) throw new Error('Failed to fetch containers');
    return res.json();
  },

  create: async (data: { name: string; image: string; ports?: any; volumes?: any }) => {
    const res = await apiFetch('/containers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create container');
    }
    return res.json();
  },

  start: async (id: string) => {
    const res = await apiFetch(`/containers/${id}/start/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start container');
    return res.json();
  },

  stop: async (id: string) => {
    const res = await apiFetch(`/containers/${id}/stop/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to stop container');
    return res.json();
  },

  restart: async (id: string) => {
    const res = await apiFetch(`/containers/${id}/restart/`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to restart container');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiFetch(`/containers/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete container');
    return true;
  },

  getLogs: async (id: string, tail = 500, timestamps = false) => {
    const res = await apiFetch(`/containers/${id}/logs/?tail=${tail}&timestamps=${timestamps}`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    const data = await res.json();
    return data.logs || '';
  },

  exec: async (id: string, command: string) => {
    const res = await apiFetch(`/containers/${id}/exec/`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Exec failed' }));
      throw new Error(err.error || 'Exec failed');
    }
    return res.json();
  }
};

export const imageService = {
  list: async () => {
    const res = await apiFetch('/images/');
    if (!res.ok) throw new Error('Failed to fetch images');
    return res.json();
  },

  search: async (query: string) => {
    const res = await apiFetch(`/images/search/?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search images');
    return res.json();
  },

  pull: async (image: string) => {
    const res = await apiFetch('/images/pull/', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to pull image');
    }
    return res.json();
  },

  delete: async (id: string, force = false) => {
    // id is the full sha256 ID — must be URL-encoded since it contains ":"
    const encodedId = encodeURIComponent(id);
    const res = await apiFetch(`/images/${encodedId}/?force=${force}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to delete image' }));
      throw new Error(error.error || 'Failed to delete image');
    }
    return true;
  }
};

export const volumeService = {
  list: async () => {
    const res = await apiFetch('/volumes/');
    if (!res.ok) throw new Error('Failed to fetch volumes');
    return res.json();
  },

  create: async (name: string) => {
    const res = await apiFetch('/volumes/', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create volume');
    }
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiFetch(`/volumes/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete volume');
    return true;
  }
};

export const systemService = {
  getStats: async () => {
    const res = await apiFetch('/system/stats/');
    if (!res.ok) throw new Error('Failed to fetch system stats');
    return res.json();
  }
};
