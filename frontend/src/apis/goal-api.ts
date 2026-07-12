import type { CreateGoalBody, Goal, UpdateGoalBody } from '@/models'

const BASE = `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8787'}/api/v1/goals`

async function request<T>(url: string, options?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
    const json = await res.json()
    if (res.ok) return { ok: true, data: json.data as T }
    return { ok: false, error: json.error?.message ?? 'Request failed' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
  }
}

export const goalApi = {
  list: () => request<Goal[]>(BASE),
  listByUser: (userId: string) => request<Goal[]>(`${BASE}/user/${userId}`),
  get: (id: string) => request<Goal>(`${BASE}/${id}`),
  create: (body: CreateGoalBody) => request<Goal>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateGoalBody) => request<Goal>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => ({ ok: r.ok })),
}
