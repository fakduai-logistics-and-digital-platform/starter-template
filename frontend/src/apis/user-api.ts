import type { CreateUserBody, UpdateUserBody, User, UserListResponse, UserResponse } from '@/models'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/users`

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const userApi = {
  list: () => request<UserListResponse>(BASE),
  get: (id: string) => request<UserResponse>(`${BASE}/${id}`),
  create: (body: CreateUserBody) => request<UserResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateUserBody) => request<UserResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
