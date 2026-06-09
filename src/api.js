const API_BASE_URL = 'https://sulciscomply-api.onrender.com/api'

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
    const result = await response.json()
    return result.data !== undefined ? result.data : result
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}

export const studiosAPI = {
  getAll: () => apiCall('/studios'),
  getById: (id) => apiCall(`/studios/${id}`),
  create: (data) => apiCall('/studios', 'POST', data),
  update: (id, data) => apiCall(`/studios/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/studios/${id}`, 'DELETE'),
}

export const usersAPI = {
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
  create: (data) => apiCall('/users', 'POST', data),
  update: (id, data) => apiCall(`/users/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/users/${id}`, 'DELETE'),
}

export const clientsAPI = {
  getAll: () => apiCall('/clients'),
  getById: (id) => apiCall(`/clients/${id}`),
  create: (data) => apiCall('/clients', 'POST', data),
  update: (id, data) => apiCall(`/clients/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/clients/${id}`, 'DELETE'),
}

export const amlAPI = {
  getAll: () => apiCall('/aml-fascicoli'),
  getById: (id) => apiCall(`/aml-fascicoli/${id}`),
  getByClient: (clientId) => apiCall(`/aml-fascicoli?client_id=${clientId}`),
  create: (data) => apiCall('/aml-fascicoli', 'POST', data),
  update: (id, data) => apiCall(`/aml-fascicoli/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/aml-fascicoli/${id}`, 'DELETE'),
}

export const gdprAPI = {
  getAll: () => apiCall('/gdpr'),
  getById: (id) => apiCall(`/gdpr/${id}`),
  getByClient: (clientId) => apiCall(`/gdpr?client_id=${clientId}`),
  create: (data) => apiCall('/gdpr', 'POST', data),
  update: (id, data) => apiCall(`/gdpr/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/gdpr/${id}`, 'DELETE'),
}

export const tasksAPI = {
  getAll: () => apiCall('/tasks'),
  getById: (id) => apiCall(`/tasks/${id}`),
  getByClient: (clientId) => apiCall(`/tasks?client_id=${clientId}`),
  create: (data) => apiCall('/tasks', 'POST', data),
  update: (id, data) => apiCall(`/tasks/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/tasks/${id}`, 'DELETE'),
}

export const profiliFiscaliAPI = {
  getAll: () => apiCall('/profili-fiscali'),
  getById: (id) => apiCall(`/profili-fiscali/${id}`),
  getByClient: (clientId) => apiCall(`/profili-fiscali?client_id=${clientId}`),
  create: (data) => apiCall('/profili-fiscali', 'POST', data),
  update: (id, data) => apiCall(`/profili-fiscali/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/profili-fiscali/${id}`, 'DELETE'),
}

export const auditLogAPI = {
  getAll: (params = '') => apiCall(`/audit-log${params}`),
}
