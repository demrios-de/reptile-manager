import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login(username, password) {
    const form = new URLSearchParams({ username, password })
    return api.post('/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  me: () => api.get('/auth/me')
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboard = {
  stats: () => api.get('/dashboard')
}

// ── Animals ───────────────────────────────────────────────────────────────────
export const animals = {
  list:        (params) => api.get('/animals', { params }),
  get:         (id)     => api.get(`/animals/${id}`),
  create:      (data)   => api.post('/animals', data),
  update:      (id, d)  => api.put(`/animals/${id}`, d),
  delete:      (id)     => api.delete(`/animals/${id}`),
  feedings:    (id, p)  => api.get(`/animals/${id}/feedings`, { params: p }),
  sheddings:   (id, p)  => api.get(`/animals/${id}/sheddings`, { params: p }),
  tree:        (id)     => api.get(`/animals/${id}/tree`),
  uploadPhoto: (id, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/animals/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deletePhoto: (id) => api.delete(`/animals/${id}/photo`),
}

// ── Feedings ──────────────────────────────────────────────────────────────────
export const feedings = {
  list:   (params) => api.get('/feedings', { params }),
  create: (data)   => api.post('/feedings', data),
  update: (id, d)  => api.put(`/feedings/${id}`, d),
  delete: (id)     => api.delete(`/feedings/${id}`)
}

// ── Sheddings ─────────────────────────────────────────────────────────────────
export const sheddings = {
  list:   (params) => api.get('/sheddings', { params }),
  create: (data)   => api.post('/sheddings', data),
  update: (id, d)  => api.put(`/sheddings/${id}`, d),
  delete: (id)     => api.delete(`/sheddings/${id}`)
}

// ── Breeding ──────────────────────────────────────────────────────────────────
export const breeding = {
  list:   (params) => api.get('/breeding', { params }),
  create: (data)   => api.post('/breeding', data),
  update: (id, d)  => api.put(`/breeding/${id}`, d),
  delete: (id)     => api.delete(`/breeding/${id}`)
}

// ── Custom Fields ─────────────────────────────────────────────────────────────
export const customFields = {
  list:   (animalId)      => api.get(`/custom-fields/animal/${animalId}`),
  create: (animalId, d)   => api.post(`/custom-fields/animal/${animalId}`, d),
  update: (fieldId, d)    => api.put(`/custom-fields/${fieldId}`, d),
  delete: (fieldId)       => api.delete(`/custom-fields/${fieldId}`)
}

// ── Home Assistant ────────────────────────────────────────────────────────────
export const ha = {
  getConfig:  ()    => api.get('/ha/config'),
  updateConfig:(d)  => api.put('/ha/config', d),
  test:       ()    => api.post('/ha/test'),
  sync:       ()    => api.post('/ha/sync')
}

export default api
