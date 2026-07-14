import type { CreateHealthLogBody, HealthLog, UpdateHealthLogBody } from '@/models'

const BASE = `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8787'}/api/v1/health-logs`

async function request<T>(url: string, options?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    if (!isJson) return { ok: false, error: 'Backend returned non-JSON. Check VITE_BACKEND_URL.' }
    const json = await res.json()
    if (res.ok) return { ok: true, data: json.data as T }
    return { ok: false, error: json.error?.message ?? 'Request failed' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
  }
}

export const healthLogApi = {
  list: () => request<HealthLog[]>(BASE),
  listByUser: (userId: string) => request<HealthLog[]>(`${BASE}/user/${userId}`),
  get: (id: string) => request<HealthLog>(`${BASE}/${id}`),
  create: (body: CreateHealthLogBody) => request<HealthLog>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateHealthLogBody) => request<HealthLog>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => ({ ok: r.ok })),
}
