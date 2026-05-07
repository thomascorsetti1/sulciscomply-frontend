const API_BASE_URL = 'http://localhost:3000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP error ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return null
}

export const clientsAPI = {
  getAll: () => request('/clients'),
  getById: (id) => request(`/clients/${id}`),
  create: (data) =>
    request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/clients/${id}`, {
      method: 'DELETE',
    }),
}

export const tasksAPI = {
  getAll: () => request('/tasks'),
}