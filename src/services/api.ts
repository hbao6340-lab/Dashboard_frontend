// API Service
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const isForm = isFormDataBody(options.body)
  const config: RequestInit = {
    credentials: 'include', // Important for cookies
    ...options,
    headers: {
      // Let the browser set multipart Content-Type (with boundary) for FormData
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  }

  // JSON-stringify plain objects only — never FormData (stringifies to "{}")
  if (config.body !== undefined && config.body !== null && typeof config.body !== 'string' && !isFormDataBody(config.body)) {
    config.headers = { 'Content-Type': 'application/json', ...options.headers }
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(url, config)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data.errorCode || 'API_ERROR',
      data.details
    )
  }

  return data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body: body as BodyInit }),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PATCH', body: body as BodyInit }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PUT', body: body as BodyInit }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

// Auth API
export const authApi = {
  login: (username: string, password: string, rememberMe?: boolean) =>
    api.post<{ success: boolean; data: { user: any } }>('/auth/login', { username, password, rememberMe }),
  
  logout: () => api.post('/auth/logout', {}),
  
  me: () => api.get<{ success: boolean; data: { user: any } }>('/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
}

export { ApiError }