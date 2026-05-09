const API_BASE_URL = 'https://sulciscomply-api.onrender.com/api'
// Utility function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Studios API
export const studiosAPI = {
  getAll: () => apiCall('/studios'),
  getById: (id) => apiCall(`/studios/${id}`),
  create: (data) => apiCall('/studios', 'POST', data),
  update: (id, data) => apiCall(`/studios/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/studios/${id}`, 'DELETE'),
};

// Users API
export const usersAPI = {
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
  getByStudio: (studioId) => apiCall(`/users/studio/${studioId}`),
  create: (data) => apiCall('/users', 'POST', data),
  update: (id, data) => apiCall(`/users/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/users/${id}`, 'DELETE'),
};

// Clients API
export const clientsAPI = {
  getAll: () => apiCall('/clients'),
  getById: (id) => apiCall(`/clients/${id}`),
  getByStudio: (studioId) => apiCall(`/clients/studio/${studioId}`),
  create: (data) => apiCall('/clients', 'POST', data),
  update: (id, data) => apiCall(`/clients/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/clients/${id}`, 'DELETE'),
};

// AML API
export const amlAPI = {
  getAll: () => apiCall('/aml'),
  getById: (id) => apiCall(`/aml/${id}`),
  getByClient: (clientId) => apiCall(`/aml/client/${clientId}`),
  create: (data) => apiCall('/aml', 'POST', data),
  update: (id, data) => apiCall(`/aml/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/aml/${id}`, 'DELETE'),
};

// GDPR API
export const gdprAPI = {
  getAll: () => apiCall('/gdpr'),
  getById: (id) => apiCall(`/gdpr/${id}`),
  getByClient: (clientId) => apiCall(`/gdpr/client/${clientId}`),
  create: (data) => apiCall('/gdpr', 'POST', data),
  update: (id, data) => apiCall(`/gdpr/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/gdpr/${id}`, 'DELETE'),
};

// Tasks API
export const tasksAPI = {
  getAll: () => apiCall('/tasks'),
  getById: (id) => apiCall(`/tasks/${id}`),
  getByClient: (clientId) => apiCall(`/tasks/client/${clientId}`),
  getByUser: (userId) => apiCall(`/tasks/user/${userId}`),
  create: (data) => apiCall('/tasks', 'POST', data),
  update: (id, data) => apiCall(`/tasks/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/tasks/${id}`, 'DELETE'),
};
