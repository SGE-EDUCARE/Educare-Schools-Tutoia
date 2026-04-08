const API_URL = 'http://localhost:3001/api'

export const api = async (endpoint: string, options: RequestInit = {}) => {
  // Pegando token do zustand storage persistido
  const store = localStorage.getItem('auth-storage')
  let token = ''
  
  if (store) {
    try {
      const parsedStore = JSON.parse(store)
      token = parsedStore.state?.token || ''
    } catch (e) {}
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return response.json()
}
